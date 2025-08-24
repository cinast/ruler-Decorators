| 模式                    | 支持度 | 评价       | 现状                                                             |
| ----------------------- | ------ | ---------- | ---------------------------------------------------------------- |
| Accessor                | 100%   | `夯`       | 百分百支持，大概没什么问题                                       |
| Function-Param-Accessor | 60%    | `人上人`   | 也差不多，比较能用，但是后续还要改格式，现在的类型还不是我想要的 |
| Property-Proxy          | 0%     | **`废物`** | 难写的要死                                                       |
| Class-Proxy             | 20%    | `npc`      | 除了替代几个驱动函数以外没什么用处                               |

Function-Param-Accessor

```ts
addParamFilterHandler(
    // param1
    [
        // prase 1
        () => {},
        // prase 2
        () => {},
        // prase 3
        () => {
            return {
                ap: true,
                ot: ablbalbalb,
            };
        },
    ],
    // param2
    [
        () => {},
        () => {
            return {
                ap: true,
                ot: ablbalbalb,
            };
        }
    ],
    [rejects[][]]
);
export type paramFilterHandler = (
    thisArg: any,
    methodName: string | symbol,
    method: Function,
    argIdx: number,
    args: any[],
    prevResult: { approached: boolean; output: any[] },
    currentIndex: number,
    handlers: paramFilterHandler[]
) =>
    | {
          approached: boolean;
          output: any[];
      }
    | boolean;
```
