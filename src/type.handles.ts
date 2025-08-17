import { __Setting } from "./moduleMeta";

/**
 * @handle_I
 * Core setter handler type for factoryI (base level)
 * 一阶工厂基础setter句柄类型
 *
 * @tip Chainable unit in WeakMap-stored handler chain
 * @tip WeakMap存储的句柄链中的可链式调用单元
 * @chainable Processed via Array.reduce() in execution flow
 * @chainable 通过Array.reduce()实现链式执行
 */
export type rd_SetterHandle<R = any, I = any> = (
    target: any,
    attr: string | symbol,
    value: any,
    lastResult: any,
    index: number,
    handlers: rd_SetterHandle[],
    ...args: any[]
) => any;

/**
 * @handle_I
 * Core getter handler type for factoryI (base level)
 * 一阶工厂基础getter句柄类型
 *
 * @tip Chainable unit in WeakMap-stored handler chain
 * @tip WeakMap存储的句柄链中的可链式调用单元
 * @chainable Processed via Array.reduce() in execution flow
 * @chainable 通过Array.reduce()实现链式执行
 */
export type rd_GetterHandle<R = any, I = any> = (
    target: any,
    attr: string | symbol,
    value: any,
    lastResult: any,
    index: number,
    handlers: rd_GetterHandle[],
    ...args: any[]
) => R;

/**
 * @handle_II
 * Condition handler type for factoryII (conditional level)
 * 二阶工厂条件判断句柄类型
 *
 * @param R type of return, whenever pass or not,  ~~could be limited by `(return).approached` while `__Setting.veryStrict` enabled~~
 *          返回类型限制，不论通过与否，~~可以用`__Setting.veryStrict`根据`(return).approached`限制死返回类型~~
 *
 * @param I type of input, with default of `R`, is optional and could specific the input while that unknown or otherwise
 *          输入类型限制，默认是`R`，在不知道输入的时候有用
 *
 * @tip Used in $conditionalWrite/$conditionalRead decorators
 * @tip 用于条件写入/读取装饰器的条件判断
 * @Waring Returns true/approached without processing will override value
 * @Waring 如果返回true/approached但未处理值，将直接覆盖原值
 */
export type conditionHandler = <R = any, I = any>(
    thisArg: any,
    key: string | symbol,
    value: any,
    prevResult: { approached: boolean; output: I },
    currentIndex: number,
    handlers: conditionHandler[]
) =>
    | {
          approached: true;
          output: R;
      }
    | {
          approached: false;
          output: any | never;
      }
    // | {
    //       approached: false;
    //       output: typeof __Setting.veryStrict extends true ? never : any;
    //   }
    | boolean;

/**
 * @handle_II
 * Rejection handler type for factoryII (conditional level)
 * 二阶工厂拒绝处理句柄类型
 *
 * @param R type of return, whenever pass or not,  ~~could be limited by `(return).approached` while `__Setting.veryStrict` enabled~~
 *          返回类型限制，不论通过与否，~~可以用`__Setting.veryStrict`根据`(return).approached`限制死返回类型~~
 *
 * @param I type of input, with default of `R`, is optional and could specific the input while that unknown or otherwise
 *          输入类型限制，默认是`R`，在不知道输入的时候有用
 *
 * @tip Used when conditions fail in $conditionalWrite/$conditionalRead
 * @tip 用于条件写入/读取装饰器中条件失败时的处理
 * @Waring Returns true/approached without processing will keep original value
 * @Waring 如果返回true/approached但未处理值，将保持原值
 */
export type rejectionHandler = <R = any, I = any>(
    thisArg: any,
    key: string | symbol,
    value: any,
    conditionHandleLastOutput: any,
    prevResult: { approached: boolean; output: I },
    currentIndex: number,
    handlers: rejectionHandler[]
) =>
    | {
          approached: true;
          output: R;
      }
    | {
          approached: false;
          output: any | never;
      }
    // | {
    //       approached: false;
    //       output: typeof __Setting.veryStrict extends true ? never : any;
    //   }
    | boolean;

type PreciseTuple<T, U, V> = [first: T, ...middle: U[], last: V];
