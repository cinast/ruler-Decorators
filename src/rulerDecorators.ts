/**
 * @this
 * @core
 * Code candies library for property decoration CORE - Multi-Mode Implementation
 * 属性装饰的代码糖果库的底层核心 - 多模式实现
 *
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-8
 * @version 2.5.0
 *
 * @notice Decorators type: experimental stage 2
 * @warning tsconfig `experimentalDecorators` must be `true`
 * @tip tsconfig.json should be placed at ts files' parent or sibling folders
 * @tip tsc needs 5.2+
 */
("use strict");
import { __Setting, thisSymbols } from "./moduleMeta";
import {
    rd_GetterHandle,
    rd_SetterHandle,
    filterHandler,
    rejectionHandler,
    paramHandler,
    paramRejectionHandler,
} from "./type.handles";
import { debugLogger } from "./api.test";
import {
    $addGetterHandler,
    $addParamHandler,
    $addParamRejectionHandler,
    $addSetterHandler,
    createClassProxy,
    createPropertyProxy,
    getDescriptor,
    getPropertyModes,
    setDescriptor,
} from "./manage";
import {
    applyGetterHandlers,
    applyParamHandlers,
    applySetterHandlers,
    getDecoratorType,
    isModeCompatible,
    getDecoratedPropertyCount,
    rd_executeModeSelector,
} from "./utils";

import { createAccessorInterception } from "./manage";
import { rd_ProxyHandler } from "./types";

__Setting["debugLogger.logInnerDetails"] = true;
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
export const Storage = new WeakMap<object, Map<string | symbol, rd_Descriptor>>();

// 检查环境是否支持 Proxy
if (typeof Proxy === "undefined") {
    console.warn("This environment don't suppose Proxy");
    __Setting["Optimize.$$init.disableUsingProxy"] = true;
    __Setting["Optimize.$$init.defaultMod"] = "accessor";
}

// =========== initialize 初始化 =============
/**
 * Initiate Decorator: do sth before apply rules
 * 初始化（隐/明性调用）装饰器
 */
// auto 自动选择
export function $$init<T = any>(): ClassDecorator & PropertyDecorator & MethodDecorator;
export function $$init<T = any>(...handlers: Function[]): ClassDecorator & PropertyDecorator & MethodDecorator;
export function $$init<T = any>(
    mode: $interceptionModes,
    ...handlers: Function[]
): ClassDecorator & PropertyDecorator & MethodDecorator;

// ClassDecorator 重载 (2套)
export function $$init<T = any>(mode: "class-proxy", ProxyHandlers: rd_ProxyHandler<T>): ClassDecorator;
export function $$init<T = any>(ProxyHandlers: rd_ProxyHandler<T>): ClassDecorator;

// PropertyDecorator 重载 (2套)
export function $$init<T = any>(
    mode: "accessor",
    initialSetters: rd_SetterHandle[],
    initialGetters: rd_GetterHandle[]
): PropertyDecorator;
export function $$init<T = any>(initialSetters: rd_SetterHandle[], initialGetters: rd_GetterHandle[]): PropertyDecorator;
export function $$init<T = any>(mode: "property-proxy", ProxyHandlers: rd_ProxyHandler<T>): PropertyDecorator;
export function $$init<T = any>(ProxyHandlers: rd_ProxyHandler<T>): PropertyDecorator;

// MethodDecorator 重载 (2套)
export function $$init<T = any>(
    mode: "function-param-accessor",
    initialParamHandler: paramHandler[],
    initialParamRejectionHandler?: paramRejectionHandler[]
): MethodDecorator & PropertyDecorator;
export function $$init<T = any>(
    initialParamHandler: paramHandler[],
    initialParamRejectionHandler?: paramRejectionHandler[]
): MethodDecorator & PropertyDecorator;

export function $$init<T = any>(...args: any[]) {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        debugLogger(console.log, "$$init decorator applied to:", target?.name || target, propertyKey, descriptor);

        // 初始化Storage
        if (!Storage.has(target)) Storage.set(target, new Map());

        if (typeof target === "function" && target.prototype && !Storage.has(target.prototype)) {
            Storage.set(target.prototype, new Map());
        }

        // 确定装饰器类型
        const whoIsThisDecorator = getDecoratorType([target, propertyKey, descriptor]);
        console.log("detectedDecoratorType:", whoIsThisDecorator);
        if (whoIsThisDecorator === "UNKNOWN") throw "rulerDecorators now not suppose this kind of Decorator";

        const [interceptionMode, handlers]: [$interceptionModes, Function[]] =
            args.length > 0
                ? [
                      rd_executeModeSelector(
                          whoIsThisDecorator as Exclude<decoratorType, "ParameterDecorator">,
                          target,
                          getDecoratedPropertyCount(target)
                      ),
                      [],
                  ]
                : typeof args[0] === "string"
                ? [args[0] as $interceptionModes, args.slice(1) as Function[]]
                : [
                      rd_executeModeSelector(
                          whoIsThisDecorator as Exclude<decoratorType, "ParameterDecorator">,
                          target,
                          getDecoratedPropertyCount(target)
                      ),
                      args as Function[],
                  ];
        const driveMod = interceptionMode === "accessor" || interceptionMode === "function-param-accessor" ? "accessor" : "proxy";
        const key = propertyKey as string | symbol;
        const targetObj = target;
        const rdDescriptor = getDescriptor(targetObj, key);
        // 设置拦截模式
        switch (whoIsThisDecorator) {
            case "ClassDecorator":
                rdDescriptor.interceptionModes = interceptionMode;
                // 类装饰器处理
                return typeof target === "function" && target.prototype
                    ? class extends target {
                          constructor(...args: any[]) {
                              super(...args);
                              if (driveMod === "proxy") {
                                  return createClassProxy(this, target.prototype);
                              } else {
                                  return createAccessorInterception(this, target.prototype);
                              }
                          }
                      }
                    : target;

            case "PropertyDecorator":
                rdDescriptor.interceptionModes = interceptionMode;
                switch (driveMod) {
                    case "accessor":
                        rdDescriptor.setters = [
                            ...(rdDescriptor.setters || []),
                            ...(handlers[0] as unknown as rd_SetterHandle[]),
                        ];
                        rdDescriptor.getters = [
                            ...(rdDescriptor.getters || []),
                            ...(handlers[1] as unknown as rd_GetterHandle[]),
                        ];
                        break;
                    case "proxy":
                        break;
                }

                break;
            case "MethodDecorator":
                rdDescriptor.interceptionModes = "function-param-accessor";
                rdDescriptor.paramHandlers = [
                    ...(rdDescriptor.paramHandlers || []),
                    ...(handlers[0] as unknown as paramHandler[]),
                ];
                rdDescriptor.paramRejectHandlers = [
                    ...(rdDescriptor.paramRejectHandlers || []),
                    ...(handlers[0] as unknown as paramRejectionHandler[]),
                ];

                break;
            case "ParameterDecorator":
                throw "rulerDecorators now not suppose ParameterDecorator";
        }

        setDescriptor(targetObj, key, rdDescriptor);

        // 处理没有全局Proxy的情况
        const targetMap = Storage.get(targetObj);
        const hasClassProxy = targetMap ? Array.from(targetMap.values()).some((d) => d.ClassProxyEnabled) : false;

        if (!hasClassProxy && descriptor) {
            const interceptionMode = rdDescriptor.interceptionModes || "accessor";
            if (interceptionMode === "function-param-accessor" && typeof descriptor.value === "function") {
                const originalMethod = descriptor.value;
                descriptor.value = function (...args: any[]) {
                    const processedArgs = applyParamHandlers(this, key, originalMethod, args);
                    return originalMethod.apply(this, processedArgs);
                };
                console.log("proxyjjsjsksjkjs");

                return descriptor;
            }

            const modes = getPropertyModes(targetObj);
            const mode = modes.get(key) || "proxy";
            if (mode === "accessor") {
                const originalGet = descriptor.get || (() => descriptor.value);
                const originalSet =
                    descriptor.set ||
                    ((value: any) => {
                        descriptor.value = value;
                    });
                console.log("acccc");

                return {
                    ...descriptor,
                    get() {
                        console.log("gettt");

                        const value = originalGet.call(this);
                        return applyGetterHandlers(this, key, value);
                    },
                    set(value: any) {
                        console.log("settt");

                        const processedValue = applySetterHandlers(this, key, value);
                        originalSet.call(this, processedValue);
                    },
                };
            }
        }
        console.log("def");

        return descriptor;
    };
}

// ==================== 装载装饰器 register decorator ====================

/**
 * 全局Proxy类装饰器
 * 显式启用全局代理拦截
 */
export function $ClassProxy(): ClassDecorator {
    return function (target: any) {
        // 标记该类启用全局Proxy
        const prototype = target.prototype;
        const descriptor = getDescriptor(prototype, Symbol.for("ClassProxy"));
        descriptor.ClassProxyEnabled = true;
        setDescriptor(prototype, Symbol.for("ClassProxy"), descriptor);

        // 返回修改后的类
        return class extends target {
            constructor(...args: any[]) {
                super(...args);

                // 创建全局代理实例
                return createClassProxy(this, prototype);
            }
        } as any;
    };
}

/**
 * 属性级Proxy装饰器
 * 为特定属性启用Proxy模式拦截
 */
export function $PropertyProxy(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // 标记该属性使用Proxy模式
        const propertyModes = getPropertyModes(target);
        propertyModes.set(propertyKey, "proxy");
    };
}

/**
 * Setter handler decorator factory
 * Setter句柄装饰器工厂
 */
export function $setter<R = any, I = R>(handle: rd_SetterHandle<R, I>): PropertyDecorator & MethodDecorator {
    return function (target: any, attr: string | symbol, descriptor?: PropertyDescriptor) {
        $addSetterHandler(target, attr, function (thisArg, key, value, lastResult, index, handlers) {
            return handle(thisArg, key, value, lastResult, index, handlers);
        });
    };
}

/**
 * Getter handler decorator factory
 * Getter句柄装饰器工厂
 */
export function $getter<R = any, I = R>(handle: rd_GetterHandle<R, I>): PropertyDecorator & MethodDecorator {
    return function (target: any, attr: string | symbol, descriptor?: PropertyDescriptor) {
        $addGetterHandler(target, attr, function (thisArg, key, value, lastResult, index, handlers) {
            return handle(thisArg, key, value, lastResult, index, handlers);
        });
    };
}

/**
 * Parameter check handler decorator factory
 * 参数检查句柄装饰器工厂
 */
export function $paramChecker(handle: paramHandler, rejectHandle?: paramRejectionHandler): MethodDecorator {
    return function (target: any, methodKey: string | symbol, descriptor?: PropertyDescriptor) {
        $addParamHandler(target, methodKey, function (thisArg, key, method, args, prevResult, index, handlers) {
            return handle(thisArg, key, method, args, prevResult, index, handlers);
        });

        if (rejectHandle) {
            $addParamRejectionHandler(
                target,
                methodKey,
                function (thisArg, key, method, args, conditionResult, prevResult, index, handlers) {
                    return rejectHandle(thisArg, key, method, args, conditionResult, prevResult, index, handlers);
                }
            );
        }
    };
}

//     -------- 神器 wonderful tools --------

/**
 * Conditional write decorator factory
 * 条件写入装饰器工厂
 */
export const $conditionalWrite = <R = any, I = R>(
    errorType: "ignore" | "Warn" | "Error",
    conditionHandles: filterHandler[],
    rejectHandlers?: rejectionHandler[]
) => {
    return $setter<R, I>((thisArg, key, newVal, lastResult: I, index, handlers) => {
        debugLogger(console.log, "83493403");
        const handlersArray = [...conditionHandles];
        const callResult = handlersArray.reduce<{ approached: boolean; output: any }>(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, newVal, lastProcess, idx, conditionHandles);
                return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
            },
            { approached: false, output: lastResult }
        );

        if (callResult.approached) return callResult.output;

        if (rejectHandlers?.length) {
            const rejectHandlersArray = [...rejectHandlers];
            const rejectResult = rejectHandlersArray.reduce<{ approached: boolean; output: any }>(
                (lastProcess, handler, idx, arr) => {
                    const r = handler(thisArg, key, newVal, callResult, lastProcess, idx, rejectHandlers);
                    return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
                },
                {
                    approached: true,
                    output: lastResult,
                }
            );

            if (rejectResult.approached) return rejectResult.output;

            const warningMsg = `Property '${String(key)}' write rejected. Final output: ${JSON.stringify(rejectResult.output)}`;
            switch (errorType || __Setting["$conditionalWR.defaultErrorType"]) {
                case "Warn":
                    console.warn(`⚠️ ${warningMsg}`);
                    break;
                case "Error":
                    throw new Error(`🚫 ${warningMsg}`);
            }
        }
        return lastResult; // 修改这里，返回 lastResult 而不是 (thisArg as any)[key]
    });
};
/**
 * Conditional read decorator factory
 * 条件读取装饰器工厂
 */
export const $conditionalRead = <R = any, I = R>(
    errorType: "ignore" | "Warn" | "Error",
    conditionHandles: filterHandler[],
    rejectHandlers?: rejectionHandler[]
) => {
    return $getter((thisArg, key, value, lastResult: I, index, handlers) => {
        const handlersArray = [...conditionHandles];
        const callResult = handlersArray.reduce<{ approached: boolean; output: any }>(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, value, lastProcess, idx, conditionHandles);
                return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
            },
            { approached: false, output: lastResult }
        );

        if (callResult.approached) return callResult.output;

        if (rejectHandlers?.length) {
            const rejectHandlersArray = [...rejectHandlers];
            const rejectResult = rejectHandlersArray.reduce<{ approached: boolean; output: any }>(
                (lastProcess, handler, idx, arr) => {
                    const r = handler(thisArg, key, value, callResult, lastProcess, idx, rejectHandlers);
                    return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
                },
                {
                    approached: true,
                    output: lastResult,
                }
            );
            if (rejectResult.approached) return rejectResult.output;

            const warningMsg = `Property '${String(key)}' read rejected. Final output: ${JSON.stringify(rejectResult.output)}`;
            switch (errorType || __Setting["$conditionalWR.defaultErrorType"]) {
                case "Warn":
                    console.warn(`⚠️ ${warningMsg}`);
                    break;
                case "Error":
                    throw new Error(`🚫 ${warningMsg}`);
            }
        }
        return void 0;
    });
};

/**
 * types
 */
export * from "./type.handles";
/**
 * operation fn
 */
export * from "./manage";
/*
 * rulers & libSetting
 */
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
