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
/**
 * Storage for actual values and wrapper functions
 * 存储实际值和包装函数
 */
interface InstanceStorageValue {
    [key: string | symbol]: any;
}
import { rd_GetterHandle, rd_SetterHandle } from "./type.handles";
export declare const instanceStorage: WeakMap<object, InstanceStorageValue>;
export declare const wrapperCache: WeakMap<object, Record<string | symbol, Function>>;
/**
 * Storage for property handler chains
 * 存储每个属性的句柄链
 */
export declare const setterHandlers: WeakMap<object, Map<string | symbol, rd_SetterHandle[]>>;
export declare const getterHandlers: WeakMap<object, Map<string | symbol, rd_GetterHandle[]>>;
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
export declare const $$init: (
    initialSetters?: rd_SetterHandle[],
    initialGetters?: rd_GetterHandle[]
) => (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
/**
 * Str句柄注册器 装饰器工厂
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
export declare function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): PropertyDecorator;
export declare function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): MethodDecorator;
/**
 * Gtr句柄注册器 装饰器工厂
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
export declare function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
export declare function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): MethodDecorator;
/**
 * and anywise
 * @param props
 * @returns
 */
export declare function $defineProperty<T>(...props: any[]): PropertyDecorator;
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
export declare function $debugger(
    logArgs?: boolean,
    ...debuggers: (string | ((...args: any[]) => any))[]
): ClassDecorator & MethodDecorator & PropertyDecorator & ParameterDecorator;
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
export declare const $conditionalWrite: <T = any>(
    conditionHandles: conditionHandler[],
    rejectHandlers?: rejectionHandler[]
) => PropertyDecorator;
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
export declare const $conditionalRead: <T = any>(
    conditionHandles: conditionHandler[],
    rejectHandlers?: rejectionHandler[]
) => PropertyDecorator;
export * as rulerDecorators from "./rulesLibrary";
export * as valueRecorder from "./valueRecorder";
export * from "./utils";
//# sourceMappingURL=rulerDecorators.d.ts.map
