# 前情提要

😈 恶魔选项 😈

```json5
//tsconfig.json
"experimentalDecorators": true,
"ts":"^5.2"
```

---

![wallpaper](doc/img/gitbub_main/wallpaper.png)

# **装饰器神教 _ruler-DECORATORS_**（实验性阶段）

## ~~📦 安装~~

```bash
npm install ruler-decorators
```

## 🛠️ ~~完整~~ API

### 核心装饰器

-   **`$$init`**: **万恶之源**
-   `$setter`: 创建并注入 setter 句柄的装饰器
-   `$getter`: 创建并注入 getter 句柄的装饰器
-   `$debugger`: 调试装饰器（装饰器形态的断点）

### 实用工具

-   ~~`$conditionalWrite`~~: 条件写入
-   ~~`$conditionalRead`~~: 条件读取
-   ~~`watchSet`~~: 值变化监听

### 预设规则

-   ~~`alwaysPositive`: 只接受正数~~
-   ~~`alwaysNegative`: 只接受负数~~
-   ~~`minimum`: 最小值限制~~
-   ~~`maximum`: 最大值限制~~
-   ~~`onlyTheClassCanRead`: 类访问控制~~
-   ~~`onlyTheClassCanWrite`: 类写入控制~~
-   ~~`onlyTheClassAndSubCanRead`: 类访问控制~~
-   ~~`onlyTheClassAndSubCanWrite`: 类写入控制~~

![alt text](doc/img/balbalbalbla.gif)

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
-   ℹ️ 详见[已知问题文档](./doc/known_issues.md)

## 🤔 为什么选择这个库？

1. 看不惯 get/set 极其麻烦的写法

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
            if (!this instanceof cls) return;
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
        @rulerDecorators.onlyTheClassAndSubCanWrite
        @rulerDecorators.conditionalWrite((thisArg, key, v: string) => badWords.includes(v))
        v: string = "";
    }
    ```
