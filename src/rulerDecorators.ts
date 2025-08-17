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

/**
 *           ———————— 注意事项 Notice ————————
 */

/**
 * @WARNING @DEBUGGING
 * 警告：还在制作
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
 * 这个版本少见了
 */

//     -------- 核心 core --------

/**
 * Storage for actual values and wrapper functions
 * 存储实际值和包装函数
 */
interface InstanceStorageValue {
    [key: string | symbol]: any;
}

import { handlerIIreduceMessage, rd_GetterHandle, rd_SetterHandle } from "./type.handles";
const instanceStorage = new WeakMap<object, InstanceStorageValue>();
const wrapperCache = new WeakMap<object, Record<string | symbol, Function>>();

/**
 * Storage for property handler chains
 * 存储每个属性的句柄链
 */
const setterHandlers = new WeakMap<object, Map<string | symbol, rd_SetterHandle[]>>();
const getterHandlers = new WeakMap<object, Map<string | symbol, rd_GetterHandle[]>>();

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
        debugLogger(console.log, "$$init decorator applied to:", target?.name || target, propertyKey, descriptor);

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
                        debugLogger(console.log, "Decorated class constructor called");

                        // 初始化实例存储
                        const instance: InstanceStorageValue = {};
                        instanceStorage.set(this, instance);

                        // 处理所有装饰属性初始值
                        const settersMap = setterHandlers.get(target.prototype) || new Map();
                        for (const [key, handlers] of settersMap.entries()) {
                            const initialValue = this[key];
                            debugLogger(
                                console.log,
                                `Processing decorated property ${String(key)} with initial value:`,
                                initialValue
                            );

                            const processed = handlers.reduce((val: any, handler: rd_SetterHandle) => {
                                const result = handler(this, key, val, val, 0, handlers);
                                debugLogger(console.log, `Handler for ${String(key)} processed value:`, val, "=>", result);
                                return result;
                            }, initialValue);

                            instance[key] = processed;
                            debugLogger(console.log, `Final value for ${String(key)}:`, processed);
                        }

                        debugLogger(console.log, "Instance fully initialized with decorated values:", instance);
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
            set(this: any, value: unknown) {
                debugLogger(console.log, "Setter triggered for", key, "with value", value);
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
                        debugLogger(console.log, `Handler ${idx} processed value:`, newVal);
                        return newVal;
                    },
                    value // 初始值使用传入的value
                );

                // 存储处理结果 + “检查”
                objStore[key] = result;
                // 你说他会有用么

                debugLogger(console.log, "Final stored value:", result);
                debugLogger(console.log, "Stored in value:", instanceStorage.get(this));

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
                            return getters.reduce(
                                (prev, handler, idx, arr) => handler(this, key, this, prev, idx, [...arr]),
                                result
                            );
                        };
                    }
                    return wrapperMap[key];
                }

                // 常规属性处理
                return getters.reduce((prev, handler, idx, arr) => handler(this, key, this[key], prev, idx, [...arr]), baseValue);
            },
        };
    };
};

//     -------- 调用接口 api functions --------

/**
 * Setter handler decorator factory
 * Setter句柄装饰器工厂
 *
 * @factory Core decorator factory for property setters
 * @factory 属性setter的核心装饰器工厂
 * @core_concept Wraps property setters with custom logic
 * @core_concept 用自定义逻辑包装属性setter
 *
 * @param handle - Setter handler function with signature:
 *                setter句柄函数签名:
 *                (thisArg, attr, value, lastResult, index, handlers) => newValue
 * @returns Property/Method/Auto-accessor decorator
 *          返回属性/方法/自动访问器装饰器
 *
 * @overload Property decorator
 * @overload Method decorator (for set accessors)
 * @overload Auto-accessor decorator
 *
 * @example
 * class MyClass {
 *   @$setter((_, __, v) => v * 2)
 *   num = 1; // Will be doubled on set
 * }
 */
export function $setter<I, R = I>(handle: rd_SetterHandle<I, R>): PropertyDecorator & MethodDecorator {
    return function (target: any, attr: string | symbol, descriptor?: PropertyDescriptor) {
        $addSetterHandler(target, attr, handle as rd_SetterHandle);
    };
}

/**
 * Getter handler decorator factory
 * Getter句柄装饰器工厂
 *
 * @factory Core decorator factory for property getters
 * @factory 属性getter的核心装饰器工厂
 * @core_concept Wraps property getters with custom logic
 * @core_concept 用自定义逻辑包装属性getter
 *
 * @param handle - Getter handler function with signature:
 *                getter句柄函数签名:
 *                (thisArg, attr, lastResult, index, handlers) => newValue
 * @returns Property/Method/Auto-accessor decorator
 *          返回属性/方法/自动访问器装饰器
 *
 * @overload Property decorator
 * @overload Method decorator (for get accessors)
 * @overload Auto-accessor decorator
 *
 * @example
 * class MyClass {
 *   @$getter((_, __, v) => v + 100)
 *   num = 1; // Will add 100 when get
 * }
 */
export function $getter<I, R = I>(
    handle: rd_GetterHandle<I, typeof __Setting.veryStrict extends false ? R : I>
): PropertyDecorator & MethodDecorator {
    return function (target: any, attr: string | symbol, descriptor?: PropertyDescriptor) {
        $addGetterHandler(target, attr, handle as rd_GetterHandle);
    };
}

//     -------- 神器 wonderful tools --------

import { conditionHandler, rejectionHandler } from "./type.handles";
import { debugLogger } from "./api.test";

/**
 * Conditional write decorator factory
 * 条件写入装饰器工厂
 *
 * @factory Core decorator for conditional property writes
 * @factory 属性条件写入的核心装饰器
 * @core_concept Implements conditional logic chain for property setters
 * @core_concept 为属性setter实现条件逻辑链
 *
 * @template T - Property value type
 *               属性值类型
 *
 * @param conditionHandles - Array of conditions to check:
 *                条件检查数组:
 *                - Boolean values
 *                - Functions with signature:
 *                  (thisArg, key, value, prevResult, currentIndex, handlers) => boolean|{approached,output}
 * @param [rejectHandlers] - Optional rejection handlers with signature:
 *                可选的拒绝处理函数:
 *                (thisArg, key, value, conditionResult, prevResult, currentIndex, handlers) => T|{approached,output}
 *
 * @returns Property/Method/Auto-accessor decorator
 *          返回属性/方法/自动访问器装饰器
 *
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 *
 * @example
 * class MyClass {
 *   @$conditionalWrite(
 *     [(_, __, v) => v > 0], // Only allow positive numbers
 *     [(_, __, v) => Math.abs(v)] // If negative, use absolute value
 *   )
 *   num = 1;
 * }
 *
 * @behavior
 * 1. Processes conditions in chain using Array.reduce()
 * 2. If all conditions pass (approached=true), returns new value
 * 3. If any condition fails:
 *    - Applies reject handlers if provided
 *    - Returns original value if no reject handlers
 *    - Can warn/throw based on __Setting configuration
 *
 * 行为：
 * 1. 使用Array.reduce()链式处理条件
 * 2. 所有条件通过时(approached=true)返回新值
 * 3. 任一条件失败时:
 *    - 应用拒绝处理函数(如果提供)
 *    - 未提供拒绝处理时返回原值
 *    - 根据__Setting配置发出警告/抛出错误
 */
export const $conditionalWrite = <I = any, R = I>(
    errorType: "ignore" | "Warn" | "Error",
    conditionHandles: conditionHandler[],
    rejectHandlers?: rejectionHandler[]
) => {
    return $setter<I, R>((thisArg, key, newVal, lastResult: I, index, handlers) => {
        const handlersArray = [...conditionHandles];
        const callResult = handlersArray.reduce<{ approached: boolean; output: any }>(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, newVal, lastProcess, idx, conditionHandles);
                if (typeof r === "boolean") {
                    return { approached: r, output: lastProcess.output };
                }
                if (r && typeof r === "object" && "approached" in r && "output" in r) {
                    return r;
                }
                return { approached: true, output: r };
            },
            { approached: false, output: lastResult }
        ) satisfies
            | {
                  approached: true;
                  output: R;
              }
            | {
                  approached: false;
                  output: typeof rejectHandlers extends [] | undefined ? never : any;
              };

        if (callResult.approached) return callResult.output;

        if (rejectHandlers?.length) {
            const rejectHandlersArray = [...rejectHandlers];
            const rejectResult = rejectHandlersArray.reduce<{ approached: boolean; output: any }>(
                (lastProcess, handler, idx, arr) => {
                    const r = handler(thisArg, key, newVal, callResult, lastProcess, idx, rejectHandlers);
                    if (typeof r === "boolean") {
                        return { approached: r, output: lastProcess.output };
                    }
                    if (r && typeof r === "object" && "approached" in r && "output" in r) {
                        return r;
                    }
                    return { approached: true, output: r };
                },
                {
                    approached: true,
                    output: lastResult,
                }
            ) satisfies
                | {
                      approached: true;
                      output: R;
                  }
                | {
                      approached: false;
                      output: typeof rejectHandlers extends [] | undefined
                          ? never
                          : typeof __Setting.veryStrict extends true /* allow warn? */
                          ? never
                          : any;
                  };

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
        return (thisArg as any)[key]; // Fallback to original value
    });
};

/**
 * Conditional read decorator factory
 * 条件读取装饰器工厂
 *
 * @factory Core decorator for conditional property reads
 * @factory 属性条件读取的核心装饰器
 * @core_concept Implements conditional logic chain for property getters
 * @core_concept 为属性getter实现条件逻辑链
 *
 * @template T - Property value type
 *               属性值类型
 *
 * @param conditionHandles - Array of conditions to check:
 *                条件检查数组:
 *                - Boolean values
 *                - Functions with signature:
 *                  (thisArg, key, value, prevResult, currentIndex, handlers) => boolean|{approached,output}
 * @param [rejectHandlers] - Optional rejection handlers with signature:
 *                可选的拒绝处理函数:
 *                (thisArg, key, value, conditionResult, prevResult, currentIndex, handlers) => T|{approached,output}
 *
 * @returns Property/Method/Auto-accessor decorator
 *          返回属性/方法/自动访问器装饰器
 *
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 *
 * @example
 * class MyClass {
 *   @$conditionalRead(
 *     [(_, __, v) => v !== undefined], // Only allow defined values
 *     [() => 'default'] // Return 'default' if undefined
 *   )
 *   data?: string;
 * }
 *
 * @behavior
 * 1. Processes conditions in chain using Array.reduce()
 * 2. If all conditions pass (approached=true), returns original value
 * 3. If any condition fails:
 *    - Applies reject handlers if provided
 *    - Returns undefined if no reject handlers
 *    - Can warn/throw based on __Setting configuration
 *
 * 行为：
 * 1. 使用Array.reduce()链式处理条件
 * 2. 所有条件通过时(approached=true)返回原值
 * 3. 任一条件失败时:
 *    - 应用拒绝处理函数(如果提供)
 *    - 未提供拒绝处理时返回undefined
 *    - 根据__Setting配置发出警告/抛出错误
 */
export const $conditionalRead = <I = any, R = I>(
    errorType: "ignore" | "Warn" | "Error",
    conditionHandles: conditionHandler[],
    rejectHandlers?: rejectionHandler[]
) => {
    return $getter<I, R | undefined>((thisArg, key, value, lastResult: I, index, handlers) => {
        const handlersArray = [...conditionHandles];
        const callResult = handlersArray.reduce<{ approached: boolean; output: any }>(
            (lastProcess, handler, idx, arr) => {
                const r = handler(thisArg, key, value, lastProcess, idx, conditionHandles);
                if (typeof r === "boolean") {
                    return { approached: r, output: lastProcess.output };
                }
                if (r && typeof r === "object" && "approached" in r && "output" in r) {
                    return r;
                }
                return { approached: true, output: r };
            },
            { approached: true, output: lastResult }
        ) satisfies
            | {
                  approached: true;
                  output: R;
              }
            | {
                  approached: false;
                  output: typeof rejectHandlers extends [] | undefined ? never : unknown;
              };

        if (callResult.approached) return callResult.output;

        if (rejectHandlers?.length) {
            const rejectHandlersArray = [...rejectHandlers];
            const rejectResult = rejectHandlersArray.reduce<{ approached: boolean; output: any }>(
                (lastProcess, handler, idx, arr) => {
                    const r = handler(thisArg, key, value, callResult, lastProcess, idx, rejectHandlers);
                    if (typeof r === "boolean") {
                        return { approached: r, output: lastProcess.output };
                    }
                    if (r && typeof r === "object" && "approached" in r && "output" in r) {
                        return r;
                    }
                    return { approached: true, output: r };
                },
                {
                    approached: true,
                    output: value,
                }
            ) satisfies
                | {
                      approached: true;
                      output: R;
                  }
                | {
                      approached: false;
                      output: typeof rejectHandlers extends [] | undefined
                          ? never
                          : typeof __Setting.veryStrict extends true /* allow warn? */
                          ? never
                          : unknown;
                  };
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
        return void 0; // Fallback to void
    });
};

/**
 * rulers & libSetting
 */
export * as rulerDecorators from "./rulesLibrary";
/**
 * extra lib (optional)
 */
export * from "./valueRecorder";
