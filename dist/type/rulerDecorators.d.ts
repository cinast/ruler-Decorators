import { rd_GetterHandle, rd_SetterHandle, filterHandler, rejectionHandler, paramHandler, paramRejectionHandler } from "./type.handles";
export declare type drivingMod = "proxy" | "accessor";
export declare type drivingModeWithAuto = drivingMod | "auto";
/**
 * mod list
 * - proxy     (class proxy)
 * - proxy     (property proxy)
 *              *used on `Array` `Object`
 * - accessor  (normal getter&setter)
 * - accessor* (specific accessor for function param)
 */
export declare type $interceptionModes = "class-proxy" | "property-proxy" | "accessor" | "function-param-accessor";
export declare type decoratorType = "ClassDecorator" | "PropertyDecorator" | "MethodDecorator" | "ParameterDecorator";
export declare type rd_Descriptor = {
    proxyInstance?: object;
    originalInstance?: object;
    setters?: rd_SetterHandle[];
    getters?: rd_GetterHandle[];
    paramHandlers?: paramHandler[];
    paramRejectHandlers?: paramRejectionHandler[];
    interceptionEnabled: boolean;
    propertyMode?: "proxy" | "accessor";
    interceptionModes: $interceptionModes;
    ClassProxyEnabled?: boolean;
    configurable?: boolean;
    enumerable?: boolean;
    writable?: boolean;
    metadata?: {
        createdAt: Date;
        lastModified: Date;
        version: string;
        dependencies?: string[];
    };
};
/**
 * Unified Storage for decorated things
 * 统一的存储
 */
export declare const Storage: WeakMap<object, Map<string | symbol, rd_Descriptor>>;
export declare function $$init<T = any, R = T>(...args: any[]): (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
/**
 * 全局Proxy类装饰器
 * 显式启用全局代理拦截
 */
export declare function $ClassProxy(): ClassDecorator;
/**
 * 属性级Proxy装饰器
 * 为特定属性启用Proxy模式拦截
 */
export declare function $PropertyProxy(): PropertyDecorator;
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
 * Parameter check handler decorator factory
 * 参数检查句柄装饰器工厂
 */
export declare function $paramChecker(handle: paramHandler, rejectHandle?: paramRejectionHandler): MethodDecorator;
/**
 * Conditional write decorator factory
 * 条件写入装饰器工厂
 */
export declare const $conditionalWrite: <R = any, I = R>(errorType: "ignore" | "Warn" | "Error", conditionHandles: filterHandler[], rejectHandlers?: rejectionHandler[]) => PropertyDecorator & MethodDecorator;
/**
 * Conditional read decorator factory
 * 条件读取装饰器工厂
 */
export declare const $conditionalRead: <R = any, I = R>(errorType: "ignore" | "Warn" | "Error", conditionHandles: filterHandler[], rejectHandlers?: rejectionHandler[]) => PropertyDecorator & MethodDecorator;
/**
 * types
 */
export * from "./type.handles";
/**
 * operation fn
 */
export * from "./manage";
export * as rulerDecorators from "./rulesLibrary";
/**
 * extra mods
 */
export * from "./extraLibraries/extraMod.router";
/**
 * test tools
 */
export * from "./api.test";
/**
 * utils
 */
export * from "./utils";
//# sourceMappingURL=rulerDecorators.d.ts.map