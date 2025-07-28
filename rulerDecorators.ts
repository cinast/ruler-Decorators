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
 * **@notice** Decorators type: experimental **stage 2**
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

    /*
     * built-in functions
     */

    //     -------- math limit --------
    /**
     * Ensures the property value is never less than zero.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const isPositive = $setter((thisArg, key, v: bigint | number) =>
        typeof v === "bigint" ? (v > 0 ? v : 0n) : Math.max(0, v)
    );

    /**
     * Ensures the property value does not exceed a specified limit.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
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
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param limit - `[b,n]`The minimum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    export const noLower = (limit: bigint | number | string) =>
        $setter((thisArg, key, v: bigint | number) => {
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

            return typeof v === "bigint"
                ? BigInt(resolvedLimit) < v
                    ? v
                    : BigInt(resolvedLimit)
                : Math.max(Number(resolvedLimit), v);
        });

    //     -------- conditional --------

    /**
     * Intercept when it gonna change, do sth or process input than cover the value
     * So is why it called `Watch`
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param T Input type, or let it infer by itself
     */
    export const watchSet = <T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T) => $setter<T>(handle);

    /**
     * Only allows property changes when condition is satisfied
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param condition - Condition checker function
     * @returns Decorator function
     */
    export const changeable_Only_Satisfies = (condition: () => boolean) =>
        $setter((thisArg, key, v) => (condition() ? v : thisArg));

    //     -------- authority like --------

    /**
     * Conditional write decorator
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param conditionHandles - Conditions to check
     * @returns Decorator function
     */
    export const conditionalWrite = (...conditionHandles: (boolean | ((thisArg: any, key: any, v: any) => boolean))[]) => {
        return $setter((thisArg, key, v) =>
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
    export const conditionalRead = (...conditionHandles: (boolean | ((thisArg: any, key: any) => boolean))[]) => {
        return $getter((thisArg, key) =>
            conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key) : h)) ? thisArg[key] : undefined
        );
    };

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    export const onlyTheClassCanWrite = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalWrite((thisArg) => thisArg.constructor === thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    export const onlyTheClassCanRead = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalRead((thisArg) => thisArg.constructor === thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you have no right of, otherwise receive changes.
     */
    export const onlyTheClassAndSubCanWrite = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalWrite((thisArg) => thisArg instanceof thisClassCtor);

    /**
     * `Protect`'s another version, but viewable to outer.
     * @overload Property decorator
     * @overload Method decorator (get accessor)
     * @overload Auto-accessor decorator
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you have no right of, otherwise returns value.
     */
    export const onlyTheClassAndSubCanRead = (thisClassCtor: new (...args: any[]) => any) =>
        conditionalRead((thisArg) => thisArg instanceof thisClassCtor);

    export function egg() {}
}
