import { debugLogger } from "./api.test";
import { decoratorType, rd_Descriptor, Storage } from "./rulerDecorators";
import { applyGetterHandlers, applySetterHandlers } from "./utils";
import { rd_SetterHandle, rd_GetterHandle, paramHandler, paramRejectionHandler } from "./type.handles";

/**
 * Get or create descriptor for target property
 * 获取或创建目标属性的描述符
 */
export function getDescriptor(target: object, propertyKey: string | symbol): rd_Descriptor {
    let targetMap = Storage.get(target);
    if (!targetMap) {
        targetMap = new Map();
        Storage.set(target, targetMap);
    }

    let descriptor = targetMap.get(propertyKey);
    if (!descriptor) {
        descriptor = {
            interceptionEnabled: false,
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
    let targetMap = Storage.get(target);
    if (!targetMap) {
        targetMap = new Map();
        Storage.set(target, targetMap);
    }
    targetMap.set(propertyKey, descriptor);
}
/**
 * Check if target has any descriptors
 * 检查目标是否有任何描述符
 */
function hasDescriptors(target: object): boolean {
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
    // 获取所有有处理器的属性
    const handlerProperties = new Set<string | symbol>();
    const targetMap = Storage.get(targetPrototype);

    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            if (descriptor.setters?.length || descriptor.getters?.length) {
                handlerProperties.add(propertyKey);
            }
        }
    }

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
 * Create property proxy for instance (intercept only decorated properties)
 * 为实例创建属性代理（只拦截被装饰的属性）
 */
export function createPropertyProxy(instance: any, prototype: any): any {
    // 检查是否已经有代理实例
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
            // 获取属性描述符
            const descriptor = getDescriptor(prototype, propertyKey);

            // 只拦截配置为Proxy模式的属性
            if (descriptor.propertyMode === "proxy") {
                debugLogger(console.log, "Property Proxy getter triggered for", propertyKey);
                let value = Reflect.get(target, propertyKey, receiver);
                return applyGetterHandlers(receiver, propertyKey, value);
            }

            // 直接返回其他属性
            return Reflect.get(target, propertyKey, receiver);
        },

        set(target, propertyKey, value, receiver) {
            // 获取属性描述符
            const descriptor = getDescriptor(prototype, propertyKey);

            // 只拦截配置为Proxy模式的属性
            if (descriptor.propertyMode === "proxy") {
                debugLogger(console.log, "Property Proxy setter triggered for", propertyKey, "with value", value);
                const processedValue = applySetterHandlers(receiver, propertyKey, value);
                return Reflect.set(target, propertyKey, processedValue, receiver);
            }

            // 直接设置其他属性
            return Reflect.set(target, propertyKey, value, receiver);
        },
    });

    // 为配置为Accessor模式的属性创建访问器
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

            // 存储代理和原始实例的映射关系
            descriptor.proxyInstance = proxy;
            descriptor.originalInstance = instance;
            targetMap.set(propertyKey, descriptor);
        }
    }

    return proxy;
}
/**
 * Create global proxy for instance (intercept all properties)
 * 为实例创建全局代理（拦截所有属性）
 */
export function createGlobalProxy(instance: any, prototype: any): any {
    // 检查是否已经有代理实例
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
            debugLogger(console.log, "Global Proxy getter triggered for", propertyKey);

            // 获取原始值
            let value = Reflect.get(target, propertyKey, receiver);

            // 检查是否有属性级处理器
            const descriptor = getDescriptor(prototype, propertyKey);
            const getters = descriptor.getters || [];

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
            const descriptor = getDescriptor(prototype, propertyKey);
            const setters = descriptor.setters || [];

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

    // 存储代理和原始实例的映射关系
    const targetMap = Storage.get(prototype);
    if (targetMap) {
        for (const [propertyKey, descriptor] of targetMap.entries()) {
            descriptor.proxyInstance = proxy;
            descriptor.originalInstance = instance;
            targetMap.set(propertyKey, descriptor);
        }
    }

    return proxy;
} //#region
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
//#endregion
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
} // 获取或创建属性模式映射

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
/**
 * Determine decorator type based on parameters
 * 根据参数确定装饰器类型
 */

export function determineDecoratorType(
    target: any,
    propertyKey: string | symbol | undefined,
    descriptor: PropertyDescriptor | undefined
): decoratorType {
    if (typeof propertyKey === "undefined") {
        return "ClassDecorator";
    }

    if (descriptor && typeof descriptor.value === "function") {
        return "MethodDecorator";
    }

    if (descriptor && (descriptor.get || descriptor.set)) {
        return "PropertyDecorator";
    }

    return "PropertyDecorator";
}
