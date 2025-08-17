/**
 * @handle_I
 * Core setter handler type for factoryI (base level)
 * 一阶工厂基础setter句柄类型
 *
 * @core_concept Chainable unit in WeakMap-stored handler chain
 * @core_concept WeakMap存储的句柄链中的可链式调用单元
 * @chainable Processed via Array.reduce() in execution flow
 * @chainable 通过Array.reduce()实现链式执行
 */
export type rd_SetterHandle<I = any, R = I> = (
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
 * @core_concept Chainable unit in WeakMap-stored handler chain
 * @core_concept WeakMap存储的句柄链中的可链式调用单元
 * @chainable Processed via Array.reduce() in execution flow
 * @chainable 通过Array.reduce()实现链式执行
 */
export type rd_GetterHandle<I = any, R = I> = (
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
 * @core_concept Used in $conditionalWrite/$conditionalRead decorators
 * @core_concept 用于条件写入/读取装饰器的条件判断
 * @Waring Returns true/approached without processing will override value
 * @Waring 如果返回true/approached但未处理值，将直接覆盖原值
 */
export type conditionHandler<I = any, R = I> = (
    thisArg: any,
    key: string | symbol,
    value: any,
    prevResult: I | { approached: boolean; output: any },
    currentIndex: number,
    handlers: conditionHandler[]
) => { approached: boolean; output: any };

/**
 * @handle_II
 * Rejection handler type for factoryII (conditional level)
 * 二阶工厂拒绝处理句柄类型
 *
 * @core_concept Used when conditions fail in $conditionalWrite/$conditionalRead
 * @core_concept 用于条件写入/读取装饰器中条件失败时的处理
 * @Waring Returns true/approached without processing will keep original value
 * @Waring 如果返回true/approached但未处理值，将保持原值
 */
export type rejectionHandler<I = any, R = I> = (
    thisArg: any,
    key: string | symbol,
    value: any,
    conditionHandleLasR: { approached: boolean; output: R },
    prevResult: { approached: boolean; output: any },
    currentIndex: number,
    handlers: rejectionHandler[]
) => { approached: boolean; output: any };

type PreciseTuple<T, U, V> = [first: T, ...middle: U[], last: V];

export type conditionHandlerPipe<I, R> =
    | PreciseTuple<conditionHandler<I, any>, conditionHandler<any, any>, conditionHandler<any>>
    | [conditionHandler<I, any>, conditionHandler<any, reducePipeHandlerReturn<R>>]
    | [conditionHandler<any, reducePipeHandlerReturn<R>>]
    | [];

export type rejectionHandlerPipe<I, R> =
    | PreciseTuple<rejectionHandler<I, any>, rejectionHandler<any, any>, rejectionHandler<any, reducePipeHandlerReturn<R>>>
    | [rejectionHandler<I, any>, rejectionHandler<any, reducePipeHandlerReturn<R>>]
    | [rejectionHandler<any, reducePipeHandlerReturn<R>>]
    | [];

export type reducePipeHandlerReturn<R> =
    | {
          approached: true;
          output: R;
      }
    | {
          approached: false;
          output: any;
      };
