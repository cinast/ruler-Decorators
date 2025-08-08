/**
 * Type definition for setter handler
 * setter句柄类型定义
 */
export type rd_SetterHandle = <T = any>(target: any, attr: string | symbol, value: any, lastResult: unknown, index: number, handlers: rd_SetterHandle[], ...args: any[]) => any;
/**
 * Type definition for getter handler
 * getter句柄类型定义
 */
export type rd_GetterHandle = <T = any>(target: any, attr: string | symbol, lastResult: unknown, index: number, handlers: rd_GetterHandle[], ...args: any[]) => any;
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
export declare function addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void;
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
export declare function addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void;
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
export declare function removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean;
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
export declare function removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean;
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
export declare const $$init: (initialSetters?: rd_SetterHandle[], initialGetters?: rd_GetterHandle[]) => (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
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
export declare function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): PropertyDecorator;
export declare function $setter<T>(handle: (thisArg: any, attr: string | symbol, value: T) => T): MethodDecorator;
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
export declare function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
export declare function $getter(handle: (thisArg: any, attr: string | symbol, ...arg: any[]) => unknown): MethodDecorator;
/**
 * and anywise
 * @param props
 * @returns
 */
export declare function $defineProperty<T>(...props: any[]): PropertyDecorator;
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
export declare function $debugger(logArgs?: boolean, ...debuggers: (string | ((...args: any[]) => any))[]): ClassDecorator & MethodDecorator & PropertyDecorator & ParameterDecorator;
/**
 * Conditional write decorator
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
export declare const $conditionalWrite: <T = any>(...conditionHandles: (boolean | ((thisArg: any, key: any, v: T) => boolean))[]) => PropertyDecorator;
/**
 * Conditional read decorator
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
export declare const $conditionalRead: (...conditionHandles: (boolean | ((thisArg: any, key: any, value: any) => boolean))[]) => PropertyDecorator;
/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
export declare const watchSet: <T>(handle: (thisArg: any, attr: string | symbol, value: T) => T) => PropertyDecorator;
/**
 * \*code candies\* \
 * Make u easier decorate ur properties \
 * soo trash it to add additional get or set,
 *
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-8
 * @version 1.0.0
 *
 * **@notice** Decorators type: experimental **stage 2**
 *
 * **@warning** tsconfg `experimentalDecorators` must be `true` \
 * **@tip** tsconfg.json with that should be placed at ts files' Parent or sibling folders \
 * **@tip** tsc need 5.2+
 */
export declare namespace rulerDecorators {
    /**
     * take it if u need, it might be useful \
     * *when* u are extending this module
     */
    const thisSymbols: unique symbol;
    /**
     * setting for rd lib functions
     */
    const __Setting: {
        [key: string]: any;
        /**
         * Global switch of warn or ignore when trying to change read-only property
         */
        readOnlyPropertyWarningEnabled: boolean;
        readOnlyPropertyWarningType: "Warning" | "Error";
    };
    /**
     * 形式Int，实际number，记得打jsdoc@Int
     * 限制整数
     * @param max - Maximum allowed value (number or bigint)
     *              允许的最大值(数字或大整数)
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const Int: (max: bigint | number) => PropertyDecorator;
    /**
     * Ensures property value is always positive
     * 确保属性值始终为正数
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const alwaysPositive: PropertyDecorator;
    /**
     * Ensures property value is always negative
     * 确保属性值始终为负数
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const alwaysNegative: PropertyDecorator;
    /**
     * Sets minimum value for property
     * 设置属性的最小值
     * @param min - Minimum allowed value (number or bigint)
     *              允许的最小值(数字或大整数)
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const minimum: (min: bigint | number, allowEqual: boolean) => PropertyDecorator;
    /**
     * Sets maximum value for property
     * 设置属性的最大值
     * @param max - Maximum allowed value (number or bigint)
     *              允许的最大值(数字或大整数)
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const maximum: (max: bigint | number, allowEqual: boolean) => PropertyDecorator;
    /**
     * Rejects strings containing specified patterns
     * 拒绝包含指定模式的字符串
     * @param patten - Patterns to exclude (string or RegExp)
     *                 要排除的模式(字符串或正则表达式)
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const stringExcludes: (...patten: (RegExp | string)[]) => PropertyDecorator;
    /**
     * Requires strings to contain specified patterns
     * 要求字符串包含指定模式
     * @param patten - Required patterns (string or RegExp)
     *                 要求的模式(字符串或正则表达式)
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const stringRequires: (...patten: (RegExp | string)[]) => PropertyDecorator;
    /**
     * @tip
     * 作为表达式调用时，无法解析属性修饰器的签名。
     * 运行时将使用 2 个自变量调用修饰器，但修饰器需要 1 个。ts(1240)
     * 装饰器函数返回类型为“PropertyDecorator”，但预期为“void”或“any”。ts(1271)
     * @onlyTheClassXXX ←忘记加括号，可以指定类，可以this可以其他
     * [property] a = 0
     */
    /**
     * Restrict property read access to only specified class instances
     * 限制属性读取权限，仅允许指定类的实例访问
     * @param thisClass - Class constructor to check against
     *                   用于权限检查的类构造函数
     * @returns Original value if access allowed, undefined otherwise
     *          允许访问时返回原值，否则返回undefined
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     */
    const onlyTheClassCanRead: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * Restrict property write access to only specified class instances
     * 限制属性写入权限，仅允许指定类的实例修改
     * @param thisClass - Class constructor to check against
     *                   用于权限检查的类构造函数
     * @returns New value if access allowed, keeps old value otherwise
     *          允许访问时接受新值，否则保持原值
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const onlyTheClassCanWrite: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * Restrict property write access to specified class and its subclasses
     * 限制属性写入权限，允许指定类及其子类的实例修改
     * @param thisClass - Base class constructor to check against
     *                   用于权限检查的基类构造函数
     * @returns New value if access allowed, keeps old value otherwise
     *          允许访问时接受新值，否则保持原值
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const onlyTheClassAndSubCanWrite: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * Restrict property read access to specified class and its subclasses
     * 限制属性读取权限，允许指定类及其子类的实例访问
     * @param thisClass - Base class constructor to check against
     *                   用于权限检查的基类构造函数
     * @returns Original value if access allowed, undefined otherwise
     *          允许访问时返回原值，否则返回undefined
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     */
    const onlyTheClassAndSubCanRead: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
}
