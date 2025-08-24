# 原理&注意事项

_注：目前不考虑参数装饰器_

## **初始化部署装饰器** `@$$init()`

这个库的效果大多数都是依靠 getter 和 setter 等一些列操作 trapper 驱动的。
通过装饰器隐式规定规则，trap 钩子 作为执行机制。

而且借助装饰器自 定义 开始就执行的特性（在初始赋值前）
可以街篮所有操作

> ### 简述 trapper
>
> trapper，陷阱，操作的陷阱
>
> ```ts
> {
>    get(){}
>    set(){}
> }
> ```
>
> 这是一个简单的陷阱，也被称为 _accessor_（访问器）  
> 属性描述符`Object.getOwnPropertyDescriptor()`里经常见到这两，  
> 总是在修改某值或者访问某值的时候被触发  
> 如果说有个绊线钩，描述符里`get`和`set`就是钩子，访问和赋值的**操作** 就是**触发**了**陷阱的钩子**，`get()`导致触发了函数  
> 因为整个过程隐秘不为人知，所以被称之为陷阱

_然而陷阱种类不止这两个，[mdn:Proxy](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy) 讲解了其他的操作陷阱_

**初始化过程：**

1. 初始化两个 WeakMap 外部存储：

    - `descriptorStorage: WeakMap<object, Map<string | symbol, rd_Descriptor>>` - 存储属性描述符配置
    - `valueStorage: WeakMap<object, Map<string | symbol, any>>` - 存储属性实际值
    - 其他内部存储用于管理句柄和状态

2. 将目标属性转换为一对 getter 和 setter （assessor 模式）或者
   在属性描述符里注册代理

## **多模式拦截机制**

这里有 3 种装饰器可以搭载 4 种拦截模式:

### 1. Accessor 模式（默认）

搭载于*PropertyDecorator*

-   使用传统的 getter/setter
-   值存储在闭包变量或 valueStorage 中
-   适用于简单属性拦截

### 2. Property-Proxy 模式

搭载于*PropertyDecorator*（需要显示配置）

-   为特定属性创建 Proxy
-   值存储在原始对象上
-   适用于需要深度监控的场景

### 3. Class-Proxy 模式

搭载于*ClassDecorator*（需要显示配置）

-   为整个类创建 Proxy
-   统一管理所有属性拦截
-   值存储在原始对象上

### 4. Function-Param-Accessor 模式

搭载于*MethodDecorator*或*PropertyDecorator*（函数属性）

-   专门处理方法参数
-   在函数调用前预处理参数

## **值存储机制**

不同模式下值的存储位置：

| 模式                    | 值存储位置              | 访问方式                     |
| ----------------------- | ----------------------- | ---------------------------- |
| Accessor                | 闭包变量或 valueStorage | 通过 getter/setter           |
| Property-Proxy          | 原始对象属性            | 通过 Reflect.get/Reflect.set |
| Class-Proxy             | 原始对象属性            | 通过 Reflect.get/Reflect.set |
| Function-Param-Accessor | 不存储（临时值）        | 函数调用时处理               |

## **拦截模式`$setter`与`$getter`**

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

这些句柄是钩子，针对的是某方面的操作的钩子，  
例如 赋值是 set，访问是 get  
他们会在进行某某操作的时候触发，  
（_早期称之为一阶句柄_）  
有例：  
你对赋值方面有特别的要求，就用$setter  
以`$conditionalWrite`为例

## **规则句柄**

```ts
export const $conditionalWrite = <T = any>(conditionHandles: FilterHandler[], rejectHandlers?: rejectionHandler[]) =>
    $setter<T>((thisArg, key, newVal) => { ... } )
```

他加入了一种限制写入的逻辑，  
和我要求就通过，不合我要求就打回  
通过就直接复写上去，不通过还有一次处理的机会  
如果后续也不通过，那就不覆写上去

用了一个$setter 回调，意思就是说他针对赋值的操作，而且加了额外的限制和功能
像这样子的函数就叫规则句柄了

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

我可不愿意一直写`$conditionalWrite`  
但是我们可以利用这些函数制定具体的规则详细的规则，毕竟他们也是工厂  
就如上面这个，它是建立在条件写入之上的，不允许负值写入

这个函数叫更加具体的规则句柄  
不过你也应该看出来了  
目前 rd 库没法做强制的类型限制，所以会出现一些荒唐的结果
你要记得在最后一个回调上加入一个检查关口

```ts
export const $conditionalWrite = <T = any>(errorType: "ignore" | "Warn" | "Error", ,conditionHandles: FilterHandler[], rejectHandlers?: rejectionHandler[]) =>{
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

有了关口但是类型不对怎么办  
没关系只需要在 approached 填 false，报错脚本会帮你解决

```ts
            ...
            if (rejectResult.approached) return rejectResult.output;

            const warningMsg = `Property '${String(key)}' write rejected. Final output: ${JSON.stringify(
                rejectResult.output
            )}, and the value keep still.`;
            switch (errorType || __Setting["$conditionalWR.defaultErrorType"]) {
                case "Warn":
                    console.warn(`⚠️ ${warningMsg}`);
                    break;
                case "Error":
                    throw new Error(`🚫 ${warningMsg}`);
            }
        }
        return thisArg[key];
    });
```

## **句柄之间的信息交流载体——处理对象**

库中使用 `{ approached: boolean, output: any }` 结构作为处理对象：

-   `approached`: 表示处理是否通过
-   `output`: 处理后的值

这种设计允许处理链中的每个处理器决定是否中断处理，以及提供处理后的值。

## **注意事项**

1. 不要直接使用 `target[key]`，使用处理器提供的 `value` 参数
2. 类型检查在装饰器中受限，需要谨慎处理
3. 避免在属性描述符中使用 `this`
4. 描述符有 `get/set` 就没有 `value`（ES 规范）
5. 不要混合使用不同模式
6. 属性可能没有描述符（刚定义时）
7. Assessor 模式的驱动 gtr/str 对在原型上

——@cinast  
2025/8/24
