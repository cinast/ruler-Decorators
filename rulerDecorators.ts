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
export function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
export function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): MethodDecorator;
export function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): any {
    return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
        if (descriptor) {
            // Method decorator (for get accessor)
            const originalGet = descriptor.get;
            if (originalGet) {
                descriptor.get = function (this: any) {
                    return handle(this, propertyKey, originalGet.call(this));
                };
            }
            return descriptor;
        } else {
            // Property decorator
            Object.defineProperty(target, propertyKey, {
                get(): any {
                    return handle(target, propertyKey);
                },
                enumerable: true,
                configurable: true,
            });
        }
    };
}

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
export function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): PropertyDecorator;
export function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): MethodDecorator;
export function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): any {
    return function (target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor) {
        if (descriptor) {
            // Method decorator (for set accessor)
            const originalSet = descriptor.set;
            if (originalSet) {
                descriptor.set = function (this: any, value: T) {
                    const processedValue = handle(this, propertyKey, value);
                    originalSet.call(this, processedValue);
                };
            }
            return descriptor;
        } else {
            // Property decorator
            Object.defineProperty(target, propertyKey, {
                set(value: T) {
                    target[propertyKey] = handle(target, propertyKey, value);
                },
                enumerable: true,
                configurable: true,
            });
        }
    };
}
/**
 * and anywise
 * @param props
 * @returns
 */
export function $defineProperty<T>(...props: any[][]): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        Object.defineProperty(target, propertyKey, props);
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
    // Handle parameter variations
    const shouldLogArgs = typeof logArgs === "boolean" ? logArgs : false;
    const debugHandlers = typeof logArgs === "boolean" ? debuggers : [logArgs, ...debuggers].filter(Boolean);

    return function (...args: any[]) {
        // Log arguments if requested
        if (shouldLogArgs) {
            console.log(`🚨 ${getDecoratorType(args)} decorator arguments:`);
            console.log(args);
        }

        // Execute debugger statement
        debugger;

        // Process additional debug handlers
        debugHandlers.forEach((debug, i) => {
            try {
                if (typeof debug === "string") console.log(`📢 ${debug}`);
                else if (typeof debug === "function") {
                    const result = debug(...args);
                    console.log({
                        index: `${i}`,
                        message: `📢 Debugger result:`,
                    });
                }
            } catch (e) {
                console.error(`⚠️ Debug handler[${i}] error:`, e);
            }
        });

        // Handle different decorator types
        switch (args.length) {
            case 1: // Class decorator: [constructor]
                return class extends args[0] {};

            case 2: // Property decorator: [target, propertyKey]
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

//     -------- wonderful tools --------

/**
 * Conditional write decorator
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
export const $conditionalWrite = <T = any>(...conditionHandles: (boolean | ((thisArg: any, key: any, v: T) => boolean))[]) => {
    return $setter<T>((thisArg, key, v: T) =>
        conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, v) : h)) ? v : thisArg[key]
    );
};

/**
 * Conditional read decorator
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
export const $conditionalRead = (...conditionHandles: (boolean | ((thisArg: any, key: any) => boolean))[]) => {
    return $getter((thisArg, key) =>
        conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key) : h)) ? thisArg[key] : undefined
    );
};

/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
export const watchSet = <T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T) => $setter<T>(handle);

//     -------- Rules --------

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
export namespace rulerDecorators {
    /**
     * take it if u need, it might be useful \
     * *when* u are extending this module
     */
    export const thisSymbols: unique symbol = Symbol("rulerDecorators");

    //     -------- math toy --------
    /**
     * rejects negative numbers, receives positive one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const alwaysPositive = $conditionalWrite<bigint | number>((thisArg, key, v: bigint | number) =>
        typeof v === "bigint" ? (v > 0 ? v : thisArg[key]) : Math.max(v, thisArg[key])
    );
    /**
     * rejects positive numbers, receives negative one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const alwaysNegative = $conditionalWrite<bigint | number>((thisArg, key, v: bigint | number) =>
        typeof v === "bigint" ? (v < 0 ? v : thisArg[key]) : Math.min(v, thisArg[key])
    );

    /**
     * Ensures the property value is never less than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const minimum = (min: bigint | number) =>
        $setter((thisArg, key, v: bigint | number) =>
            typeof v === "bigint" ? (v > min ? v : BigInt(min)) : Math.max(Number(min), v)
        );

    /**
     * Ensures the property value is never greater than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const maximumZero = (max: bigint | number) =>
        $setter((thisArg, key, v: bigint | number) =>
            typeof v === "bigint" ? (v < max ? v : BigInt(max)) : Math.min(Number(max), v)
        );

    //     -------- authority like --------

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
    export const onlyTheClassCanWrite = (thisClassCtor: new (...args: any[]) => any) =>
        $conditionalWrite((thisArg) => {
            let currentProto = Object.getPrototypeOf(thisArg);
            while (currentProto !== null) {
                if (currentProto.constructor === thisClassCtor) {
                    return true;
                }
                currentProto = Object.getPrototypeOf(currentProto);
            }
            return false;
        });

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    export const onlyTheClassCanRead = (thisClassCtor: new (...args: any[]) => any) =>
        $conditionalRead((thisArg) => {
            let currentProto = Object.getPrototypeOf(thisArg);
            while (currentProto !== null) {
                if (currentProto.constructor === thisClassCtor) {
                    return true;
                }
                currentProto = Object.getPrototypeOf(currentProto);
            }
            return false;
        });

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    export const onlyTheClassAndSubCanWrite = (thisClassCtor: new (...args: any[]) => any) =>
        $conditionalWrite((thisArg) => thisArg instanceof thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    export const onlyTheClassAndSubCanRead = (thisClassCtor: new (...args: any[]) => any) =>
        $conditionalRead((thisArg) => thisArg instanceof thisClassCtor);

    export function egg() {}
}
