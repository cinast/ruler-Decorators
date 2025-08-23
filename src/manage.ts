import { debugLogger } from "./api.test";
import { decoratorType, rd_Descriptor, Storage } from "./rulerDecorators";
import { applyGetterHandlers, applySetterHandlers } from "./utils";
import { rd_SetterHandle, rd_GetterHandle, paramHandler, paramRejectionHandler } from "./type.handles";

/**
 * 标记属性由类代理管理
 */
export function markPropertyAsClassProxyManaged(target: object, propertyKey: string | symbol): void {
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

/**
 * Get or create target map for storage
 * 获取或创建目标存储映射
 */
export function getOrCreateTargetMap(target: object): Map<string | symbol, rd_Descriptor> {
    let targetMap = Storage.get(target);
    if (!targetMap) {
        targetMap = new Map();
        Storage.set(target, targetMap);
    }
    return targetMap;
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
    const targetMap = Storage.get(target);
    return !!targetMap && targetMap.size > 0;
}

/**
 * Get all descriptors for target
 * 获取目标的所有描述符
 */
export function getAllDescriptors(target: object): Map<string | symbol, rd_Descriptor> | undefined {
    return Storage.get(target);
}

/**
 * Create accessor-based interception (traditional getter/setter)
 * 创建基于访问器的拦截（传统 getter/setter）
 */
export function createAccessorInterception(instance: any, targetPrototype: any): any {
    const handlerProperties = new Set<string | symbol>();
    const targetMap = Storage.get(targetPrototype);

    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            if (descriptor.setters?.length || descriptor.getters?.length) {
                handlerProperties.add(propertyKey);
            }
        }
    }

    for (const propertyKey of handlerProperties) {
        // 获取初始值并应用setter处理器
        let value = applySetterHandlers(instance, propertyKey, instance[propertyKey]);

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
                return applyGetterHandlers(receiver, propertyKey, value);
            }
            return Reflect.get(target, propertyKey, receiver);
        },

        set(target, propertyKey, value, receiver) {
            const descriptor = getDescriptor(prototype, propertyKey);
            if (descriptor.propertyMode === "proxy") {
                debugLogger(console.log, "Property Proxy setter triggered for", propertyKey, "with value", value);
                const processedValue = applySetterHandlers(receiver, propertyKey, value);
                return Reflect.set(target, propertyKey, processedValue, receiver);
            }
            return Reflect.set(target, propertyKey, value, receiver);
        },
    });

    const targetMap = Storage.get(prototype);
    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            if (descriptor.propertyMode === "accessor") {
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

            // 检查属性是否由类代理管理
            const descriptor = getDescriptor(prototype, propertyKey);
            if (descriptor.managedByClassProxy) {
                const getters = descriptor.getters || [];
                if (getters.length > 0) {
                    value = getters.reduce(
                        (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                        value
                    );
                }
            }

            if (typeof value === "function") {
                return value.bind(receiver);
            }
            return value;
        },

        set(target, propertyKey, value, receiver) {
            debugLogger(console.log, "Class Proxy setter triggered for", propertyKey, "with value", value);

            // 检查属性是否由类代理管理
            const descriptor = getDescriptor(prototype, propertyKey);
            let processedValue = value;

            if (descriptor.managedByClassProxy) {
                const setters = descriptor.setters || [];
                if (setters.length > 0) {
                    processedValue = setters.reduce(
                        (prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]),
                        value
                    );
                }
            }

            return Reflect.set(target, propertyKey, processedValue, receiver);
        },
    });

    const targetMap = Storage.get(prototype);
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
export function $addParamHandler(target: object, methodKey: string | symbol, handler: paramHandler): void {
    const descriptor = getDescriptor(target, methodKey);
    descriptor.paramHandlers = [...(descriptor.paramHandlers || []), handler];
    setDescriptor(target, methodKey, descriptor);
}

/**
 * Add parameter rejection handler to specified method
 * 添加参数拒绝处理器到指定方法
 */
export function $addParamRejectionHandler(target: object, methodKey: string | symbol, handler: paramRejectionHandler): void {
    const descriptor = getDescriptor(target, methodKey);
    descriptor.paramRejectHandlers = [...(descriptor.paramRejectHandlers || []), handler];
    setDescriptor(target, methodKey, descriptor);
}

/**
 * 获取或创建属性模式映射
 */
export function getPropertyModes(target: any): Map<string | symbol, "proxy" | "accessor"> {
    const targetMap = Storage.get(target);
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
