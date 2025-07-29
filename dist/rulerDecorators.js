"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.rulerDecorators = exports.watchSet = exports.$conditionalRead = exports.$conditionalWrite = void 0;
exports.$getter = $getter;
exports.$setter = $setter;
exports.$defineProperty = $defineProperty;
exports.$debugger = $debugger;
function $getter(handle) {
    return function (target, propertyKey, descriptor) {
        if (descriptor) {
            // Method decorator (for get accessor)
            const originalGet = descriptor.get;
            if (originalGet) {
                descriptor.get = function () {
                    return handle(this, propertyKey, originalGet.call(this));
                };
            }
            return descriptor;
        }
        else {
            // Property decorator
            Object.defineProperty(target, propertyKey, {
                get() {
                    return handle(target, propertyKey);
                },
                enumerable: true,
                configurable: true,
            });
        }
    };
}
function $setter(handle) {
    return function (target, propertyKey, descriptor) {
        if (descriptor) {
            // Method decorator (for set accessor)
            const originalSet = descriptor.set;
            if (originalSet) {
                descriptor.set = function (value) {
                    const processedValue = handle(this, propertyKey, value);
                    originalSet.call(this, processedValue);
                };
            }
            return descriptor;
        }
        else {
            // Property decorator
            Object.defineProperty(target, propertyKey, {
                set(value) {
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
function $defineProperty(...props) {
    return function (target, propertyKey) {
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
function $debugger(logArgs = false, ...debuggers) {
    // Handle parameter variations
    const shouldLogArgs = typeof logArgs === "boolean" ? logArgs : false;
    const debugHandlers = typeof logArgs === "boolean" ? debuggers : [logArgs, ...debuggers].filter(Boolean);
    return function (...args) {
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
                if (typeof debug === "string")
                    console.log(`📢 ${debug}`);
                else if (typeof debug === "function") {
                    const result = debug(...args);
                    console.log({
                        index: `${i}`,
                        message: `📢 Debugger result:`,
                    });
                }
            }
            catch (e) {
                console.error(`⚠️ Debug handler[${i}] error:`, e);
            }
        });
        // Handle different decorator types
        switch (args.length) {
            case 1: // Class decorator: [constructor]
                return class extends args[0] {
                };
            case 2: // Property decorator: [target, propertyKey]
                return;
            case 3:
                if (typeof args[2] === "number") {
                    // Parameter decorator
                    return;
                }
                else {
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
function getDecoratorType(args) {
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
const $conditionalWrite = (...conditionHandles) => {
    const originalValues = new WeakMap();
    return $setter((thisArg, key, v) => conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, v) : h)) ? v : thisArg[key]);
};
exports.$conditionalWrite = $conditionalWrite;
/**
 * Conditional read decorator
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 * @param conditionHandles - Conditions to check
 * @returns Decorator function
 */
const $conditionalRead = (...conditionHandles) => {
    return $getter((thisArg, key) => conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key) : h)) ? thisArg[key] : undefined);
};
exports.$conditionalRead = $conditionalRead;
/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
const watchSet = (handle) => $setter(handle);
exports.watchSet = watchSet;
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
var rulerDecorators;
(function (rulerDecorators) {
    /**
     * take it if u need, it might be useful \
     * *when* u are extending this module
     */
    rulerDecorators.thisSymbols = Symbol("rulerDecorators");
    //     -------- math toy --------
    /**
     * rejects negative numbers, receives positive one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    rulerDecorators.alwaysPositive = (0, exports.$conditionalWrite)((thisArg, key, v) => typeof v === "bigint" ? (v > 0 ? v : thisArg[key]) : Math.max(v, thisArg[key]));
    /**
     * rejects positive numbers, receives negative one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    rulerDecorators.alwaysNegative = (0, exports.$conditionalWrite)((thisArg, key, v) => typeof v === "bigint" ? (v < 0 ? v : thisArg[key]) : Math.min(v, thisArg[key]));
    /**
     * Ensures the property value is never less than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    rulerDecorators.minimum = (min) => $setter((thisArg, key, v) => typeof v === "bigint" ? (v > min ? v : BigInt(min)) : Math.max(Number(min), v));
    /**
     * Ensures the property value is never greater than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    rulerDecorators.maximumZero = (max) => $setter((thisArg, key, v) => typeof v === "bigint" ? (v < max ? v : BigInt(max)) : Math.min(Number(max), v));
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
    rulerDecorators.onlyTheClassCanWrite = (thisClassCtor) => (0, exports.$conditionalWrite)((thisArg) => {
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
    rulerDecorators.onlyTheClassCanRead = (thisClassCtor) => (0, exports.$conditionalRead)((thisArg) => {
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
    rulerDecorators.onlyTheClassAndSubCanWrite = (thisClassCtor) => (0, exports.$conditionalWrite)((thisArg) => thisArg instanceof thisClassCtor);
    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    rulerDecorators.onlyTheClassAndSubCanRead = (thisClassCtor) => (0, exports.$conditionalRead)((thisArg) => thisArg instanceof thisClassCtor);
    function egg() { }
    rulerDecorators.egg = egg;
})(rulerDecorators || (exports.rulerDecorators = rulerDecorators = {}));
