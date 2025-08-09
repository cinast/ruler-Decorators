/**
 * @handle_I
 * Handle definition for factoryI
 * Type definition for basic foundation of setter handler
 * setter句柄类型定义
 */
export type rd_SetterHandle = (
    target: any,
    attr: string | symbol,
    value: any,
    lastResult: unknown,
    index: number,
    handlers: rd_SetterHandle[],
    ...args: any[]
) => any;

/**
 * @handle_I
 * Handle definition for factoryI
 * Type definition for basic foundation of getter handler
 * getter句柄类型定义
 */
export type rd_GetterHandle = (
    target: any,
    attr: string | symbol,
    lastResult: unknown,
    index: number,
    handlers: rd_GetterHandle[],
    ...args: any[]
) => any;

/**
 * @handle_II
 * Handle definition for factoryII
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
 * Handle definition for factoryII
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
