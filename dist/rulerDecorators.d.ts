/**
 *           ————————base fn————————
 */
/**
 * @WARNING @DEBUGGING
 */
/**
 * @WARNING
 * @Mind the order of the decorators, as they are applied in the order they are defined.
 * @Mind the getter and setter will might call each other INFINITY
 *
 *          setter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → getter → ...
 */
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
export declare function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): PropertyDecorator;
export declare function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): MethodDecorator;
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
export declare function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
export declare function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): MethodDecorator;
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
export declare const $conditionalRead: (...conditionHandles: (boolean | ((thisArg: any, key: any) => boolean))[]) => PropertyDecorator;
/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
export declare const watchSet: <T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T) => PropertyDecorator;
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
    const maximumZero: (max: bigint | number) => PropertyDecorator;
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
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    const onlyTheClassCanWrite: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    const onlyTheClassCanRead: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    const onlyTheClassAndSubCanWrite: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    const onlyTheClassAndSubCanRead: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    function egg(): void;
}
