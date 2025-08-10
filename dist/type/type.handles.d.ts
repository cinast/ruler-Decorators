/**
 * @handle_I
 * Handle definition for factoryI
 * Type definition for basic foundation of setter handler
 * setter句柄类型定义
 */
export type rd_SetterHandle = (target: any, attr: string | symbol, value: any, lastResult: unknown, index: number, handlers: rd_SetterHandle[], ...args: any[]) => any;
/**
 * @handle_I
 * Handle definition for factoryI
 * Type definition for basic foundation of getter handler
 * getter句柄类型定义
 */
export type rd_GetterHandle = (target: any, attr: string | symbol, lastResult: unknown, index: number, handlers: rd_GetterHandle[], ...args: any[]) => any;
/**
 * @handle_II
 * Handle definition for factoryII
 * @Waring
 * 如果conditionalHandler最终驳回了读取或者修改 \
 * 但是你设置了reject但不在reject里面进行处理，缺而直接返回了true或者 approach = true \
 * 会直接覆写那个值 或者 条件不符就得到那个值
 */
export type conditionHandler = (thisArg: any, key: string | symbol, value: any, prevResult: {
    approached: boolean;
    output: any;
}, currentIndex: number, handlers: conditionHandler[]) => {
    approached: boolean;
    output: any;
} | boolean;
/**
 * @handle_II
 * Handle definition for factoryII
 * @Waring
 * 如果conditionalHandler最终驳回了读取或者修改 \
 * 但是你设置了reject但不在reject里面进行处理，缺而直接返回了true或者 approach = true \
 * 会直接覆写那个值 或者 条件不符就得到那个值
 */
export type rejectionHandler = (thisArg: any, key: string | symbol, value: any, conditionHandleLastOutput: any, prevResult: {
    approached: boolean;
    output: any;
}, currentIndex: number, handlers: rejectionHandler[]) => {
    approached: boolean;
    output: any;
} | boolean;
//# sourceMappingURL=type.handles.d.ts.map