import { rd_Descriptor } from "./rulerDecorators";
import { rd_SetterHandle, rd_GetterHandle, ParamFilterHandlerChain, paramFilterHandler, ParamRejectHandlerChain, paramRejectHandler } from "./type.handles";
/**
 * 标记属性由类代理管理
 */
export declare function $markPropertyAsClassProxyManaged(target: object, propertyKey: string | symbol): void;
/**
 * 检查属性是否由类代理管理
 */
export declare function isPropertyManagedByClassProxy(target: object, propertyKey: string | symbol): boolean;
export declare function hasHandlersFor(target: object, propertyKey: string | symbol): boolean;
/**
 * Set descriptor for target property
 * 设置目标属性的描述符
 */
export declare function setDescriptor(target: object, propertyKey: string | symbol, descriptor: rd_Descriptor): void;
/**
 * Check if target has any descriptors
 * 检查目标是否有任何描述符
 */
export declare function hasDescriptors(target: object): boolean;
/**
 * Get all descriptors for target
 * 获取目标的所有描述符
 */
export declare function getAllDescriptors(target: object): Map<string | symbol, rd_Descriptor> | undefined;
/**
 * Get or create descriptor for target property
 * 获取或创建目标属性的描述符
 */
export declare function getDescriptor(target: object, propertyKey: string | symbol): rd_Descriptor;
/**
 * Get the count of decorated properties for a target
 * 获取目标对象上被装饰的属性数量
 */
export declare function getDecoratedPropertyCount(target: any): number;
/**
 * 获取或创建属性模式映射
 */
export declare function getPropertyModes(target: any): Map<string | symbol, "proxy" | "accessor">;
/**
 * Get or create target map for storage
 * 获取或创建目标存储映射
 */
export declare function getOrCreateTargetMap(target: object): Map<string | symbol, rd_Descriptor>;
/**
 * Create accessor-based interception (traditional getter/setter)
 * 创建基于访问器的拦截（传统 getter/setter）
 */
export declare function createAccessorInterception(instance: any, targetPrototype: any): any;
/**
 * Create property proxy for instance (intercept only decorated properties)
 * 为实例创建属性代理（只拦截被装饰的属性）
 */
export declare function createPropertyProxy(instance: any, prototype: any): any;
/**
 * Create Class Proxy for instance (intercept all properties)
 * 为实例创建全局代理（拦截所有属性）
 */
export declare function createClassProxy(instance: any, prototype: any): any;
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
 * Add parameter handler to specified method
 * 添加参数处理器到指定方法
 */
export declare function $addParamHandler(target: object, methodKey: string | symbol, handler: paramFilterHandler): void;
export declare function $addParamHandler(target: object, methodKey: string | symbol, handlers: ParamFilterHandlerChain): void;
/**
 * Add parameter rejection handler to specified method
 * 添加参数回绝处理器到指定方法
 */
export declare function $addParamRejectionHandler(target: object, methodKey: string | symbol, handler: paramRejectHandler): void;
export declare function $addParamRejectionHandler(target: object, methodKey: string | symbol, handlers: ParamRejectHandlerChain): void;
/**
 * Apply getter handlers for a property
 * 应用属性的 getter 处理器
 */
export declare function $applyGetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any;
/**
 * Apply setter handlers for a property
 * 应用属性的 setter 处理器
 */
export declare function $applySetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any;
/**
 * Apply parameter handlers for a method
 * 应用方法的参数处理器
 */
export declare function $applyParamHandlers(receiver: any, methodKey: string | symbol, method: Function, args: any[]): {
    approached: boolean;
    output: any;
};
/**
 * Apply parameter rejection handlers for a method
 * 应用方法的参数回绝处理器
 */
export declare function $applyParamRejectionHandlers(receiver: any, methodKey: string | symbol, method: Function, args: any[], FilterLastOutput: any): {
    approached: boolean;
    output: any;
};
export declare const createParamWrapperFilter: (handlerChain: ParamFilterHandlerChain) => paramFilterHandler;
export declare const createParamWrapperReject: (handlerChain: ParamRejectHandlerChain) => paramRejectHandler;
//# sourceMappingURL=manage.d.ts.map