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

/**
 * 解析参数，返回模式和处理器数组
 */
function parseArgs(args: any[]): { mode: drivingModeWithAuto; handlers: any[] } {
    let mode: drivingModeWithAuto = "auto";
    let handlers: any[] = [];

    if (args.length > 0 && typeof args[0] === "string" && (args[0] === "proxy" || args[0] === "accessor" || args[0] === "auto")) {
        mode = args[0];
        handlers = args.slice(1);
    } else {
        handlers = args;
    }

    return { mode, handlers };
}

// ... 其他代码 ...

export function $$init<T = any, R = T>(
    ...args: any[] // 使用 any[] 来避免重载签名错误，实际处理中会检查类型
) {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        debugLogger(console.log, "$$init decorator applied to:", target?.name || target, propertyKey, descriptor);

        // 初始化Storage
        if (!Storage.has(target)) {
            Storage.set(target, new Map());
        }
        if (typeof target === "function" && target.prototype && !Storage.has(target.prototype)) {
            Storage.set(target.prototype, new Map());
        }

        // 解析参数
        const { mode, handlers } = parseArgs(args);

        // 确定装饰器类型
        const detectedDecoratorType = getDecoratorType([target, propertyKey, descriptor].filter(Boolean));

        // 自动选择模式
        let finalMode = mode;
        if (mode === "auto" && detectedDecoratorType !== "UNKNOWN") {
            const decoratedCount = getDecoratedPropertyCount(target);
            finalMode =
                rd_executeModeSelector(
                    detectedDecoratorType as Exclude<decoratorType, "ParameterDecorator">,
                    target,
                    decoratedCount
                ) === "class-proxy"
                    ? "proxy"
                    : "accessor";
        }

        // 类装饰器处理
        if (typeof propertyKey === "undefined") {
            if (typeof target === "function" && target.prototype) {
                return class extends target {
                    constructor(...args: any[]) {
                        super(...args);
                        debugLogger(console.log, "Decorated class constructor called");
                        if (finalMode === "proxy") {
                            debugLogger(console.log, "Using Class Proxy mode");
                            return createClassProxy(this, target.prototype);
                        } else {
                            debugLogger(console.log, "Using accessor mode");
                            return createAccessorInterception(this, target.prototype);
                        }
                    }
                };
            }
            return target;
        }

        const key = propertyKey as string | symbol;
        const targetObj = target;
        const rdDescriptor = getDescriptor(targetObj, key);

        // 设置拦截模式
        if (detectedDecoratorType === "ClassDecorator") {
            rdDescriptor.interceptionModes = finalMode === "proxy" ? "class-proxy" : "accessor";
        } else if (detectedDecoratorType === "PropertyDecorator") {
            rdDescriptor.interceptionModes = finalMode === "proxy" ? "property-proxy" : "accessor";
        } else if (detectedDecoratorType === "MethodDecorator") {
            rdDescriptor.interceptionModes = "function-param-accessor";
        }

        // 处理处理器
        handlers.forEach((handlerGroup) => {
            if (Array.isArray(handlerGroup) && handlerGroup.length > 0) {
                const firstHandler = handlerGroup[0];
                if (typeof firstHandler === "function") {
                    if (firstHandler[thisSymbols]?.type === "setterI") {
                        rdDescriptor.setters = [...(rdDescriptor.setters || []), ...(handlerGroup as rd_SetterHandle[])];
                    } else if (firstHandler[thisSymbols]?.type === "getterI") {
                        rdDescriptor.getters = [...(rdDescriptor.getters || []), ...(handlerGroup as rd_GetterHandle[])];
                    } else if (detectedDecoratorType === "MethodDecorator") {
                        rdDescriptor.paramHandlers = [...(rdDescriptor.paramHandlers || []), ...(handlerGroup as paramHandler[])];
                    }
                } else if (typeof firstHandler === "object" && "get" in firstHandler) {
                    rdDescriptor.propertyMode = finalMode === "proxy" ? "proxy" : "accessor";
                }
            }
        });

        setDescriptor(targetObj, key, rdDescriptor);

        // 验证兼容性
        const finalDecoratorType = getDecoratorType(target);
        if (finalDecoratorType === "UNKNOWN") {
            return descriptor;
        }
        const interceptionMode = rdDescriptor.interceptionModes || "accessor";
        if (!isModeCompatible(finalDecoratorType, interceptionMode)) {
            console.warn(`警告：装饰器类型 ${finalDecoratorType} 与拦截模式 ${interceptionMode} 不兼容`);
        }

        // 处理没有全局Proxy的情况
        const targetMap = Storage.get(targetObj);
        const hasClassProxy = targetMap ? Array.from(targetMap.values()).some((d) => d.ClassProxyEnabled) : false;

        if (!hasClassProxy && descriptor) {
            const interceptionMode = rdDescriptor.interceptionModes || "accessor";
            if (interceptionMode === "function-param-accessor" && typeof descriptor.value === "function") {
                const originalMethod = descriptor.value;
                descriptor.value = function (...args: any[]) {
                    debugLogger(console.log, "Function parameter accessor triggered for", key, "with args", args);
                    const processedArgs = applyParamHandlers(this, key, originalMethod, args);
                    return originalMethod.apply(this, processedArgs);
                };
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
                return {
                    ...descriptor,
                    get() {
                        const value = originalGet.call(this);
                        return applyGetterHandlers(this, key, value);
                    },
                    set(value: any) {
                        const processedValue = applySetterHandlers(this, key, value);
                        originalSet.call(this, processedValue);
                    },
                };
            }
        }

        return descriptor;
    };
}

// ==================== 注册装饰器 register decorator ====================

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
        return (thisArg as any)[key];
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
