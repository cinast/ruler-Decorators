/**
 * @this
 * @core
 * Code candies library for property decoration CORE
 * 属性装饰的代码糖果库的底层核心
 *
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-8
 * @version 1.0.0
 *
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
("use strict");
import { __Setting } from "./moduleMeta";
import { getDecoratorType } from "./utils";

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
interface InstanceStorageValue {
    [key: string | symbol]: any;
}

import { rd_GetterHandle, rd_SetterHandle } from "./type.handles";
export const instanceStorage = new WeakMap<object, InstanceStorageValue>();
export const wrapperCache = new WeakMap<object, Record<string | symbol, Function>>();

/**
 * Storage for property handler chains
 * 存储每个属性的句柄链
 */
export const setterHandlers = new WeakMap<object, Map<string | symbol, rd_SetterHandle[]>>();
export const getterHandlers = new WeakMap<object, Map<string | symbol, rd_GetterHandle[]>>();

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
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Getter handler to add
 *                要添加的 getter 句柄
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
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Getter handler to remove
 *                要移除的 setter 句柄
 * @returns Whether the handler was removed
 *         是否成功移除句柄
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
 * @param target - Class prototype or constructor
 *               类原型或构造函数
 * @param propertyKey - Property name
 *                    属性名
 * @param handler - Getter handler to remove
 *                要移除的 getter 句柄
 * @returns Whether the handler was removed
 *         是否成功移除句柄
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
 * Decorator factory: creates adaptive decorator
 * 装饰器工厂：创建自适应装饰器
 * @Required_at_use 目前没法隐式自动调用
 *
 * @param initialSetters - Initial setter handlers array
 *                       初始 setter 句柄数组
 * @param initialGetters - Initial getter handlers array
 *                       初始 getter 句柄数组
 * @returns Adaptive decorator function
 *         自适应装饰器函数
 */
export const $$init = (initialSetters: rd_SetterHandle[] = [], initialGetters: rd_GetterHandle[] = []) => {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        console.log("$$init decorator applied to:", target?.name || target, propertyKey, descriptor);

        // 初始化instanceStorage
        const initStorage = (t: any) => !instanceStorage.has(t) && instanceStorage.set(t, {});
        initStorage(target);
        if (typeof target === "function" && target.prototype) {
            initStorage(target.prototype);
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
                        console.log("Decorated class constructor called");

                        // 初始化实例存储
                        const instance: InstanceStorageValue = {};
                        instanceStorage.set(this, instance);

                        // 处理所有装饰属性初始值
                        const settersMap = setterHandlers.get(target.prototype) || new Map();
                        for (const [key, handlers] of settersMap.entries()) {
                            const initialValue = this[key];
                            console.log(`Processing decorated property ${String(key)} with initial value:`, initialValue);

                            const processed = handlers.reduce((val: any, handler: rd_SetterHandle) => {
                                const result = handler(this, key, val, val, 0, handlers);
                                console.log(`Handler for ${String(key)} processed value:`, val, "=>", result);
                                return result;
                            }, initialValue);

                            instance[key] = processed;
                            console.log(`Final value for ${String(key)}:`, processed);
                        }

                        console.log("Instance fully initialized with decorated values:", instance);
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

        if (!settersMap.has(key)) settersMap.set(key, [...initialSetters]);

        // 初始化 getter 句柄
        let gettersMap = getterHandlers.get(targetObj);
        if (!gettersMap) {
            gettersMap = new Map();
            getterHandlers.set(targetObj, gettersMap);
        }

        if (!gettersMap.has(key)) gettersMap.set(key, [...initialGetters]);

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
                console.log("Setter triggered for", key, "with value", value);
                let objStore = instanceStorage.get(this);
                if (!objStore) {
                    objStore = {};
                    instanceStorage.set(this, objStore);
                }

                // 获取当前 setter 句柄链
                const setters = setterHandlers.get(targetObj)?.get(key) || [];

                // 执行句柄链
                const result = setters.reduce(
                    (prev, handler, idx, arr) => {
                        const newVal = handler(this, key, value, prev, idx, [...arr]);
                        console.log(`Handler ${idx} processed value:`, newVal);
                        return newVal;
                    },
                    value // 初始值使用传入的value
                );

                // 存储处理结果
                objStore[key] = result;
                console.log("Final stored value:", result);
                console.log("Stored in value:", instanceStorage.get(this));

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
        // if (!instanceStorage.has(target)) $$init()(target, attr, descriptor);

        $addSetterHandler(target, attr, function (thisArg, key, value, lastResult, index, handlers) {
            return handle(thisArg, key, value, lastResult, index, handlers);
        });
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
        // if (!instanceStorage.has(target)) $$init()(target, attr, descriptor);

        $addGetterHandler(target, attr, function (thisArg, key, lastResult, index, handlers) {
            return handle(thisArg, key, lastResult, index, handlers);
        });
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

//     -------- 神器 wonderful tools --------

import { conditionHandler, rejectionHandler } from "./type.handles";

/**
 * Conditional write decorator with chainable handlers
 * 带链式处理的条件写入装饰器
 *
 * @template T - Property value type
 *
 * @param conditionHandles - Array of conditions to check. Can be:
 *  - Boolean values
 *  - Functions with signature:
 *    `(thisArg, key, value, prevResult, currentIndex, handlers) => boolean`
 *  条件检查数组，可以是：
 *  - 布尔值
 *  - 函数签名：`(thisArg, key, value, prevResult, currentIndex, handlers) => boolean`
 *
 * @param [rejectHandlers] - Optional array of rejection handlers with signature:
 *  `(thisArg, key, value, prevResult, currentIndex, handlers) => T`
 *  可选的拒绝处理数组，函数签名：
 *  `(thisArg, key, value, prevResult, currentIndex, handlers) => T`
 *
 * @returns Property/Method/Auto-accessor decorator
 * 返回属性/方法/自动访问器装饰器
 *
 * @behavior
 * - Returns `newValue` if all conditions pass
 * - Returns `rejectHandler` result if any condition fails
 * - Returns original value if no rejectHandler provided
 * - Can warn/throw based on __Setting configuration
 *
 * 行为：
 * - 所有条件通过时返回新值
 * - 任一条件失败时返回rejectHandler结果
 * - 未提供rejectHandler时返回原值
 * - 根据__Setting配置发出警告/抛出错误
 */
export const $conditionalWrite = <T = any>(conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) => {
    return $setter<T>((thisArg, key, newVal) => {
        const callResult = conditionHandles.reduce(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, newVal, lastProcess, idx, arr);
                return typeof r == "boolean"
                    ? {
                          approached: r,
                          output: lastProcess.output,
                      }
                    : r;
            },
            {
                approached: true,
                output: newVal,
            }
        );

        if (callResult.approached) return callResult.output;

        if (rejectHandlers?.length) {
            const rejectResult = rejectHandlers.reduce(
                (lastProcess, handler, idx, arr) => {
                    const r = handler(thisArg, key, newVal, callResult, lastProcess, idx, arr);
                    return typeof r == "boolean"
                        ? {
                              approached: r,
                              output: lastProcess,
                          }
                        : r;
                },
                {
                    approached: true,
                    output: newVal,
                }
            );
            if (rejectResult.approached) return rejectResult.output;
            // 默认拒绝行为
            if (__Setting.readOnlyPropertyWarningEnabled) {
                const warningMsg = `Property '${String(key)}' write rejected. Final output: ${JSON.stringify(
                    rejectResult.output
                )}`;
                switch (__Setting.readOnlyPropertyWarningType) {
                    case "Warning":
                        console.warn(`⚠️ ${warningMsg}`);
                        break;
                    case "Error":
                        throw new Error(`🚫 ${warningMsg}`);
                }
            }
            return thisArg[key]; // Fallback to original value
        }
    });
};

/**
 * Conditional read decorator
 * 条件读取限制器
 *
 * return nothing and keep still if handles didn't approach you
 * Once approached, get what you want
 * 条件不通过就得到无，反之得到值
 *
 * @param conditionHandles - Conditions to check
 * 条件句柄
 * @param reject - do sth after been not approached
 * 回绝句柄
 *
 * @returns Decorator function
 * @returns @returns
 * `original` on test approached \
 * `rejectReturn` on rejected \
 * `void undefined` on rejected & no reject handle \
 * `warning` `throw error` see __Setting.readOnlyPropertyWarningEnabled __Setting.readOnlyPropertyWarningType
 *
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 */
export const $conditionalRead = <T = any>(conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) => {
    return $getter((thisArg, key, value) => {
        const callResult = conditionHandles.reduce(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, value, lastProcess, idx, arr);
                return typeof r == "boolean"
                    ? {
                          approached: r,
                          output: lastProcess.output,
                      }
                    : r;
            },
            {
                approached: true,
                output: value,
            }
        );

        if (callResult.approached) return callResult.output;

        if (rejectHandlers?.length) {
            const rejectResult = rejectHandlers.reduce(
                (lastProcess, handler, idx, arr) => {
                    const r = handler(thisArg, key, value, callResult, lastProcess, idx, arr);
                    return typeof r == "boolean"
                        ? {
                              approached: r,
                              output: lastProcess,
                          }
                        : r;
                },
                {
                    approached: true,
                    output: value,
                }
            );
            if (rejectResult.approached) return rejectResult.output;
            // 默认拒绝行为
            if (__Setting.readOnlyPropertyWarningEnabled) {
                const warningMsg = `Property '${String(key)}' read rejected. Final output: ${JSON.stringify(
                    rejectResult.output
                )}`;
                switch (__Setting.readOnlyPropertyWarningType) {
                    case "Warning":
                        console.warn(`⚠️ ${warningMsg}`);
                        break;
                    case "Error":
                        throw new Error(`🚫 ${warningMsg}`);
                }
            }
            return void 0; // Fallback to void
        }
    });
};
export * as rulerDecorators from "./rulesLibrary";
export * as valueRecorder from "./valueRecorder";
export * from "./utils";
