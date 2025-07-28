/**
 * @author @cinast
 */

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
 * **@warning** tsconfg `experimentalDecorators` must be `true` \
 * **@tip** tsconfg.json with that should be placed at ts files' Parent or sibling folders \
 * **@tip** tsc need 5.2+
 */
export namespace rulerDecorators {
    /**
     *           ————————base fn————————
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

    /*
     * built-in functions
     */

    //     -------- math limit --------

    /**
     * Ensures the property value is never less than zero.
     */
    export const isPositive = $setter((thisArg, key, v: bigint | number) =>
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

    //     -------- conditional --------

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
    export const changeable_Only_Satisfies = (condition: () => boolean) =>
        $setter((thisArg, key, v) => (condition() ? v : thisArg));

    //     -------- authority like --------

    export const conditionalWrite = (...conditionHandles: (boolean | ((thisArg: any, key: any, v: any) => boolean))[]) => {
        return $setter((thisArg, key, v) =>
            conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, v) : h)) ? v : thisArg[key]
        );
    };
    export const conditionalRead = (...conditionHandles: (boolean | ((thisArg: any, key: any) => boolean))[]) => {
        return $getter((thisArg, key) =>
            conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key) : h)) ? thisArg[key] : undefined
        );
    };

    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive changes.
     */
    export const onlyTheClassCanWrite = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalWrite((thisArg) => thisArg.constructor === thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you hsave no right of, otherwise returns sth.
     */
    export const onlyTheClassCanRead = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalWrite((thisArg) => thisArg.constructor === thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive changes.
     */
    export const onlyTheClassAndSubCanWrite = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalWrite((thisArg) => thisArg.constructor instanceof thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you hsave no right of, otherwise returns sth.
     */
    export const onlyTheClassAndSubCanRead = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalWrite((thisArg) => thisArg.constructor instanceof thisClassCtor);

    export function egg() {}
}
