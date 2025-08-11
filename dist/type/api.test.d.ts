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
/**
 * @switch `__Setting["debugLogger.logInnerDetails"]`
 * @inheritdoc
 * 我自己内部调试用
 * 如果你对内部机理好奇，开`debugLogger.logInnerDetails`
 */
export declare function debugLogger(f: Function, ...args: any[]): any;
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
export declare function $debugger(logArgs?: boolean, ...debuggers: (string | ((...args: any[]) => any))[]): any extends (typeof __Setting)["$debug.allowUsing"] ? ClassDecorator & MethodDecorator & PropertyDecorator & ParameterDecorator : void;
/**
 * triple
 */
export declare function useTest(): void;
//# sourceMappingURL=api.test.d.ts.map