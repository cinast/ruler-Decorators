/**
 * @author @cinast
 */

/**
 *                              ————————base fn————————
 */

/**
 * Getter decorator Factory.
 * @factory
 * @param handle - Function to define the getter behavior.
 * @returns A property decorator.
 */
export function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        Object.defineProperty(target, propertyKey, {
            get(): any {
                return handle(target, propertyKey);
            },
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * Setter decorator Factory.
 * @factory
 * @param handle - Function to define the setter behavior.
 * @returns A property decorator.
 */
export function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        Object.defineProperty(target, propertyKey, {
            set(value: T) {
                target[propertyKey] = handle(target, propertyKey, value);
            },
            enumerable: true,
            configurable: true,
        });
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
const badWords: string[] = [] as const;

/**
 * \*code candies\*
 * Make u easier decorate ur properties
 * soo trash it to add additional get or set,
 *
 * @author cinast
 * @date 2022-11-29
 * **@warning** tsconfg `experimentalDecorators` must be `true`
 * **@tip** tsconfg.json with that should be placed at ts files' Parent or sibling folders
 */
export namespace propRules {
    /**
     * Ensures the property value is never less than zero.
     */
    export const noZero = $setter((thisArg, key, v: bigint | number) =>
        typeof v === "bigint" ? (v > 0 ? v : 0n) : Math.max(0, v)
    );

    /**
     * Ensures the property value does not exceed a specified limit.
     * @param limit - `[b,n]`The maximum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    export const noOver = (limit: bigint | number | string) =>
        $setter<bigint | number>((thisArg, key, v: bigint | number) => {
            let resolvedLimit: bigint | number;

            if (typeof limit === "string") {
                const refValue = thisArg[limit];
                if (typeof refValue === "bigint" || typeof refValue === "number") {
                    resolvedLimit = refValue;
                } else {
                    throw new Error("Referenced limit must be bigint or number");
                }
            } else {
                resolvedLimit = limit;
            }

            if (typeof v === "bigint") {
                const bigintLimit = typeof resolvedLimit === "bigint" ? resolvedLimit : BigInt(resolvedLimit);
                return v < bigintLimit ? v : bigintLimit;
            } else {
                const numberLimit = typeof resolvedLimit === "number" ? resolvedLimit : Number(resolvedLimit);
                return Math.min(numberLimit, v);
            }
        });

    /**
     * Ensures the property value is never less than a specified limit.
     * @param limit - `[b,n]`The maximum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    export const noLower = (limit: bigint | number) =>
        $setter((thisArg, key, v: bigint | number) => {
            if (typeof limit === "string") limit = thisArg[limit];
            return typeof v === "bigint" ? (BigInt(limit) < v ? v : limit) : Math.max(Number(limit), v);
        });

    /**
     * Intercept when it gonna change, do sth or process input than cover the value
     * So is why it called `Watch`
     * @param T Input type, or let it infer by itself
     */
    export const watchSet = <T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T) => $setter<T>(handle);

    /**
     *
     * @param condition
     * @returns
     */
    export const onlyWhen = (condition: () => boolean) => $setter((thisArg, key, v) => (condition() ? v : thisArg));

    /**
     * `Protect`'s another version, but viewable to outer.
     * @param ctor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive that.
     */
    export const onlyTheClassAndSubCanWrite = (ctor: new (...args: any[]) => any) =>
        $setter((thisArg, key, value) => (thisArg instanceof ctor ? value : thisArg[key]));
}
