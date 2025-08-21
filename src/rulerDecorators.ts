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

declare type rd_descriptor = PropertyDescriptor & {
    value: any;
    proxy: any;
    get(): any;
    set(v: any): void;
    interceptionModes: $types;
};
/**
 *
 */
const Storage = new WeakMap();

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
 * Automatic mode selector for rulerDecorators
 * 根据配置和装饰器类型及运行时条件自动选择最佳模式
 * @returns see $modTypes
 */
function rd_executeModeSelector(
    decoratorType: Exclude<decoratorType, "ParameterDecorator">,
    target: any,
    propertiesWithRuleApplied: number
): $modTypes {
    // 1. 检查是否强制禁用 Proxy
    if (__Setting["Optimize.$$init.disableUsingProxy"]) {
        return "accessor";
    }

    // 2. 检查环境是否支持 Proxy
    if (typeof Proxy === "undefined") {
        return "accessor";
    }

    // 3. 筛选可确定的
    switch (decoratorType) {
        case "ClassDecorator":
            return __Setting["Optimize.$$init.disableUsingProxy"] ? "accessor" : "class-proxy";
        case "MethodDecorator":
            return "function-param-accessor";
    }

    // target: [] | {...}
    // 4. 对数组特别设定
    if (target instanceof Array) {
        return __Setting["Optimize.$$init.disableUsingProxy"] ? "accessor" : "property-proxy";
    }

    // target: {...}
    // 5.对普遍对象类 检查是否超过属性数量阈值
    const threshold = __Setting["Optimize.$$init.autoUseProxyWhenRuledKeysMoreThan"];
    if (propertiesWithRuleApplied > threshold) {
        return "property-proxy";
    }

    // 6. 回退到默认值
    return __Setting["Optimize.$$init.defaultMod"] == "proxy" ? "property-proxy" : "accessor";
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

//#region
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

//#endregion

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
function createGlobalProxy(instance: any, prototype: any): any {
    if (proxyInstances.has(instance)) {
        return proxyInstances.get(instance);
    }

    const proxy = new Proxy(instance, {
        get(target, propertyKey, receiver) {
            debugLogger(console.log, "Global Proxy getter triggered for", propertyKey);

            // 获取原始值
            let value = Reflect.get(target, propertyKey, receiver);

            // 检查是否有属性级处理器
            const getters = getterHandlers.get(prototype)?.get(propertyKey) || [];

            if (getters.length > 0) {
                // 应用属性级getter处理链
                value = getters.reduce(
                    (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                    value
                );
            }

            // 如果是函数，确保绑定正确的this上下文
            if (typeof value === "function") {
                return value.bind(receiver);
            }

            return value;
        },

        set(target, propertyKey, value, receiver) {
            debugLogger(console.log, "Global Proxy setter triggered for", propertyKey, "with value", value);

            // 检查是否有属性级处理器
            const setters = setterHandlers.get(prototype)?.get(propertyKey) || [];

            let processedValue = value;

            if (setters.length > 0) {
                // 应用属性级setter处理链
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
function createPropertyProxy(instance: any, prototype: any): any {
    // 获取属性模式配置
    const modes = propertyInterceptionModes.get(prototype) || new Map();

    const proxy = new Proxy(instance, {
        get(target, propertyKey, receiver) {
            // 只拦截配置为Proxy模式的属性
            if (modes.get(propertyKey) === "proxy") {
                debugLogger(console.log, "Property Proxy getter triggered for", propertyKey);
                let value = Reflect.get(target, propertyKey, receiver);
                return applyGetterHandlers(receiver, propertyKey, value);
            }

            // 直接返回其他属性
            return Reflect.get(target, propertyKey, receiver);
        },

        set(target, propertyKey, value, receiver) {
            // 只拦截配置为Proxy模式的属性
            if (modes.get(propertyKey) === "proxy") {
                debugLogger(console.log, "Property Proxy setter triggered for", propertyKey, "with value", value);
                const processedValue = applySetterHandlers(receiver, propertyKey, value);
                return Reflect.set(target, propertyKey, processedValue, receiver);
            }

            // 直接设置其他属性
            return Reflect.set(target, propertyKey, value, receiver);
        },
    });

    // 为配置为Accessor模式的属性创建访问器
    for (const [propertyKey, mode] of modes.entries()) {
        if (mode === "accessor") {
            let value = instance[propertyKey];

            Object.defineProperty(proxy, propertyKey, {
                get: () => {
                    debugLogger(console.log, "Accessor getter triggered for", propertyKey);
                    return applyGetterHandlers(proxy, propertyKey, value);
                },
                set: (newValue) => {
                    debugLogger(console.log, "Accessor setter triggered for", propertyKey, "with value", newValue);
                    value = applySetterHandlers(proxy, propertyKey, newValue);
                },
                enumerable: true,
                configurable: true,
            });
        }
    }

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
export const $$init = <T = any, R = T>(initialSetters: rd_SetterHandle[] = [], initialGetters: rd_GetterHandle[] = []) => {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        // 只注册处理器，不处理模式选择
        debugLogger(console.log, "$$init decorator applied to:", target?.name || target, propertyKey, descriptor);

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

                        // 根据是否启用全局Proxy选择创建方式
                        if (globalProxyEnabled.get(target.prototype)) {
                            debugLogger(console.log, "Using global proxy mode");
                            return createGlobalProxy(this, target.prototype);
                        } else {
                            debugLogger(console.log, "Using property-level interception mode");
                            return createPropertyProxy(this, target.prototype);
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

        // 对于没有启用全局Proxy的情况，需要处理属性级拦截
        if (!globalProxyEnabled.get(targetObj) && descriptor) {
            // 获取属性模式（默认为Proxy）
            const modes = propertyInterceptionModes.get(targetObj) || new Map();
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

        // 对于Proxy模式或启用全局Proxy的情况，属性将通过Proxy处理
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

// ==================== 装饰器定义 ====================

/**
 * 全局Proxy类装饰器
 * 显式启用全局代理拦截
 */
export function ClassProxy(): ClassDecorator {
    return function (target: any) {
        // 标记该类启用全局Proxy
        const prototype = target.prototype;
        globalProxyEnabled.set(prototype, true);

        // 返回修改后的类
        return class extends target {
            constructor(...args: any[]) {
                super(...args);

                // 创建全局代理实例
                return createGlobalProxy(this, prototype);
            }
        } as any;
    };
}

/**
 * 属性级Proxy装饰器
 * 为特定属性启用Proxy模式拦截
 */
export function PropertyProxy(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // 标记该属性使用Proxy模式
        const propertyModes = getPropertyModes(target);
        propertyModes.set(propertyKey, "proxy");
    };
}

/**
 * 属性级Accessor装饰器
 * 为特定属性启用Accessor模式拦截
 */
export function PropertyAccessor(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // 标记该属性使用Accessor模式
        const propertyModes = getPropertyModes(target);
        propertyModes.set(propertyKey, "accessor");
    };
}

// ==================== 存储结构 ====================

// 存储全局Proxy启用状态
const globalProxyEnabled = new WeakMap<any, boolean>();

// 存储每个类的属性拦截模式
const propertyInterceptionModes = new WeakMap<any, Map<string | symbol, "proxy" | "accessor">>();

// 获取或创建属性模式映射
function getPropertyModes(target: any): Map<string | symbol, "proxy" | "accessor"> {
    let modes = propertyInterceptionModes.get(target);
    if (!modes) {
        modes = new Map();
        propertyInterceptionModes.set(target, modes);
    }
    return modes;
}
