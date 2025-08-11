import { __Setting } from "./moduleMeta";
import { $setter } from "./rulerDecorators";
("use strict");

/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
export const watchSet = <T>(handle: (thisArg: any, attr: string | symbol, value: T) => T) => $setter<T>(handle);

/** Identifies decorator type from arguments */
export function getDecoratorType(args: any[]): string {
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

/**
 * and anywise
 * @param props
 * @returns
 */
export function $defineProperty(...props: any[]): PropertyDecorator {
    return function (target: any, attr: string | symbol) {
        Object.defineProperty(target, attr, props);
    };
}
