/**
 * Code candies library for property decoration
 * 属性装饰的代码糖果库
 *
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-8
 * @version 1.0.0
 *
 * @notice Decorators type: experimental stage 2
 * 注意：装饰器类型为实验性stage 2
 *
 * @warning tsconfig `experimentalDecorators` must be `true`
 * 警告：必须设置tsconfig的experimentalDecorators为true
 *
 * @tip tsconfig.json should be placed at ts files' parent or sibling folders
 * 提示：tsconfig.json应放在ts文件的父级或同级目录
 *
 * @tip tsc needs 5.2+
 * 提示：需要TypeScript 5.2+版本
 */
"use strict";

import { rulerDecorators } from "./rulesLibrary";
export * from "./rulesLibrary";

/**
 *           ———————— 注意事项 Notice ————————
 */

/**
 * @WARNING @DEBUGGING
 * 警告：调试相关
 */

/**
 * @WARNING
 * @Mind the order of the decorators, as they are applied in the order they are defined.
 * 注意：装饰器按定义顺序应用
 * @Mind the getter and setter will might call each other INFINITY
 * 注意：getter和setter可能会无限互相调用
 *
 *          setter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → ...
 *          setter → setter → setter → setter → setter → setter → setter → setter → setter → setter → setter → setter → setter → setter → ...
 *
 *          世纪笑话↑
 */

//     -------- 核心 core --------

/**
 * Storage for actual values and wrapper functions
 * 存储实际值和包装函数
 */
const instanceStorage = new WeakMap<object, Record<string | symbol, any>>();
const wrapperCache = new WeakMap<object, Record<string | symbol, Function>>();

/**
 * Storage for property handler chains
 * 存储每个属性的句柄链
 */
const setterHandlers = new WeakMap<object, Map<string | symbol, rd_SetterHandle[]>>();
const getterHandlers = new WeakMap<object, Map<string | symbol, rd_GetterHandle[]>>();

/**
 * Type definition for setter handler
 * setter句柄类型定义
 */
export type rd_SetterHandle = <T = any>(
    target: any,
    attr: string | symbol,
    value: any,
    lastResult: unknown,
    index: number,
    handlers: rd_SetterHandle[],
    ...args: any[]
) => any;

/**
 * Type definition for getter handler
 * getter句柄类型定义
 */
export type rd_GetterHandle = <T = any>(
    target: any,
    attr: string | symbol,
    lastResult: unknown,
    index: number,
    handlers: rd_GetterHandle[],
    ...args: any[]
) => any;

/**
 * Add setter handler to specified property
 * 添加 setter 句柄到指定属性
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Setter handler to add
 *                要添加的 setter 句柄
 */
export function addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void {
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
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Getter handler to add
 *                要添加的 getter 句柄
 */
export function addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void {
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
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Getter handler to remove
 *                要移除的 setter 句柄
 * @returns Whether the handler was removed
 *         是否成功移除句柄
 */
export function removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean {
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
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Getter handler to remove
 *                要移除的 getter 句柄
 * @returns Whether the handler was removed
 *         是否成功移除句柄
 */
export function removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean {
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
 * Decorator factory: creates adaptive decorator
 * 装饰器工厂：创建自适应装饰器
 * @param initialSetters - Initial setter handlers array
 *                       初始 setter 句柄数组
 * @param initialGetters - Initial getter handlers array
 *                       初始 getter 句柄数组
 * @returns Adaptive decorator function
 *         自适应装饰器函数
 */
export const $$init = (initialSetters: rd_SetterHandle[] = [], initialGetters: rd_GetterHandle[] = []) => {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        // === 类装饰器处理 ===
        if (typeof propertyKey === "undefined") {
            // 检查target是否为可继承的类
            if (typeof target === "function" && target.prototype) {
                return class extends target {
                    constructor(...args: any[]) {
                        super(...args);
                        instanceStorage.set(this, {});
                    }
                };
            }
            // 如果不是类则直接返回
            return target;
        }

        const key = propertyKey as string | symbol;
        const targetObj = target; // 保存目标对象（类原型或构造函数）

        // === 初始化句柄存储 ===
        // 初始化 setter 句柄
        let settersMap = setterHandlers.get(targetObj);
        if (!settersMap) {
            settersMap = new Map();
            setterHandlers.set(targetObj, settersMap);
        }

        if (!settersMap.has(key)) {
            settersMap.set(key, [...initialSetters]);
        }

        // 初始化 getter 句柄
        let gettersMap = getterHandlers.get(targetObj);
        if (!gettersMap) {
            gettersMap = new Map();
            getterHandlers.set(targetObj, gettersMap);
        }

        if (!gettersMap.has(key)) {
            gettersMap.set(key, [...initialGetters]);
        }

        // === 属性/方法/访问器装饰器处理 ===
        // 存储原始值或描述符
        if (!instanceStorage.has(targetObj)) {
            instanceStorage.set(targetObj, {});
        }
        const protoStore = instanceStorage.get(targetObj)!;

        if (descriptor) {
            if ("value" in descriptor) {
                // 方法装饰器
                protoStore[key] = descriptor.value;
            } else if ("get" in descriptor || "set" in descriptor) {
                // 访问器装饰器
                protoStore[key] = descriptor;
            }
        }

        return {
            configurable: true,
            enumerable: descriptor ? descriptor.enumerable : true,

            // 统一的 setter 处理
            set(this: any, value: any) {
                let objStore = instanceStorage.get(this);
                if (!objStore) {
                    objStore = {};
                    instanceStorage.set(this, objStore);
                }

                // 获取当前 setter 句柄链
                const setters = setterHandlers.get(targetObj)?.get(key) || [];

                // 执行句柄链
                const result = setters.reduce(
                    (prev, handler, idx, arr) => handler(this, key, value, prev, idx, [...arr]),
                    undefined
                );

                // 存储处理结果
                objStore[key] = result;

                // 清除包装缓存
                const wrapperMap = wrapperCache.get(this);
                if (wrapperMap) {
                    delete wrapperMap[key];
                }
            },

            // 统一的 getter 处理
            get(this: any) {
                // 获取当前 getter 句柄链
                const getters = getterHandlers.get(targetObj)?.get(key) || [];

                // 解析基础值
                let baseValue: any;
                const objStore = instanceStorage.get(this) || {};

                if (key in objStore) {
                    // 实例自有值
                    baseValue = objStore[key];
                } else {
                    // 原型链上的值（方法/访问器）
                    const protoStore = instanceStorage.get(targetObj) || {};
                    baseValue = protoStore[key];
                }

                // 特殊处理：方法装饰器
                if (typeof baseValue === "function") {
                    let wrapperMap = wrapperCache.get(this);
                    if (!wrapperMap) {
                        wrapperMap = {};
                        wrapperCache.set(this, wrapperMap);
                    }

                    // 使用缓存或创建新包装
                    if (!wrapperMap[key]) {
                        wrapperMap[key] = function (this: any, ...args: any[]) {
                            let result = baseValue.apply(this, args);

                            // 应用 getter 链（对返回值处理）
                            return getters.reduce((prev, handler, idx, arr) => handler(this, key, prev, idx, [...arr]), result);
                        };
                    }
                    return wrapperMap[key];
                }

                // 常规属性处理
                return getters.reduce((prev, handler, idx, arr) => handler(this, key, prev, idx, [...arr]), baseValue);
            },
        };
    };
};

//     -------- 调用接口 api functions --------

/**
 * Str句柄注入器 装饰器工厂
 * Setter injector decorator Factory.
 * @factory
 * @param handle - Function to define the setter behavior.
 * @returns A property decorator.
 *
 * @overload Method decorator (for set accessors)
 * @param handle - Function to define the setter behavior
 * @returns A method decorator for set accessors
 *
 * @overload Auto-accessor decorator
 * @param handle - Function to define the setter behavior
 * @returns An auto-accessor decorator
 */
export function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): PropertyDecorator;
export function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): MethodDecorator;
export function $setter<T>(
    handle: (thisArg: any, attr: string | symbol, value: T, ...arg: any[]) => T
): PropertyDecorator | MethodDecorator {
    return function (target: any, attr: string | symbol, descriptor?: PropertyDescriptor) {
        if (!instanceStorage.has(target)) $$init()(target);

        addSetterHandler(target, attr, function (thisArg, key, value, lastResult, index, handlers) {
            return handle(thisArg, key, value, lastResult, index, handlers);
        });

        if (descriptor) {
            return descriptor;
        }
    };
}

/**
 * Gtr句柄注入器 装饰器工厂
 * Getter injector decorator Factory.
 * @factory
 * @param handle - Function to define the getter behavior.
 * @returns A property decorator.
 *
 * @overload Method decorator (for get accessors)
 * @param handle - Function to define the getter behavior
 * @returns A method decorator for get accessors
 *
 * @overload Auto-accessor decorator
 * @param handle - Function to define the getter behavior
 * @returns An auto-accessor decorator
 */
export function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
export function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): MethodDecorator;
export function $getter(
    handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown
): PropertyDecorator | MethodDecorator {
    return function (target: any, attr: string | symbol, descriptor?: PropertyDescriptor) {
        if (!instanceStorage.has(target)) $$init()(target);

        addGetterHandler(target, attr, function (thisArg, key, lastResult, index, handlers) {
            return handle(thisArg, key, lastResult, index, handlers);
        });

        if (descriptor) {
            return descriptor;
        }
    };
}

/**
 * and anywise
 * @param props
 * @returns
 */
export function $defineProperty<T>(...props: any[]): PropertyDecorator {
    return function (target: any, attr: string | symbol) {
        Object.defineProperty(target, attr, props);
    };
}

/**
 * Debugger decorator factory that pauses execution during decorator application.
 * Supports all decorator types: class, method, property, and parameter decorators.
 *
 * @param logArgs - Whether to log the decorator arguments to console (default: false)
 * @param debuggers - Additional debug handlers: strings (logged) or functions (executed with decorator args)
 *
 * @example
 * // Class decorator
 * @$debugger(true, "Debugging class")
 * class MyClass {
 *
 *   // Property decorator
 *   @$debugger(true, (target, key) => `Debugging property: ${String(key)}`)
 *   myProperty = "";
 *
 *   // Method decorator
 *   @$debugger()
 *   myMethod(
 *     // Parameter decorator
 *     @$debugger(true) param: string
 *   ) {}
 * }
 */
/**
 * 在装饰器上加debugger
 *
 * Debugger decorator factory that pauses execution during decorator application.
 * Supports all decorator types: class, method, property, and parameter decorators.
 *
 * @param logArgs - Whether to log the decorator arguments to console (default: false)
 * @param debuggers - Additional debug handlers: strings (logged) or functions (executed with decorator args)
 *
 * @example
 * // Class decorator
 * @$debugger(true, "Debugging class")
 * class MyClass {
 *
 *   // Property decorator
 *   @$debugger(true, (target, key) => `Debugging property: ${String(key)}`)
 *   myProperty = "";
 *
 *   // Method decorator
 *   @$debugger()
 *   myMethod(
 *     // Parameter decorator
 *     @$debugger(true) param: string
 *   ) {}
 * }
 */
export function $debugger(
    logArgs: boolean = false,
    ...debuggers: (string | ((...args: any[]) => any))[]
): ClassDecorator & MethodDecorator & PropertyDecorator & ParameterDecorator {
    const shouldLogArgs = typeof logArgs === "boolean" ? logArgs : false;
    const debugHandlers = typeof logArgs === "boolean" ? debuggers : [logArgs, ...debuggers].filter(Boolean);

    return function (...args: any[]) {
        if (shouldLogArgs) {
            console.log(`🚨 ${getDecoratorType(args)} decorator arguments:`);
            console.log(args);
        }
        debugger;

        debugHandlers.forEach((debug, i) => {
            try {
                if (typeof debug === "string") console.log(`📢 ${debug}`);
                else if (typeof debug === "function") {
                    const result = debug(...args);
                    console.log({
                        index: `${i}`,
                        message: `📢 Debugger result: ${result}`,
                    });
                }
            } catch (e) {
                console.error(`⚠️ Debug handler[${i}] error:`, e);
            }
        });

        switch (args.length) {
            case 1: // Class decorator: [constructor]
                return class extends args[0] {};

            case 2: // Property decorator: [target, attr]
                return;

            case 3:
                if (typeof args[2] === "number") {
                    // Parameter decorator
                    return;
                } else {
                    // Method decorator
                    return args[2];
                }

            default:
                console.warn("⚠️ Unsupported decorator signature", args);
                return;
        }
    };
}

/** Identifies decorator type from arguments */
function getDecoratorType(args: any[]): string {
    switch (args.length) {
        case 1:
            return "CLASS";
        case 2:
            return "PROPERTY";
        case 3:
            return typeof args[2] === "number" ? "PARAMETER" : "METHOD";
        default:
            return "UNKNOWN";
    }
}

//     -------- 神器 wonderful tools --------

/**
 * Conditional write decorator
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
export const $conditionalWrite = <T = any>(...conditionHandles: (boolean | ((thisArg: any, key: any, v: T) => boolean))[]) => {
    return $setter<T>((thisArg, key, newVal: T) => {
        // console.log("$conditionalWrite run");
        // console.log(
        //     thisArg,
        //     key,
        //     newVal,
        //     conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, newVal) : h))
        // );
        // console.log("——————");

        if (conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, newVal) : h))) {
            return newVal;
        } else {
            if (rulerDecorators.__Setting.readOnlyPropertyWarningEnabled) {
                console.warn(` ${conditionHandles.map((h) => (typeof h === "function" ? h(thisArg, key, newVal) : h))}`);
                console.warn(`${conditionHandles}`);
                switch (rulerDecorators.__Setting.readOnlyPropertyWarningType) {
                    case "Warning":
                        console.warn(`⚠️ Attempted to write to read-only property '${String(key)}'`);
                        break;
                    case "Error":
                        throw new Error(`🚫 Attempted to write to read-only property '${String(key)}`);
                }
            }
            return thisArg[key];
        }
    });
};

/**
 * Conditional read decorator
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
export const $conditionalRead = (...conditionHandles: (boolean | ((thisArg: any, key: any, value: any) => boolean))[]) => {
    return $getter((thisArg, key, value) => {
        // console.log("$conditionalRead run");
        // console.log(
        //     thisArg,
        //     key,
        //     value,
        //     conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, value) : h))
        // );
        // console.log("——————");

        if (conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, value) : h))) {
            return value;
        } else {
            if (rulerDecorators.__Setting.readOnlyPropertyWarningEnabled) {
                console.warn(` ${conditionHandles.map((h) => (typeof h === "function" ? h(thisArg, key, value) : h))}`);
                console.warn(`${conditionHandles}`);
                switch (rulerDecorators.__Setting.readOnlyPropertyWarningType) {
                    case "Warning":
                        console.warn(`⚠️ Cannot read this properties under unsatisfied conditions '${String(key)}'`);
                        break;
                    case "Error":
                        throw new Error(`🚫 Cannot read this properties under unsatisfied conditions '${String(key)}`);
                }
            }
            return void 0;
        }
    });
};

/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
export const watchSet = <T>(handle: (thisArg: any, attr: string | symbol, value: T) => T) => $setter<T>(handle);
