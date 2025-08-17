# **❌WARNING 警告 ❌**

**一旦使用这个库**  
**你的类型检查将会失效**  
**尤其在处理句柄中，你甚至可以欺骗 ts 返回一个与原来完全不同的类型**  
**这意味着你将回到 JS**  
**如果你要用这个库，建议手动加类型注释，尤其在最后一个 conditionH/rejectH 处，加一个类型检查关口**  
因为这个库大部分是建立在 getter 和 setter 上的，一旦定义这两个东西，就必须另外加属性  
然而这个库除了预定义 gtr/str 对，并不会额外定义新的属性（_你见过 Object.defineOwnProperty 能定义#字头私有属性么_）  
属性实体是储存在外部`weakMap`储存的  
目前作者正在尝试类型追踪和限制  
~~试了好多次甚至不如他自己推断好~~  
有意大佬请 救————————

_回到 JS 是一种什么样的感觉？_

> ```ts
> // 你说他会有用么
> objStore[key] = result satisfies (typeof objStore)[typeof key];
> // 哪里怪怪的
> ```

# 前情提要

😈 恶魔选项 😈

```json5
//tsconfig.json
"experimentalDecorators": true,
"ts":"^5.2"
```

---

![wallpaper](https://cdn.jsdelivr.net/gh/cinast/cinast.imgsStore/com.gh.rulerDecorators/readme.img/wallpaper.png)

# **装饰器神教 _ruler-DECORATORS_.~~ts~~ js**（实验性阶段）

## 📦 ~~安装~~

```bash
npm install ruler-decorators
```

快了快了

## 🛠️ 主要 API

### 核心装饰器

-   **`$$init`**: **万恶之源**
-   `$setter`: 创建并注册 setter 句柄的装饰器
-   `$getter`: 创建并注册 getter 句柄的装饰器
-   `$debugger`: 调试装饰器（装饰器形态的断点）

### 实用工具

-   `$conditionalWrite`: 条件写入
-   `$conditionalRead`: 条件读取
-   `watchSet`: 值变化监听

### 预设规则

-   `alwaysPositive`: 只接受正数
-   `alwaysNegative`: 只接受负数
-   `minimum`: 最小值限制
-   `maximum`: 最大值限制
-   ~~`onlyTheClassCanRead`~~: 类访问控制
-   ~~`onlyTheClassCanWrite`~~: 类写入控制
-   ~~`onlyTheClassAndSubCanRead`~~: 类访问控制
-   ~~`onlyTheClassAndSubCanWrite`~~: 类写入控制

![alt text](https://cdn.jsdelivr.net/gh/cinast/cinast.imgsStore/public-emoji/balbalbalbla.gif)

## 使用指导

[请见讲台：**`guide.md`**](doc/guide.md)

## 🧪 更多示例

```ts
// 调试示例
class DebugClass {
    @$debugger(true, "Debugging property")
    value = 42;
}

// 数学约束
class MathDemo {
    @rulerDecorators.alwaysPositive
    count: number = 1;
}

// 访问控制
class SecureData {
    @rulerDecorators.onlyTheClassCanWrite(SecureData)
    secret: string = "confidential";
}
```

## ⚠️ 注意事项

-   ⚠️**仅娱乐**⚠️ ，不要用于生产环境中  
     `setterHandlers`、`getterHandlers` 目前是什么东西都有权更改，关于他的管理权我还没做好
-   ℹ️ **必须启用**`experimentalDecorators`
-   ℹ️ 需要 TypeScript 5.2+
-   ⚠️ **一旦**使用`$$init`，这个属性/方法/类 不得再置新的 gtr/setr  
    会直接破坏这个库的运行
-   ℹ️ ~~详见[已知问题文档](./doc/known_issues.md)~~
-   由于更新频繁，文档跟不上，而且有些是吞金鲸帮我写的
    以代码为准

-   谨慎魔改 [`src/type.handles.ts`](src/type.handles.ts)，当心报错 40+

## 🤔 为什么选择这个库？

1.  看不惯 get/set 极其麻烦的写法

    ```ts
    class name {
        #v: string = "";
        public set v(v: string) {
            this.#v = v;
        }
        public get v(): string {
            return this.#v;
        }
    }
    ```

    这是我见过世界上无语的语法

    ![ts2300 because I defined a prop v and a getter v](doc/img/ts2300.png)

    \> _tsc & node 你不可以：标识符 v 重复_

    ## 对比

    ```ts
    class cls {
        #v: string = "";
        public set v(v: string) {
            if ((thisArg, key, v: string) => badWords.includes(v)) return;
            this.#v = v;
        }
        public get v(): string {
            return this.#v;
        }
    }
    ```

    ```ts
    class cls {
        @rulerDecorators.stringExcludes(badWords)
        v: string = "";
    }
    ```

2.  必须一句话解决

3.  柔性类型限制

    ```ts
    class UserForm {
        @$conditionalWrite(
            [(_, __, v) => !isNaN(Number(v))], // 验证是否为数字
            [(_, __, v) => Number(v)] // 自动转换为数字
        )
        age: number = 0;
    }

    // 使用
    const form = new UserForm();
    form.age = "25"; // 自动转换为数字25
    ```

    2.  过分实用

    ```ts
    class Product {
        // 自动保持2位小数，并确保非负数
        @$conditionalWrite(
            [(_, __, v) => v >= 0],
            [
                (_, __, v) => Math.max(0, parseFloat(v.toFixed(2))), // 处理负数和小数位
                (_, __, v) => __Setting.priceWarningEnabled && console.warn(`价格调整为${v}`),
            ]
        )
        price: number = 0;

        // 折扣率自动限制在0-1之间
        @minimum(0)
        @maximum(1)
        discount: number = 0;

        // 自动计算折后价格（只读）
        @$getter((_, __, v) => this.price * (1 - this.discount))
        get finalPrice(): number {
            return 0;
        }
    }
    ```

    3.  小型语言模组

    ```ts
    class I18nStore {
        // 自动返回当前语言版本
        @$conditionalRead(
            [(_, key) => currentLang in this.translations[key]],
            [(_, key) => this.translations[key]["en"]] // 默认返回英文
        )
        getText(key: string): string {
            return "";
        }

        private translations = {
            welcome: {
                en: "Welcome",
                zh: "欢迎",
            },
        };
    }
    ```

## 电子榨菜

[请见文本 VCR：**`devlog.md`**](doc/devlog.md)

## 画饼时间

0. 补完漏洞
1. `src\api.test.ts` 测试用的接口
2. 写点规则
3. 考虑加上 mjs 版本
4. npm publish v0.0.0

<br>

---

[
<img
src="https://avatars.githubusercontent.com/u/126345646?v=4"
style="height: 1rem; width: 1rem; border: 1px solid gold; border-radius: 50%; background: center, center"
title= "@cinast"
/>,
<img
src="https://cdn.jsdelivr.net/gh/cinast/cinast.imgsStore/strangeStuff/%E5%90%9E%E9%87%91%E9%B2%B8.svg"
style="height: 1rem; width: 1rem; border: 1px solid gold; border-radius: 50%; background: center, center"
title= "吞金鲸"
/>
]
_did that doc and the project_  
_And maybe one day you would be in the [ ]_

_脚注：_
图片图片加载不出来可以访问[_cinast.imgsStore_](https://github.com/cinast/cinast.imgsStore/tree/main/com.gh.rulerDecorators)  
~~实在实在不行你直接 git clone~~
