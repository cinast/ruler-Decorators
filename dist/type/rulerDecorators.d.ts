import { rd_GetterHandle, rd_SetterHandle, conditionHandler, rejectionHandler } from "./type.handles";
/**
 * Add setter handler to specified property
 * 添加 setter 句柄到指定属性
 */
export declare function $addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void;
/**
 * Add getter handler to specified property
 * 添加 getter 句柄到指定属性
 */
export declare function $addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void;
/**
 * Remove setter handler from specified property
 * 从指定属性移除 setter 句柄
 */
export declare function $removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean;
/**
 * Remove getter handler from specified property
 * 从指定属性移除 getter 句柄
 */
export declare function $removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean;
/**
 * Decorator factory: creates adaptive decorator with multiple mode implementation
 * 装饰器工厂：使用多模式实现创建自适应装饰器
 */
export declare const $$init: <T = any, R = T>(initialSetters?: rd_SetterHandle[], initialGetters?: rd_GetterHandle[], mode?: "global-proxy" | "property-proxy" | "accessor" | "auto") => (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
/**
 * Setter handler decorator factory
 * Setter句柄装饰器工厂
 */
export declare function $setter<R = any, I = R>(handle: rd_SetterHandle<R, I>): PropertyDecorator & MethodDecorator;
/**
 * Getter handler decorator factory
 * Getter句柄装饰器工厂
 */
export declare function $getter<R = any, I = R>(handle: rd_GetterHandle<R, I>): PropertyDecorator & MethodDecorator;
/**
 * Conditional write decorator factory
 * 条件写入装饰器工厂
 */
export declare const $conditionalWrite: <R = any, I = R>(errorType: "ignore" | "Warn" | "Error", conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) => PropertyDecorator & MethodDecorator;
/**
 * Conditional read decorator factory
 * 条件读取装饰器工厂
 */
export declare const $conditionalRead: <R = any, I = R>(errorType: "ignore" | "Warn" | "Error", conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) => PropertyDecorator & MethodDecorator;
/**
 * rulers & libSetting
 */
export * as rulerDecorators from "./rulesLibrary";
export * from "./extraLibraries/extraMod.router";
//# sourceMappingURL=rulerDecorators.d.ts.map