/**
 * @this
 * @testUsing
 * @debugger
 * api for testing&debugging
 * 调试接口
 *
 * @author cinast
 * @since 2025-8-11
 * @update 2025-8-11
 * @version 1.0.0
 *
 *
 * @see src\rulerDecorators.ts
 */

import { __Setting } from "./moduleMeta";
import { getDecoratorType } from "./utils";

/**
 * @switch `__Setting["debugLogger.logInnerDetails"]`
 *
 * 我自己内部调试用
 * 如果你对内部机理好奇，开`debugLogger.logInnerDetails`
 */
export function debugLogger(f: Function, ...args: any[]) {
    if (__Setting["debugLogger.logInnerDetails"]) return f(...args);
}

/**
 * 在装饰器上加debugger，充当断点
 *
 * @switch `__Setting["$debug.allowUsing"]`
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
    ...debuggers: (any | ((...args: any[]) => any))[]
): ClassDecorator & MethodDecorator & PropertyDecorator & ParameterDecorator {
    if (!__Setting["$debug.allowUsing"]) throw new Error("$debugger baned,\nsee __Setting.$debug.allowUsing\n[status: false]");

    const shouldLogArgs = typeof logArgs === "boolean" ? logArgs : false;
    const debugHandlers = typeof logArgs === "boolean" ? debuggers : [logArgs, ...debuggers].filter(Boolean);

    return function (...args: any[]) {
        if (__Setting["$debug.enableLog"] && shouldLogArgs) {
            console.log(`🚨 ${getDecoratorType(args)} decorator arguments:`);
            console.log(args);
        }

        if (__Setting["$debug.debugger"]) debugger;

        if (__Setting["$debug.callHandles"])
            debugHandlers.forEach((debug, i) => {
                try {
                    if (typeof debug === "function" && __Setting["$debug.callHandles"]) {
                        const result = debug(...args);
                        if (__Setting["$debug.enableLog"])
                            console.log({
                                index: `${i}`,
                                message: `📢 Debugger result: ${result}`,
                            });
                    }
                    if (__Setting["$debug.enableLog"]) console.log(`📢 ${debug}`);
                } catch (e) {
                    if (__Setting["$debug.enableWarn"]) console.error(`⚠️ Debug handler[${i}] error:`, e);
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

/**
 * triple
 */
export function useTest() {}
