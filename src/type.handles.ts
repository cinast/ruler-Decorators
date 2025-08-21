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
    lastResult: I,
    index: number,
    handlers: rd_SetterHandle[],
    ...args: any[]
) => R;

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
    lastResult: I,
    index: number,
    handlers: rd_GetterHandle[],
    ...args: any[]
) => R;

/**
 * @handle_II
 * Condition handler type for factoryII (conditional level)
 * 二阶工厂条件判断句柄类型
 *
 * @template R type of return, whenever pass or not
 *          返回类型限制，不论通过与否
 *
 * @template I type of input, with default of `R`, is optional and could specific the input while that unknown or otherwise
 *          输入类型限制，默认是`R`，在不知道输入的时候有用
 *
 * @see rulerDecorators.ts > conditionalR > $getter() callback > callResult > satisfies
 * @see rulerDecorators.ts > conditionalW > $setter() callback > callResult > satisfies
 *
 * @tip Used in $conditionalWrite/$conditionalRead decorators
 * @tip 用于条件写入/读取装饰器的条件判断
 * @Waring Returns true/approached without processing will override value
 * @Waring 如果返回true/approached但未处理值，将直接覆盖原值
 */
export type conditionHandler = (
    thisArg: any,
    key: string | symbol,
    value: any,
    prevResult: { approached: boolean; output: any },
    currentIndex: number,
    handlers: conditionHandler[]
) =>
    | {
          approached: boolean;
          output: any;
      }
    | boolean;

/**
 * @handle_II
 * Rejection handler type for factoryII (conditional level)
 * 二阶工厂拒绝处理句柄类型
 *
 * @template R type of return, whenever pass or not
 *          返回类型限制，不论通过与否
 *
 * @template I type of input, with default of `R`, is optional and could specific the input while that unknown or otherwise
 *          输入类型限制，默认是`R`，在不知道输入的时候有用
 *
 * @see rulerDecorators.ts > conditionalR > $getter() callback > rejectResult > satisfies
 * @see rulerDecorators.ts > conditionalW > $setter() callback > rejectResult > satisfies
 *
 * @tip Used when conditions fail in $conditionalWrite/$conditionalRead
 * @tip 用于条件写入/读取装饰器中条件失败时的处理
 * @Waring Returns true/approached without processing will keep original value
 * @Waring 如果返回true/approached但未处理值，将保持原值
 */
export type rejectionHandler = (
    thisArg: any,
    key: string | symbol,
    value: any,
    conditionHandleLastOutput: any,
    prevResult: { approached: boolean; output: any },
    currentIndex: number,
    handlers: rejectionHandler[]
) =>
    | {
          approached: boolean;
          output: any;
      }
    | boolean;

type PreciseTuple<T, U, V> = [first: T, ...middle: U[], last: V];

/**
 * @handle_II
 * Parameter handler type for function-param-accessor mode
 * 函数参数访问器模式的参数处理器类型
 *
 * @template R type of return, processed arguments or boolean for condition
 *          返回类型，处理后的参数或布尔值用于条件判断
 *
 * @tip Used in function-param-accessor mode for method parameter interception
 * @tip 用于函数参数访问器模式的方法参数拦截
 * @Waring Returns true/approached without processing will allow original call
 * @Waring 如果返回true/approached但未处理参数，将允许原始调用
 */
export type paramHandler = (
    thisArg: any,
    methodName: string | symbol,
    method: Function,
    args: any[],
    prevResult: { approached: boolean; output: any[] },
    currentIndex: number,
    handlers: paramHandler[]
) =>
    | {
          approached: boolean;
          output: any[];
      }
    | boolean;

/**
 * @handle_II
 * Parameter rejection handler type for function-param-accessor mode
 * 函数参数访问器模式的参数拒绝处理器类型
 *
 * @tip Used when parameter conditions fail in function-param-accessor mode
 * @tip 用于函数参数访问器模式中参数条件失败时的处理
 */
export type paramRejectionHandler = (
    thisArg: any,
    methodName: string | symbol,
    method: Function,
    args: any[],
    conditionHandleLastOutput: any,
    prevResult: { approached: boolean; output: any[] },
    currentIndex: number,
    handlers: paramRejectionHandler[]
) =>
    | {
          approached: boolean;
          output: any[];
      }
    | boolean;
