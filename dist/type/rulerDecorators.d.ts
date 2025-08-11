import { rd_GetterHandle, rd_SetterHandle } from "./type.handles";
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
export declare function $addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void;
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
export declare function $addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void;
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
export declare function $removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean;
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
export declare function $removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean;
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
export declare const $$init: (initialSetters?: rd_SetterHandle[], initialGetters?: rd_GetterHandle[]) => (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
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
export declare function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): PropertyDecorator;
export declare function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): MethodDecorator;
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
export declare function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
export declare function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): MethodDecorator;
import { conditionHandler, rejectionHandler } from "./type.handles";
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
export declare const $conditionalWrite: <T = any>(errorType: "ignore" | "Warn" | "Error", conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) => PropertyDecorator;
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
export declare const $conditionalRead: <T = any>(errorType: "ignore" | "Warn" | "Error", conditionHandles: conditionHandler[], rejectHandlers?: rejectionHandler[]) => PropertyDecorator;
/**
 * rulers & libSetting
 */
export * as rulerDecorators from "./rulesLibrary";
/**
 * extra lib (optional)
 */
export * from "./valueRecorder";
//# sourceMappingURL=rulerDecorators.d.ts.map