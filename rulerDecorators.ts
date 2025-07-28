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

    // wonderful tools

    /**
     * Conditional write decorator
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     * @param conditionHandles - Conditions to check
     * @returns Decorator function
     */
    export const conditionalWrite = <T = any>(...conditionHandles: (boolean | ((thisArg: any, key: any, v: T) => boolean))[]) => {
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
    export const conditionalRead = (...conditionHandles: (boolean | ((thisArg: any, key: any) => boolean))[]) => {
        return $getter((thisArg, key) =>
            conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key) : h)) ? thisArg[key] : undefined
        );
    };

    //     -------- math limit --------
    /**
     * rejects negative numbers, receives positive one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const alwaysPositive = conditionalWrite<bigint | number>((thisArg, key, v: bigint | number) =>
        typeof v === "bigint" ? (v > 0 ? v : thisArg[key]) : Math.max(v, thisArg[key])
    );
    /**
     * rejects positive numbers, receives negative one
     * @overload Property decorator
     * @overload Method decorator (set accessor)
     * @overload Auto-accessor decorator
     */
    export const alwaysNegative = conditionalWrite<bigint | number>((thisArg, key, v: bigint | number) =>
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

    //     -------- authority like --------

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
