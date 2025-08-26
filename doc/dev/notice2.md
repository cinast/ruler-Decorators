| 模式                    | 支持度 | 评价       | 现状                                                                 |
| ----------------------- | ------ | ---------- | -------------------------------------------------------------------- |
| Accessor                | 100%   | `夯`       | 百分百支持，大概没什么问题                                           |
| Function-Param-Accessor | 100%   | `人上人`   | 十分强大，你可以统一处理（一条处理链），也可以针对特定参数制定处理链 |
| Property-Proxy          | 0%     | **`废物`** | 难写的要死                                                           |
| Class-Proxy             | 20%    | `npc`      | 除了替代几个驱动函数以外没什么用处                                   |

Function-Param-Accessor

```ts
addParamFilterHandler(
    [
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
        ]
    ],
    rejects[][]
);

addParamFilterHandler(
    {
        // param2
        2:[
            // prase 1
            () => {},
            // prase 2
            () => {
                return {
                    ap: true,
                    ot: ablbalbalb,
                };
            },
        ],
        // param5
        5:[
            () => {},
            () => {
                return {
                    ap: true,
                    ot: ablbalbalb,
                };
            }
        ]
    },
    Record<number,rejects[]>
);

export type paramFilterHandler = (
    thisArg: any,
    methodName: string | symbol,
    method: Function,
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


export type paramFilterChainHandler = (
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
          output: any;
      }
    | boolean;

/**
 * 参数处理器链类型定义
 * 支持数组格式和对象格式的处理器链
 */
export type ParamFilterHandlerChain =
    | paramFilterChainHandler[][] // 数组格式: [param1_handlers, param2_handlers, ...]
    | Record<number, paramFilterChainHandler[]>; // 对象格式: {paramIndex: handlers}
```
