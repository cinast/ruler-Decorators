export type rd_SetterHandle = <T = any>(target: any, attr: string | symbol, value: any, lastResult: unknown, index: number, handlers: rd_SetterHandle[], ...args: any[]) => any;
export type rd_GetterHandle = <T = any>(target: any, attr: string | symbol, lastResult: unknown, index: number, handlers: rd_GetterHandle[], ...args: any[]) => any;
/**
 * 添加 setter 句柄到指定属性
 * @param target 类原型或构造函数
 * @param propertyKey 属性名
 * @param handler 要添加的 setter 句柄
 */
export declare function addSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): void;
/**
 * 从指定属性移除 setter 句柄
 * @param target 类原型或构造函数
 * @param propertyKey 属性名
 * @param handler 要移除的 setter 句柄
 */
export declare function removeSetterHandler(target: object, propertyKey: string | symbol, handler: rd_SetterHandle): boolean;
/**
 * 添加 getter 句柄到指定属性
 * @param target 类原型或构造函数
 * @param propertyKey 属性名
 * @param handler 要添加的 getter 句柄
 */
export declare function addGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): void;
/**
 * 从指定属性移除 getter 句柄
 * @param target 类原型或构造函数
 * @param propertyKey 属性名
 * @param handler 要移除的 getter 句柄
 */
export declare function removeGetterHandler(target: object, propertyKey: string | symbol, handler: rd_GetterHandle): boolean;
/**
 * 装饰器工厂：创建自适应装饰器
 * @param initialSetters 初始 setter 句柄数组
 * @param initialGetters 初始 getter 句柄数组
 * @returns 自适应装饰器函数
 */
export declare const $$init: (initialSetters?: rd_SetterHandle[], initialGetters?: rd_GetterHandle[]) => (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    new (...args: any[]): {
        [x: string]: any;
    };
    [x: string]: any;
} | {
    configurable: boolean;
    enumerable: boolean | undefined;
    set(this: any, value: any): void;
    get(this: any): any;
};
/**
 * Setter decorator Factory.
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
 * Getter decorator Factory.
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
 * @update 2025-7-28
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
     *
     */
    const __Setting: {
        [key: string]: any;
        readOnlyPropertyWarningEnabled: boolean;
        readOnlyPropertyWarningType: "Warning" | "Error";
    };
    /**
     * rejects negative numbers, receives positive one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const alwaysPositive: PropertyDecorator;
    /**
     * rejects positive numbers, receives negative one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const alwaysNegative: PropertyDecorator;
    /**
     * Ensures the property value is never less than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const minimum: (min: bigint | number) => PropertyDecorator;
    /**
     * Ensures the property value is never greater than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    const maximum: (max: bigint | number) => PropertyDecorator;
    const stringExcludes: (...patten: (RegExp | string)[]) => PropertyDecorator;
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
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClass Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    const onlyTheClassCanRead: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClass Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    const onlyTheClassCanWrite: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClass Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    const onlyTheClassAndSubCanWrite: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClass Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    const onlyTheClassAndSubCanRead: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
}
