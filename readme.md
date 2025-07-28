# 前情提要

😈 恶魔选项 😈

```json
//tsconfig.json
"experimentalDecorators": true
```

# **装饰器神教 _ruler-DECORATORS_** <br> `NOT WELL PREPEARED`

以下是你为什么选择这个库的原因：

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
        @propRules.onlyTheClassAndSubCanWrite
        @$setter((thisArg, key, v: string) => (badWords.includes(v) ? thisArg[key] : v))
        v: string = "";
    }
    ```
