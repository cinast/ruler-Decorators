import { debugLogger } from "./api.test";
import { descriptorStorage, rd_Descriptor } from "./rulerDecorators";
import {
    ParamFilterHandlerChain,
    ParamRejectHandlerChain,
    paramFilterChainHandler,
    paramFilterHandler,
    paramRejectChainHandler,
    paramRejectHandler,
    rd_GetterHandle,
    rd_SetterHandle,
} from "./type.handles";

/**
 * 标记属性由类代理管理
 */
export function $markPropertyAsClassProxyManaged(target: object, propertyKey: string | symbol): void {
    const descriptor = getDescriptor(target, propertyKey);
    descriptor.managedByClassProxy = true;
    descriptor.propertyMode = "proxy"; // 统一使用代理模式
    setDescriptor(target, propertyKey, descriptor);
}

/**
 * 检查属性是否由类代理管理
 */
export function isPropertyManagedByClassProxy(target: object, propertyKey: string | symbol): boolean {
    const descriptor = getDescriptor(target, propertyKey);
    return !!descriptor.managedByClassProxy;
}

export function hasHandlersFor(target: object, propertyKey: string | symbol): boolean {
    const descriptor = getDescriptor(target, propertyKey);
    const hasSetter = Boolean(descriptor.setters?.length);
    const hasGetter = Boolean(descriptor.getters?.length);
    const hasParam = Boolean(descriptor.paramHandlers?.length);
    return hasSetter || hasGetter || hasParam;
}

/**
 * Set descriptor for target property
 * 设置目标属性的描述符
 */
export function setDescriptor(target: object, propertyKey: string | symbol, descriptor: rd_Descriptor): void {
    const targetMap = getOrCreateTargetMap(target);
    targetMap.set(propertyKey, descriptor);
}

/**
 * Check if target has any descriptors
 * 检查目标是否有任何描述符
 */
export function hasDescriptors(target: object): boolean {
    const targetMap = descriptorStorage.get(target);
    return !!targetMap && targetMap.size > 0;
}

/**
 * Get all descriptors for target
 * 获取目标的所有描述符
 */
export function getAllDescriptors(target: object): Map<string | symbol, rd_Descriptor> | undefined {
    return descriptorStorage.get(target);
}

/**
 * Get or create descriptor for target property
 * 获取或创建目标属性的描述符
 */
export function getDescriptor(target: object, propertyKey: string | symbol): rd_Descriptor {
    const targetMap = getOrCreateTargetMap(target);
    let descriptor = targetMap.get(propertyKey);
    if (!descriptor) {
        descriptor = {
            interceptionEnabled: true,
            interceptionModes: "accessor",
            setters: [],
            getters: [],
        };
        targetMap.set(propertyKey, descriptor);
    }
    return descriptor;
}

/**
 * Get the count of decorated properties for a target
 * 获取目标对象上被装饰的属性数量
 */
export function getDecoratedPropertyCount(target: any): number {
    if (!target) return 0;

    const targetMap = descriptorStorage.get(target);
    if (!targetMap) return 0;

    // 计算有处理器的属性数量
    let count = 0;
    for (const descriptor of targetMap.values()) {
        if (descriptor.setters?.length || descriptor.getters?.length) {
            count++;
        }
    }

    return count;
}

/**
 * 获取或创建属性模式映射
 */
export function getPropertyModes(target: any): Map<string | symbol, "proxy" | "accessor"> {
    const targetMap = descriptorStorage.get(target);
    if (!targetMap) {
        return new Map();
    }
    const modes = new Map<string | symbol, "proxy" | "accessor">();
    for (const [propertyKey, descriptor] of targetMap.entries()) {
        if (descriptor.propertyMode) {
            modes.set(propertyKey, descriptor.propertyMode);
        }
    }
    return modes;
}

/**
 * Get or create target map for storage
 * 获取或创建目标存储映射
 */
export function getOrCreateTargetMap(target: object): Map<string | symbol, rd_Descriptor> {
    let targetMap = descriptorStorage.get(target);
    if (!targetMap) {
        targetMap = new Map();
        descriptorStorage.set(target, targetMap);
    }
    return targetMap;
}

/**
 * Create accessor-based interception (traditional getter/setter)
 * 创建基于访问器的拦截（传统 getter/setter）
 */
export function createAccessorInterception(instance: any, targetPrototype: any): any {
    const handlerProperties = new Set<string | symbol>();
    const targetMap = descriptorStorage.get(targetPrototype);

    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            if (descriptor.setters?.length || descriptor.getters?.length) {
                handlerProperties.add(propertyKey);
            }
        }
    }

    for (const propertyKey of handlerProperties) {
        // 获取初始值并应用setter处理器
        let value = $applySetterHandlers(instance, propertyKey, instance[propertyKey]);

        Object.defineProperty(instance, propertyKey, {
            get: () => {
                debugLogger(console.log, "Accessor getter triggered for", propertyKey);
                return $applyGetterHandlers(instance, propertyKey, value);
            },
            set: (newValue) => {
                debugLogger(console.log, "Accessor setter triggered for", propertyKey, "with value", newValue);
                value = $applySetterHandlers(instance, propertyKey, newValue);
            },
            enumerable: true,
            configurable: true,
        });
    }

    return instance;
}

/**
 * Create property proxy for instance (intercept only decorated properties)
 * 为实例创建属性代理（只拦截被装饰的属性）
 */
export function createPropertyProxy(instance: any, prototype: any): any {
    const allDescriptors = getAllDescriptors(prototype);
    if (allDescriptors) {
        for (const descriptor of allDescriptors.values()) {
            if (descriptor.proxyInstance === instance) {
                return descriptor.originalInstance;
            }
            if (descriptor.originalInstance === instance) {
                return descriptor.proxyInstance;
            }
        }
    }

    const proxy = new Proxy(instance, {
        get(target, propertyKey, receiver) {
            const descriptor = getDescriptor(prototype, propertyKey);
            if (descriptor.propertyMode === "proxy") {
                debugLogger(console.log, "Property Proxy getter triggered for", propertyKey);
                let value = Reflect.get(target, propertyKey, receiver);
                return $applyGetterHandlers(receiver, propertyKey, value);
            }
            return Reflect.get(target, propertyKey, receiver);
        },

        set(target, propertyKey, value, receiver) {
            const descriptor = getDescriptor(prototype, propertyKey);
            if (descriptor.propertyMode === "proxy") {
                debugLogger(console.log, "Property Proxy setter triggered for", propertyKey, "with value", value);
                const processedValue = $applySetterHandlers(receiver, propertyKey, value);
                return Reflect.set(target, propertyKey, processedValue, receiver);
            }
            return Reflect.set(target, propertyKey, value, receiver);
        },
    });

    const targetMap = descriptorStorage.get(prototype);
    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            if (descriptor.propertyMode === "accessor") {
                let value = instance[propertyKey];
                Object.defineProperty(proxy, propertyKey, {
                    get: () => {
                        debugLogger(console.log, "Accessor getter triggered for", propertyKey);
                        return $applyGetterHandlers(proxy, propertyKey, value);
                    },
                    set: (newValue) => {
                        debugLogger(console.log, "Accessor setter triggered for", propertyKey, "with value", newValue);
                        value = $applySetterHandlers(proxy, propertyKey, newValue);
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
            descriptor.proxyInstance = proxy;
            descriptor.originalInstance = instance;
            targetMap.set(propertyKey, descriptor);
        }
    }

    return proxy;
}

/**
 * Create Class Proxy for instance (intercept all properties)
 * 为实例创建全局代理（拦截所有属性）
 */
export function createClassProxy(instance: any, prototype: any): any {
    const allDescriptors = getAllDescriptors(prototype);
    if (allDescriptors) {
        for (const descriptor of allDescriptors.values()) {
            if (descriptor.proxyInstance === instance) {
                return descriptor.originalInstance;
            }
            if (descriptor.originalInstance === instance) {
                return descriptor.proxyInstance;
            }
        }
    }

    const proxy = new Proxy(instance, {
        get(target, propertyKey, receiver) {
            debugLogger(console.log, "Class Proxy getter triggered for", propertyKey);
            let value = Reflect.get(target, propertyKey, receiver);

            const descriptor = getDescriptor(prototype, propertyKey);
            const getters = descriptor.getters || [];
            if (getters.length > 0) {
                value = getters.reduce(
                    (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                    value
                );
            }

            if (typeof value === "function") {
                return value.bind(receiver);
            }
            return value;
        },

        set(target, propertyKey, value, receiver) {
            debugLogger(console.log, "Class Proxy setter triggered for", propertyKey, "with value", value);
            let processedValue = value;

            const descriptor = getDescriptor(prototype, propertyKey);
            const setters = descriptor.setters || [];
            if (setters.length > 0) {
                processedValue = setters.reduce(
                    (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                    value
                );
            }

            return Reflect.set(target, propertyKey, processedValue, receiver);
        },
    });

    const targetMap = descriptorStorage.get(prototype);
    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            descriptor.proxyInstance = proxy;
            descriptor.originalInstance = instance;
            targetMap.set(propertyKey, descriptor);
        }
    }

    return proxy;
}

/**
 * Add setter handler to specified property
 * 添加 setter 句柄到指定属性
 */
export function $addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void {
    const descriptor = getDescriptor(target, propertyKey);
    descriptor.setters = [...(descriptor.setters || []), handler];
    setDescriptor(target, propertyKey, descriptor);
}

/**
 * Add getter handler to specified property
 * 添加 getter 句柄到指定属性
 */
export function $addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void {
    const descriptor = getDescriptor(target, propertyKey);
    descriptor.getters = [...(descriptor.getters || []), handler];
    setDescriptor(target, propertyKey, descriptor);
}

/**
 * Remove setter handler from specified property
 * 从指定属性移除 setter 句柄
 */
export function $removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean {
    const descriptor = getDescriptor(target, propertyKey);
    if (!descriptor.setters || descriptor.setters.length === 0) return false;
    const index = descriptor.setters.indexOf(handler);
    if (index === -1) return false;
    descriptor.setters.splice(index, 1);
    setDescriptor(target, propertyKey, descriptor);
    return true;
}

/**
 * Remove getter handler from specified property
 * 从指定属性移除 getter 句柄
 */
export function $removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean {
    const descriptor = getDescriptor(target, propertyKey);
    if (!descriptor.getters || descriptor.getters.length === 0) return false;
    const index = descriptor.getters.indexOf(handler);
    if (index === -1) return false;
    descriptor.getters.splice(index, 1);
    setDescriptor(target, propertyKey, descriptor);
    return true;
}

/**
 * Add parameter handler to specified method
 * 添加参数处理器到指定方法
 */
export function $addParamHandler(target: object, methodKey: string | symbol, handler: paramFilterHandler): void;
export function $addParamHandler(target: object, methodKey: string | symbol, handlers: ParamFilterHandlerChain): void;
export function $addParamHandler(target: object, methodKey: string | symbol, handlerOrHandlers: any): void {
    const descriptor = getDescriptor(target, methodKey);

    if (Array.isArray(handlerOrHandlers) && Array.isArray(handlerOrHandlers[0])) {
        // 二维数组格式 - 使用包装器
        const wrapper = createParamWrapperFilter(handlerOrHandlers);
        descriptor.paramHandlers = [...(descriptor.paramHandlers || []), wrapper];
    } else if (typeof handlerOrHandlers === "object" && !Array.isArray(handlerOrHandlers)) {
        // 对象格式 - 使用包装器
        const wrapper = createParamWrapperFilter(handlerOrHandlers);
        descriptor.paramHandlers = [...(descriptor.paramHandlers || []), wrapper];
    } else {
        // 单个处理器
        descriptor.paramHandlers = [...(descriptor.paramHandlers || []), handlerOrHandlers as paramFilterHandler];
    }

    setDescriptor(target, methodKey, descriptor);
}

/**
 * Add parameter rejection handler to specified method
 * 添加参数回绝处理器到指定方法
 */
export function $addParamRejectionHandler(target: object, methodKey: string | symbol, handler: paramRejectHandler): void;
export function $addParamRejectionHandler(target: object, methodKey: string | symbol, handlers: ParamRejectHandlerChain): void;
export function $addParamRejectionHandler(target: object, methodKey: string | symbol, handlerOrHandlers: any): void {
    const descriptor = getDescriptor(target, methodKey);

    // 确保 paramRejectHandlers 数组存在
    if (!descriptor.paramRejectHandlers) {
        descriptor.paramRejectHandlers = [];
    }

    // 检查是否是处理器链格式（数组的数组或对象）
    const isHandlerChain =
        (Array.isArray(handlerOrHandlers) && Array.isArray(handlerOrHandlers[0])) ||
        (typeof handlerOrHandlers === "object" && !Array.isArray(handlerOrHandlers));

    if (isHandlerChain) {
        // 使用包装器处理处理器链
        const wrapper = createParamWrapperReject(handlerOrHandlers);
        descriptor.paramRejectHandlers.push(wrapper);
    } else {
        // 单个处理器
        descriptor.paramRejectHandlers.push(handlerOrHandlers as paramRejectHandler);
    }

    setDescriptor(target, methodKey, descriptor);
}

/**
 * Apply getter handlers for a property
 * 应用属性的 getter 处理器
 */
export function $applyGetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any {
    const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(prototype, propertyKey);
    const getters = descriptor.getters || [];
    if (getters.length === 0) return value;

    return getters.reduce((prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]), value);
}
/**
 * Apply setter handlers for a property
 * 应用属性的 setter 处理器
 */
export function $applySetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any {
    const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(prototype, propertyKey);
    const setters = descriptor.setters || [];
    if (setters.length === 0) return value;

    return setters.reduce((prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]), value);
}
/**
 * Apply parameter handlers for a method
 * 应用方法的参数处理器
 */
export function $applyParamHandlers(
    receiver: any,
    methodKey: string | symbol,
    method: Function,
    args: any[]
): {
    approached: boolean;
    output: any;
} {
    // const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(receiver, methodKey);
    const paramHandlers = descriptor.paramHandlers || [];
    if (paramHandlers.length === 0)
        return {
            approached: false,
            output: args,
        };

    try {
        const result = paramHandlers.reduce(
            (prev, handler, idx, arr) => {
                const r = handler(receiver, methodKey, method, args, prev, idx, [...arr]);
                return typeof r === "boolean"
                    ? {
                          approached: r,
                          output: prev.output,
                      }
                    : r;
            },
            {
                approached: false,
                output: args,
            }
        );
        return result;
    } catch (error) {
        debugLogger(console.error, "Parameter handler error for method", methodKey, ":", error);
        return {
            approached: false,
            output: args,
        }; // 发生错误时返回原始参数
    }
}

/**
 * Apply parameter rejection handlers for a method
 * 应用方法的参数回绝处理器
 */
export function $applyParamRejectionHandlers(
    receiver: any,
    methodKey: string | symbol,
    method: Function,
    args: any[],
    FilterLastOutput: any
): {
    approached: boolean;
    output: any;
} {
    // const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(receiver, methodKey);
    const rejectHandlers = descriptor.paramRejectHandlers || [];
    if (rejectHandlers.length === 0)
        return {
            approached: false,
            output: args,
        };

    try {
        const result = rejectHandlers.reduce(
            (prev, handler, idx, arr) => {
                const r = handler(receiver, methodKey, method, args, FilterLastOutput, prev, idx, [...arr]);
                return typeof r === "boolean"
                    ? {
                          approached: r,
                          output: prev.output,
                      }
                    : r;
            },
            {
                approached: false,
                output: args,
            }
        );
        return result;
    } catch (error) {
        debugLogger(console.error, "Parameter reject handler error for method", methodKey, ":", error);
        return {
            approached: false,
            output: args,
        }; // 发生错误时返回原始参数
    }
}

export const createParamWrapperFilter = (handlerChain: ParamFilterHandlerChain): paramFilterHandler => {
    // 创建完整的参数处理器数组，确保所有索引都有值
    let paramsChain: (paramFilterChainHandler[] | undefined)[] = [];

    if (Array.isArray(handlerChain)) {
        // 数组格式
        paramsChain = [...handlerChain];
    } else {
        // 对象格式 {paramIndex: handlers}
        const maxIndex = Math.max(...Object.keys(handlerChain).map(Number));
        paramsChain = Array(maxIndex + 1).fill(undefined);

        for (const [indexStr, handlers] of Object.entries(handlerChain)) {
            const index = Number(indexStr);
            paramsChain[index] = handlers;
        }
    }

    return function (thisArg, methodName, method, args, prevResult, currentIndex, handlers) {
        let processedArgs = [...prevResult.output];
        let anyApproached = false;

        // 处理每个参数的处理器链
        for (let argIdx = 0; argIdx < paramsChain.length; argIdx++) {
            const chain = paramsChain[argIdx];
            if (!chain || chain.length === 0) continue;

            const result = chain.reduce(
                (prev, handler, handlerIndex, handlerArray) => {
                    const r = handler(thisArg, methodName, method, argIdx, args, prevResult.output, prev, currentIndex, handlers);

                    return typeof r === "boolean" ? { approached: r, output: prev.output } : r;
                },
                { approached: false, output: processedArgs[argIdx] }
            );

            processedArgs[argIdx] = result.output;
            if (result.approached) {
                anyApproached = true;
            }
        }

        return {
            approached: anyApproached,
            output: processedArgs,
        };
    };
};

export const createParamWrapperReject = (handlerChain: ParamRejectHandlerChain): paramRejectHandler => {
    // 创建完整的参数拒绝处理器数组，确保所有索引都有值
    let paramsChain: (paramRejectChainHandler[] | undefined)[] = [];

    if (Array.isArray(handlerChain)) {
        // 数组格式
        paramsChain = [...handlerChain];
    } else {
        // 对象格式 {paramIndex: handlers}
        const maxIndex = Math.max(...Object.keys(handlerChain).map(Number));
        paramsChain = Array(maxIndex + 1).fill(undefined);

        for (const [indexStr, handlers] of Object.entries(handlerChain)) {
            const index = Number(indexStr);
            paramsChain[index] = handlers;
        }
    }

    return function (thisArg, methodName, method, args, FilterLastOutput, prevResult, currentIndex, handlers) {
        let processedArgs = [...prevResult.output];
        let anyApproached = false;

        // 处理每个参数的拒绝处理器链
        for (let argIdx = 0; argIdx < paramsChain.length; argIdx++) {
            const chain = paramsChain[argIdx];
            if (!chain || chain.length === 0) continue;

            const result = chain.reduce(
                (prev, handler, handlerIndex, handlerArray) => {
                    const r = handler(
                        thisArg,
                        methodName,
                        method,
                        argIdx,
                        args,
                        prevResult.output,
                        FilterLastOutput,
                        prev,
                        currentIndex,
                        handlers
                    );

                    return typeof r === "boolean" ? { approached: r, output: prev.output } : r;
                },
                { approached: false, output: processedArgs[argIdx] }
            );

            processedArgs[argIdx] = result.output;
            if (result.approached) {
                anyApproached = true;
            }
        }

        return {
            approached: anyApproached,
            output: processedArgs,
        };
    };
};
