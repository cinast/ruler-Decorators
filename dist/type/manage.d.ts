import { rd_Descriptor } from "./rulerDecorators";
import { rd_SetterHandle, rd_GetterHandle, paramHandler, paramRejectionHandler } from "./type.handles";
/**
 * Get or create target map for storage
 * 获取或创建目标存储映射
 */
export declare function getOrCreateTargetMap(target: object): Map<string | symbol, rd_Descriptor>;
/**
 * Get or create descriptor for target property
 * 获取或创建目标属性的描述符
 */
export declare function getDescriptor(target: object, propertyKey: string | symbol): rd_Descriptor;
/**
 * Set descriptor for target property
 * 设置目标属性的描述符
 */
export declare function setDescriptor(target: object, propertyKey: string | symbol, descriptor: rd_Descriptor): void;
/**
 * Get all descriptors for target
 * 获取目标的所有描述符
 */
export declare function getAllDescriptors(target: object): Map<string | symbol, rd_Descriptor> | undefined;
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
export declare function $addParamHandler(target: object, methodKey: string | symbol, handler: paramHandler): void;
/**
 * Add parameter rejection handler to specified method
 * 添加参数拒绝处理器到指定方法
 */
export declare function $addParamRejectionHandler(target: object, methodKey: string | symbol, handler: paramRejectionHandler): void;
/**
 * 获取或创建属性模式映射
 */
export declare function getPropertyModes(target: any): Map<string | symbol, "proxy" | "accessor">;
//# sourceMappingURL=manage.d.ts.map