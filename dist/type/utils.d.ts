/**
 * Intercept when it gonna change, do sth or process input than cover the value
 * So is why it called `Watch`
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 * @param T Input type, or let it infer by itself
 */
export declare const watchSet: <T>(handle: (thisArg: any, attr: string | symbol, value: T) => T) => PropertyDecorator;
/** Identifies decorator type from arguments */
export declare function getDecoratorType(args: any[]): string;
/**
 * and anywise
 * @param props
 * @returns
 */
export declare function $defineProperty<T>(...props: any[]): PropertyDecorator;
//# sourceMappingURL=utils.d.ts.map