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
import { __Setting } from "./moduleMeta";
import { rd_GetterHandle, rd_SetterHandle, conditionHandler, rejectionHandler } from "./type.handles";
import { debugLogger } from "./api.test";

/**
 * Storage for property handler chains
 * 存储每个属性的句柄链
 */
const setterHandlers = new WeakMap<object, Map<string | symbol, rd_SetterHandle[]>>();
const getterHandlers = new WeakMap<object, Map<string | symbol, rd_GetterHandle[]>>();

/**
 * Storage for original values and proxy instances
 * 存储原始值和代理实例
 */
const originalInstances = new WeakMap<object, object>();
const proxyInstances = new WeakMap<object, object>();

/**
 * Mode configuration for each class
 * 每个类的模式配置
 */
const classModes = new WeakMap<object, "global-proxy" | "property-proxy" | "accessor">();

/**
 * Automatic mode selector for rulerDecorators
 * 根据配置和运行时条件自动选择最佳模式
 */
function modeSelector(target: any, propertyCount: number): "global-proxy" | "property-proxy" | "accessor" {
    // 1. 检查是否强制禁用 Proxy
    if (__Setting["Optimize.$$init.disableUsingProxy"]) {
        debugLogger(console.log, "Mode selector: Proxy disabled by config, using accessor mode");
        return "accessor";
    }

    // 2. 检查环境是否支持 Proxy
    if (typeof Proxy === "undefined") {
        debugLogger(console.log, "Mode selector: Proxy not supported in environment, using accessor mode");
        return "accessor";
    }

    // 3. 检查是否超过属性数量阈值
    const threshold = Number(__Setting["Optimize.$$init.autoUseProxyWhenRuledKeysMoreThan"]);
    if (propertyCount > threshold) {
        debugLogger(
            console.log,
            `Mode selector: ${propertyCount} properties exceed threshold ${threshold}, using global-proxy mode`
        );
        return "global-proxy";
    }

    // 4. 检查默认模式配置
    const defaultMode = __Setting["Optimize.$$init.defaultMod"];
    if (defaultMode !== "auto") {
        debugLogger(console.log, `Mode selector: Using configured default mode: ${defaultMode}`);
        return defaultMode as "global-proxy" | "property-proxy" | "accessor";
    }

    // 5. 基于启发式规则选择模式
    // 如果是大型对象或需要高性能，使用属性局部 Proxy
    if (propertyCount > 0 && propertyCount <= 5) {
        debugLogger(console.log, `Mode selector: ${propertyCount} properties, using property-proxy mode`);
        return "property-proxy";
    }

    // 6. 默认回退到属性局部 Proxy (平衡性能与功能)
    debugLogger(console.log, "Mode selector: Using fallback property-proxy mode");
    return "property-proxy";
}

/**
 * Get the count of decorated properties for a target
 * 获取目标对象上被装饰的属性数量
 */
function getDecoratedPropertyCount(target: any): number {
    if (!target) return 0;

    const setters = setterHandlers.get(target) || new Map();
    const getters = getterHandlers.get(target) || new Map();

    // 合并所有有处理器的属性键
    const allKeys = new Set<string | symbol>([...setters.keys(), ...getters.keys()]);

    return allKeys.size;
}

/**
 * Add setter handler to specified property
 * 添加 setter 句柄到指定属性
 */
export function $addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void {
    let handlersMap = setterHandlers.get(target);
    if (!handlersMap) {
        handlersMap = new Map();
        setterHandlers.set(target, handlersMap);
    }

    let handlers = handlersMap.get(propertyKey);
    if (!handlers) {
        handlers = [];
        handlersMap.set(propertyKey, handlers);
    }

    handlers.push(handler);
}

/**
 * Add getter handler to specified property
 * 添加 getter 句柄到指定属性
 */
export function $addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void {
    let handlersMap = getterHandlers.get(target);
    if (!handlersMap) {
        handlersMap = new Map();
        getterHandlers.set(target, handlersMap);
    }

    let handlers = handlersMap.get(propertyKey);
    if (!handlers) {
        handlers = [];
        handlersMap.set(propertyKey, handlers);
    }

    handlers.push(handler);
}

/**
 * Remove setter handler from specified property
 * 从指定属性移除 setter 句柄
 */
export function $removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean {
    const handlersMap = setterHandlers.get(target);
    if (!handlersMap) return false;

    const handlers = handlersMap.get(propertyKey);
    if (!handlers) return false;

    const index = handlers.indexOf(handler);
    if (index === -1) return false;

    handlers.splice(index, 1);
    return true;
}

/**
 * Remove getter handler from specified property
 * 从指定属性移除 getter 句柄
 */
export function $removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean {
    const handlersMap = getterHandlers.get(target);
    if (!handlersMap) return false;

    const handlers = handlersMap.get(propertyKey);
    if (!handlers) return false;

    const index = handlers.indexOf(handler);
    if (index === -1) return false;

    handlers.splice(index, 1);
    return true;
}

/**
 * Check if a property has handlers
 * 检查属性是否有处理器
 */
function hasHandlersFor(target: object, propertyKey: string | symbol): boolean {
    const hasSetter = Boolean(setterHandlers.get(target)?.get(propertyKey)?.length);
    const hasGetter = Boolean(getterHandlers.get(target)?.get(propertyKey)?.length);
    return hasSetter || hasGetter;
}

/**
 * Apply getter handlers for a property
 * 应用属性的 getter 处理器
 */
function applyGetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any {
    const getters = getterHandlers.get(Object.getPrototypeOf(receiver))?.get(propertyKey) || [];
    if (getters.length === 0) return value;

    return getters.reduce((prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]), value);
}

/**
 * Apply setter handlers for a property
 * 应用属性的 setter 处理器
 */
function applySetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any {
    const setters = setterHandlers.get(Object.getPrototypeOf(receiver))?.get(propertyKey) || [];
    if (setters.length === 0) return value;

    return setters.reduce((prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]), value);
}

/**
 * Create global proxy for instance (intercept all properties)
 * 为实例创建全局代理（拦截所有属性）
 */
function createGlobalProxy(instance: any, target: any): any {
    if (proxyInstances.has(instance)) {
        return proxyInstances.get(instance);
    }

    const proxy = new Proxy(instance, {
        get(target, propertyKey, receiver) {
            debugLogger(console.log, "Global Proxy getter triggered for", propertyKey);

            // 获取原始值
            let value = Reflect.get(target, propertyKey, receiver);

            // 获取 getter 处理链
            const getters = getterHandlers.get(target)?.get(propertyKey) || [];

            if (getters.length > 0) {
                // 应用 getter 处理链
                value = getters.reduce(
                    (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                    value
                );
            }

            // 如果是函数，确保绑定正确的 this 上下文
            if (typeof value === "function") {
                return value.bind(receiver);
            }

            return value;
        },

        set(target, propertyKey, value, receiver) {
            debugLogger(console.log, "Global Proxy setter triggered for", propertyKey, "with value", value);

            // 获取 setter 处理链
            const setters = setterHandlers.get(target)?.get(propertyKey) || [];

            let processedValue = value;

            if (setters.length > 0) {
                // 应用 setter 处理链
                processedValue = setters.reduce(
                    (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                    value
                );
            }

            // 设置处理后的值
            return Reflect.set(target, propertyKey, processedValue, receiver);
        },
    });

    proxyInstances.set(instance, proxy);
    originalInstances.set(proxy, instance);

    return proxy;
}

/**
 * Create property proxy for instance (intercept only decorated properties)
 * 为实例创建属性代理（只拦截被装饰的属性）
 */
function createPropertyProxy(instance: any, target: any): any {
    if (proxyInstances.has(instance)) {
        return proxyInstances.get(instance);
    }

    const proxy = new Proxy(instance, {
        get(target, propertyKey, receiver) {
            // 只拦截有处理器的属性
            if (hasHandlersFor(target, propertyKey)) {
                debugLogger(console.log, "Property Proxy getter triggered for", propertyKey);
                let value = Reflect.get(target, propertyKey, receiver);
                return applyGetterHandlers(receiver, propertyKey, value);
            }

            // 直接返回其他属性
            return Reflect.get(target, propertyKey, receiver);
        },

        set(target, propertyKey, value, receiver) {
            // 只拦截有处理器的属性
            if (hasHandlersFor(target, propertyKey)) {
                debugLogger(console.log, "Property Proxy setter triggered for", propertyKey, "with value", value);
                const processedValue = applySetterHandlers(receiver, propertyKey, value);
                return Reflect.set(target, propertyKey, processedValue, receiver);
            }

            // 直接设置其他属性
            return Reflect.set(target, propertyKey, value, receiver);
        },
    });

    proxyInstances.set(instance, proxy);
    originalInstances.set(proxy, instance);

    return proxy;
}

/**
 * Create accessor-based interception (traditional getter/setter)
 * 创建基于访问器的拦截（传统 getter/setter）
 */
function createAccessorInterception(instance: any, targetPrototype: any): any {
    // 获取所有有处理器的属性
    const handlerProperties = new Set<string | symbol>();
    const settersMap = setterHandlers.get(targetPrototype) || new Map();
    const gettersMap = getterHandlers.get(targetPrototype) || new Map();

    for (const key of settersMap.keys()) handlerProperties.add(key);
    for (const key of gettersMap.keys()) handlerProperties.add(key);

    // 为每个有处理器的属性创建访问器
    for (const propertyKey of handlerProperties) {
        let value = instance[propertyKey];

        Object.defineProperty(instance, propertyKey, {
            get: () => {
                debugLogger(console.log, "Accessor getter triggered for", propertyKey);
                return applyGetterHandlers(instance, propertyKey, value);
            },
            set: (newValue) => {
                debugLogger(console.log, "Accessor setter triggered for", propertyKey, "with value", newValue);
                value = applySetterHandlers(instance, propertyKey, newValue);
            },
            enumerable: true,
            configurable: true,
        });
    }

    return instance;
}

/**
 * Decorator factory: creates adaptive decorator with multiple mode implementation
 * 装饰器工厂：使用多模式实现创建自适应装饰器
 */
export const $$init = <T = any, R = T>(
    initialSetters: rd_SetterHandle[] = [],
    initialGetters: rd_GetterHandle[] = [],
    mode: "global-proxy" | "property-proxy" | "accessor" | "auto" = "auto"
) => {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        // 确定最终要使用的模式
        let finalMode: "global-proxy" | "property-proxy" | "accessor";

        if (mode === "auto") {
            // 自动模式选择
            const propertyCount = getDecoratedPropertyCount(target);
            finalMode = modeSelector(target, propertyCount);
        } else {
            // 使用显式指定的模式
            finalMode = mode;
        }

        debugLogger(console.log, "$$init decorator applied with mode:", finalMode);

        // 存储类的模式配置
        classModes.set(target, finalMode);
        if (typeof target === "function" && target.prototype) {
            classModes.set(target.prototype, finalMode);
        }

        // 初始化handlers
        const initHandlers = (map: WeakMap<any, any>, t: any) => !map.has(t) && map.set(t, new Map());
        initHandlers(setterHandlers, target);
        initHandlers(getterHandlers, target);

        if (typeof target === "function" && target.prototype) {
            initHandlers(setterHandlers, target.prototype);
            initHandlers(getterHandlers, target.prototype);
        }

        // === 类装饰器处理 ===
        if (typeof propertyKey === "undefined") {
            // 检查target是否为可继承的类
            if (typeof target === "function" && target.prototype) {
                return class extends target {
                    constructor(...args: any[]) {
                        super(...args);
                        debugLogger(console.log, "Decorated class constructor called");

                        // 根据模式返回相应的实例
                        const mode = classModes.get(target.prototype) || finalMode;
                        debugLogger(console.log, "Using mode:", mode);

                        switch (mode) {
                            case "global-proxy":
                                return createGlobalProxy(this, target.prototype);
                            case "property-proxy":
                                return createPropertyProxy(this, target.prototype);
                            case "accessor":
                                return createAccessorInterception(this, target.prototype);
                            default:
                                return this;
                        }
                    }
                };
            }
            // 如果不是类则直接返回
            return target;
        }

        const key = propertyKey as string | symbol;
        const targetObj = target;

        // === 初始化句柄存储 ===
        // 初始化 setter 句柄
        let settersMap = setterHandlers.get(targetObj);
        if (!settersMap) {
            settersMap = new Map();
            setterHandlers.set(targetObj, settersMap);
        }

        if (!settersMap.has(key)) settersMap.set(key, [...initialSetters]);

        // 初始化 getter 句柄
        let gettersMap = getterHandlers.get(targetObj);
        if (!gettersMap) {
            gettersMap = new Map();
            getterHandlers.set(targetObj, gettersMap);
        }

        if (!gettersMap.has(key)) gettersMap.set(key, [...initialGetters]);

        // 对于 accessor 模式，需要返回修改后的属性描述符
        if (finalMode === "accessor" && descriptor) {
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

        // 对于 proxy 模式，属性将通过Proxy处理
        return descriptor;
    };
};

//     -------- 调用接口 api functions --------

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

//     -------- 神器 wonderful tools --------

/**
 * Conditional write decorator factory
 * 条件写入装饰器工厂
 */
export const $conditionalWrite = <R = any, I = R>(
    errorType: "ignore" | "Warn" | "Error",
    conditionHandles: conditionHandler[],
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
    conditionHandles: conditionHandler[],
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
 * rulers & libSetting
 */
export * as rulerDecorators from "./rulesLibrary";
export * from "./extraLibraries/extraMod.router";
