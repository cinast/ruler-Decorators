_fk，和编译器斗智斗勇了三百天，怎么还写不完啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊_

# 前情提要

😈 恶魔选项 😈

```json5
//tsconfig.json
"experimentalDecorators": true,
"ts":"^5.2"
```

# **装饰器神教 _ruler-DECORATORS_**<br>（实验性阶段）

以下是你为什么选择这个库的原因：

## 📦 安装

```bash
npm install ruler-decorators
```

## 🛠️ 完整 API

### 核心装饰器

-   `$setter`: 创建 setter 装饰器
-   `$getter`: 创建 getter 装饰器
-   `$debugger`: 调试装饰器

### 实用工具

-   `$conditionalWrite`: 条件写入
-   `$conditionalRead`: 条件读取
-   `watchSet`: 值变化监听

### 预设规则

-   `alwaysPositive`: 只接受正数
-   `alwaysNegative`: 只接受负数
-   `minimum`: 最小值限制
-   `maximumZero`: 最大值限制
-   `onlyTheClassCanRead`: 类访问控制
-   `onlyTheClassCanWrite`: 类写入控制

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

-   详见[已知问题文档](./doc/known_issues.md)
-   需要 TypeScript 5.2+
-   必须启用`experimentalDecorators`

## 🤔 为什么选择这个库？

1. 看不惯 get/set 极其诡异的写法

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

    我去你的 get 和 set，这是我见过世界上最蠢的语法

    ![ts2300 because I defined a prop v and a getter v](doc/img/ts2300.png)

    为什么 getter**名字**不能是 v，我要 get 的东西他就是 v

    \> _tsc & node 你不可以：标识符 v 重复_

    所以写一个一样的名字如何了？？  
    还要绕个弯子架空原来的变量

    ## 对比

    ```ts
    class name {
        @rulerDecorators.onlyTheClassAndSubCanWrite;
        @rulerDecorators.conditionalWrite((thisArg, key, v: string) => badWords.includes(v));
        v: string = "";
    }
    ```
