import { filterHandler, paramFilterHandler, ParamFilterHandlerChain, paramRejectHandler, ParamRejectHandlerChain, rd_GetterHandle, rd_SetterHandle, rejectHandler } from "./type.handles";
import { rd_ProxyTraps } from "./types";
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
    paramHandlers?: paramFilterHandler[];
    paramRejectHandlers?: paramRejectHandler[];
    interceptionEnabled: boolean;
    propertyMode?: "proxy" | "accessor";
    interceptionModes: $interceptionModes;
    ClassProxyEnabled?: boolean;
    managedByClassProxy?: boolean;
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
export declare const descriptorStorage: WeakMap<object, Map<string | symbol, rd_Descriptor>>;
export declare const valueStorage: WeakMap<object, Map<string | symbol, any>>;
/**
 * Initiate Decorator: do sth before apply rules
 * 初始化（隐/明性调用）装饰器
 */
export declare function $$init<T = any>(): ClassDecorator & PropertyDecorator & MethodDecorator;
export declare function $$init<T = any>(...handlers: Function[]): ClassDecorator & PropertyDecorator & MethodDecorator;
export declare function $$init<T = any>(mode: $interceptionModes, ...handlers: Function[]): ClassDecorator & PropertyDecorator & MethodDecorator;
export declare function $$init<T = any>(mode: "class-proxy", ProxyHandlers: rd_ProxyTraps<T>): ClassDecorator;
export declare function $$init<T = any>(ProxyHandlers: rd_ProxyTraps<T>): ClassDecorator;
export declare function $$init<T = any>(mode: "accessor", initialSetters: rd_SetterHandle[], initialGetters: rd_GetterHandle[]): PropertyDecorator;
export declare function $$init<T = any>(initialSetters: rd_SetterHandle[], initialGetters: rd_GetterHandle[]): PropertyDecorator;
/**
 * @deprecated
 */
export declare function $$init<T = any>(mode: "property-proxy", ProxyHandlers: rd_ProxyTraps<T>): PropertyDecorator;
/**
 * @deprecated
 */
export declare function $$init<T = any>(ProxyHandlers: rd_ProxyTraps<T>): PropertyDecorator;
export declare function $$init<T = any>(mode: "function-param-accessor", initialParamHandler: paramFilterHandler[] | ParamFilterHandlerChain, initialParamRejectionHandler?: paramFilterHandler[] | ParamRejectHandlerChain): MethodDecorator & PropertyDecorator;
export declare function $$init<T = any>(initialParamHandler: paramFilterHandler[] | ParamFilterHandlerChain, initialParamRejectionHandler?: paramFilterHandler[] | ParamRejectHandlerChain): MethodDecorator & PropertyDecorator;
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
export declare function $paramChecker(handle: paramFilterHandler, rejectHandle?: paramRejectHandler): MethodDecorator;
/**
 * Conditional write decorator factory
 * 条件写入装饰器工厂
 */
export declare const $conditionalWrite: <R = any, I = R>(errorType: "ignore" | "Warn" | "Error", conditionHandles: filterHandler[], rejectHandlers?: rejectHandler[]) => PropertyDecorator & MethodDecorator;
/**
 * Conditional read decorator factory
 * 条件读取装饰器工厂
 */
export declare const $conditionalRead: <R = any, I = R>(errorType: "ignore" | "Warn" | "Error", conditionHandles: filterHandler[], rejectHandlers?: rejectHandler[]) => PropertyDecorator & MethodDecorator;
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
/**
 * types
 */
export * from "./types";
//# sourceMappingURL=rulerDecorators.d.ts.map