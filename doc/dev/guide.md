# 原理&注意事项

_注：目前只考虑属性装饰器_

## **驱动底层 | 规则注册装饰器**

```ts
@$$init()
```

有一些效果是需要定义开始就持续无穷的  
虽然直接写 gtr/str，但是太蠢，太暴露，太没有语义  
**我要隐式规定，那么装饰器是最好的开始，**  
**gtr/str 是我的爪牙。**

**这个库的效果大多数都是依靠 getter 和 setter 驱动的。**  
先把目标属性和换成一对 getter 和 setter  
`@$$init(str[],gtr[])`
然后给四个 weakMap 外储初始化，以 target 参数为键

-   `instanceStorage:WeakMap<object, InstanceStorageValue>` 储存（不直接访问）（长期储存直到 target 被丢进垃圾桶）  
    ~~（当然不知道能不能检测到）~~
-   `wrapperCache:WeakMap<object, Record<string | symbol, Function>>` 包装缓存（一般问他要值）（有值发生变更时废除重写，直到 target 被丢进垃圾桶）
-   `setterHandlers:WeakMap<object, Map<string | symbol, rd_SetterHandle[]>>` str 句柄储存
-   `getterHandlers:WeakMap<object, Map<string | symbol, rd_GetterHandle[]>>` gtr 句柄储存

预期的生命周期应该要和 JS 回收机制一样（大佬救我）（  
`wrapperCache`当初是 ds 写的，我没搞懂这个

由于 descriptor 规定 value 与 gtr/str 不能同时出现，  
也就是说**初始化这个属性架空了**。  
后续形式上的赋值，包括后于装饰器调用的初始值初始化，  
**都是在问 gtr 的事**。

> 附：幕后主使、核心驱动—— 一对 setter 与 getter
>
> `$$init > return:: descriptor`**:**
>
> ```ts
> set(this: any, value: any) {
>    let objStore = instanceStorage.get(this);
>    if (!objStore) {
>        objStore = {};
>        instanceStorage.set(this, objStore);
>    }
>
>    // 获取当前 setter 句柄链
>    const setters = setterHandlers.get(targetObj)?.get(key) || [];
>
>    // 执行句柄链
>    const result = setters.reduce(
>        (prev, handler, idx, arr) => {
>            const newVal = handler(this, key, value, prev, idx, [...arr]);
>            return newVal;
>        },
>        value // 初始值使用传入的value
>    );
>
>    // 存储处理结果
>    objStore[key] = result;
>
>    // 清除包装缓存
>    const wrapperMap = wrapperCache.get(this);
>    if (wrapperMap) {
>        delete wrapperMap[key];
>    }
> },
>
> // 统一的 getter 处理
> get(this: any) {
>    // 获取当前 getter 句柄链
>    const getters = getterHandlers.get(targetObj)?.get(key) || [];
>
>    // 解析基础值
>    let baseValue: any;
>    const objStore = instanceStorage.get(this) || {};
>
>    if (key in objStore) {
>        // 实例自有值
>        baseValue = objStore[key];
>    } else {
>        // 原型链上的值（方法/访问器）
>        const protoStore = instanceStorage.get(targetObj) || {};
>        baseValue = protoStore[key];
>    }
>
>    // 特殊处理：方法装饰器
>    if (typeof baseValue === "function") {
>        let wrapperMap = wrapperCache.get(this);
>        if (!wrapperMap) {
>            wrapperMap = {};
>            wrapperCache.set(this, wrapperMap);
>        }
>
>        // 使用缓存或创建新包装
>        if (!wrapperMap[key]) {
>            wrapperMap[key] = function (this: any, ...args: any[]) {
>            let result = baseValue.apply(this, args);
>
>            // 应用 getter 链（对返回值处理）
>                return getters.reduce((prev, handler, idx, arr) => handler(this, key, prev, idx, [...arr]),result);
>            };
>        }
>        return wrapperMap[key];
>    }
>
>    // 常规属性处理
>    return getters.reduce((prev, handler, idx, arr) => handler(this, key, prev, idx, [...arr]), baseValue);
> },
> /** @2025-8-10 */
> ```

在这个 gtr/str 函数里面再叠加一层调用，用 `Arr.reduce` 的方法调用句柄链  
 你可以实现跨规则传递处理信息的能力（例子见下文）

```ts
(handlersI[]).reduce(
    (prev, handler, idx, arr) => handler(this, key, value, prev, idx, [...arr]),
    (*nonlocal*) input
);
```

> ### 注意
>
> 有几个有趣的现象：
> 如果用的是属性装饰器，  
> 那么这个**用的装饰器的类的实例**  
> **它的对应属性将不会有描述符**，_即`undefined`_。  
> 这时如果你去打印这个实例，你会发现这个实例它有值，  
> 诶？难道不应该是一对 getter 和 setter 吗？  
> 如果你去**找他的原型**，也就是那个类 class，  
> 你会发现**那地方确实是一对 getter 和 setter**  
> 哦原来示例上的那个值是傀儡，幕后操纵者是原型的 getter 和 setter。  
> 不得不说十分隐蔽
>
> 这件事情你得问 es 他们怎么想的

你能看到在 demo 里面有十分多的规则可以应用在同一个属性上  
但是在平常这对于属性描述符来说这是完全不可能的  
因为一个属性描述符**只能有*一个* gtr 和 _一个_ str**

**所以原来加架这个属性上的 getter 和 setter 他们并不执行任何具体的规则**，  
**他们是调用你定义的规则的。**  
基于这个主意，
句柄的概念诞生了

## **零阶工厂`$setter`与`$getter`**

这是两个装饰器工厂，也可以说是两个**自动**句柄注册器。  
虽然说有四但四个函数就够了，但是我们要的是一开始就有的、就执行的那种效果
还要有自动初始化的功能  
于是就有了第一重构建——自动化  
**_建立在`addXXXHandler`和`$$init`之上，自动操作句柄_**

## **基本处理模式（_一阶构构工厂_）`factoryI` 之句柄（_一阶句柄_）`handleI`** <br>_与多阶构建问题_

```ts
/**
 * @handle_I
 * Handle definition for factoryI
 * Type definition for basic foundation of setter handler
 * setter句柄类型定义
 */
export type rd_SetterHandle = (
    target: any,
    attr: string | symbol,
    value: any,
    lastResult: unknown,
    index: number,
    handlers: rd_SetterHandle[],
    ...args: any[]
) => any;

/**
 * @handle_I
 * Handle definition for factoryI
 * Type definition for basic foundation of getter handler
 * getter句柄类型定义
 */
export type rd_GetterHandle = (
    target: any,
    attr: string | symbol,
    lastResult: unknown,
    index: number,
    handlers: rd_GetterHandle[],
    ...args: any[]
) => any;

/** @2025-8-10 */
```

这些句柄是处于概念底层上的句柄  
他们制作**规则的处理模式**，同时具有**总的、大纲、方针式**的特点  
他们**直接决定 建立他们之上的规则条目 将以如何模式运作**  
也就是说你的规则好不好写得问他们  
然而直接不好描述，以`$conditionalWrite`为例

```ts
export const $conditionalWrite = <T = any>(conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) =>
    $setter<T>((thisArg, key, newVal) => { ... } )
```

他实际上是`$setter`一重扩展，并且加入了和 rd_xxxHandle 一样的调用模式 之 规则句柄（二阶句柄）`handleII`（见下篇）

```ts
export const alwaysPositive = $conditionalWrite<bigint | number>(
    [
        (thisArg, key, v: bigint | number) => {
            return v > 0;
        },

        (thisArg, key, v: bigint | number, p) => {
            console.log("A:alwaysPositive validator called with:", v);
            console.log("A:And I think:" + p.approached ? "yes that can be" : "I think no");
        },
    ],
    [
        (_, __, ___, p) => {
            console.log("Me:WHAT?! EVEN NOT PASSED");
            console.log("Me:FXXK U, IM THE GOD WHO CANT DISOBEY MY ORDER");
            return {
                approached: true,
                output: "u#ffff",
            };
        },
    ]
);
```

虽然说你直接可以在一阶句柄之上就写这个规则，但他不大好用  
这个一阶工厂，相较于$setter，他更加灵活  
你可以加好几个“Promise.then”，没通过了还可以加 reject  
想去调试也可以在末尾再加一个 callback 然后 log 一下  
~~实在不行还可以欺骗欺骗 tsc~~

```ts
export const $conditionalWrite = <T = any>(conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) =>{
    return $getter((thisArg, key, value) => {
        const callResult = conditionHandles.reduce(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, value, lastProcess, idx, arr);
                return typeof r == "boolean"
                    ? {
                          approached: r,
                          output: lastProcess.output,
                      }
                    : r;
            },
            {
                approached: true,
                output: value,
            }
        );
    //脚注：reject类似
    ...
```

他这里还有单独的二阶句柄群，在概念上完全与一阶句柄隔开
他们是具体的规则描述，也是处理这些值的细化流水线
他们有更加清晰的语义

同时这个函数还有其他功能，类似 tsc 的类型检查，~~但完全不严格（）~~

```ts
            ...
            if (rejectResult.approached) return rejectResult.output;
            // 默认拒绝行为
            if (__Setting.readOnlyPropertyWarningEnabled) {
                const warningMsg = `Property '${String(key)}' read rejected. Final output: ${JSON.stringify(
                    rejectResult.output
                )}`;
                switch (__Setting.readOnlyPropertyWarningType) {
                    case "Warning":
                        console.warn(`⚠️ ${warningMsg}`);
                        break;
                    case "Error":
                        throw new Error(`🚫 ${warningMsg}`);
                }
            }
            return void 0; // Fallback to void
        }
    });
};
```

这个函数是第二重构建，在原有的基础上面又添加了一些新功能

### 讨论：关于更高阶的构建

```ts
class cls {
    @$$init()
    @$setter<number>((thisArg, attr, v) => (v > 0 ? v : thisArg[attr]))
    @$conditionalWrite<number>([(thisArg, attr, v) => v > 0])
    @rulerDecorators.alwaysPositive
    n = 0;
}
```

你看哪个更好用呢

@$setter`[factoryI]`虽然说可以改成接收多个句柄，但是又有时候未免显得概念混淆  
我宁愿多加几个@$setter 愿不愿意填多个句柄

@$conditionalWrite`[factoryII]` 有更好的语义，功能也更强大，费点电子笔墨，还可以加异常处理  
不过遇到 somehow 的报错时，我劝你还是检查括号或者重写一遍（

@rulerDecorators.alwaysPositive`[factoryIII]()` 一句千言，简单明了  
大不了加个括号填个 reject 进去

图：_写$conditionalWrite()时返回内容不对或者忘记了写报的令人一头雾水的错_

> _哦，我我忘记写 return 了_ ![alt text](https://cdn.jsdelivr.net/gh/cinast/cinast.imgsStore/com.gh.rulerDecorators/err_conditionalWrite.png)

——@cinast
2025/8/10
