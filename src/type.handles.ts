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
export type rd_SetterHandle<TInput = any, TOutput = TInput> = (
    target: any,
    attr: string | symbol,
    value: TInput,
    lastResult: TInput,
    index: number,
    handlers: rd_SetterHandle<any, any>[],
    ...args: any[]
) => TOutput;

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
export type rd_GetterHandle<TInput = any, TOutput = TInput> = (
    target: any,
    attr: string | symbol,
    value: any,
    lastResult: TInput,
    index: number,
    handlers: rd_GetterHandle<any, any>[],
    ...args: any[]
) => TOutput;

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
export type conditionHandler<TInput = any, TOutput = TInput> = (
    thisArg: any,
    key: string | symbol,
    value: any,
    prevResult: TInput | { approached: boolean; output: any },
    currentIndex: number,
    handlers: conditionHandlerPipe<TInput, TOutput>
) => TOutput | boolean | { approached: boolean; output: TOutput };
export type aconditionHandler<TInput = any, TOutput = TInput> = (
    thisArg: any,
    key: string | symbol,
    value: any,
    prevResult: TInput | { approached: boolean; output: any },
    currentIndex: number,
    handlers: conditionHandlerPipe<TInput, TOutput>
) => TOutput | boolean | { approached: boolean; output: TOutput };

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
export type rejectionHandler<TInput = any, TOutput = TInput> = (
    thisArg: any,
    key: string | symbol,
    value: any,
    conditionHandleLastOutput: { approached: boolean; output: TOutput },
    prevResult: { approached: boolean; output: any },
    currentIndex: number,
    handlers: rejectionHandlerPipe<TInput, TOutput>
) => TOutput | boolean | { approached: boolean; output: TOutput };

type PreciseTuple<T, U, V> = [first: T, ...middle: U[], last: V];

export type conditionHandlerPipe<I, R> =
    | PreciseTuple<conditionHandler<I, any>, conditionHandler<any, any>, conditionHandler<any, R>>
    | [conditionHandler<I, any>, conditionHandler<any, R>]
    | [conditionHandler<I, R>]
    | [];

export type rejectionHandlerPipe<I, R> =
    | PreciseTuple<rejectionHandler<I, any>, rejectionHandler<any, any>, rejectionHandler<any, R>>
    | [rejectionHandler<I, any>, rejectionHandler<any, R>]
    | [rejectionHandler<I, R>]
    | [];

type a = PreciseTuple<string, number, boolean>;
