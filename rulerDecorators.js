"use strict";
/**
 * @author @cinast
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rulerDecorators = void 0;
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
var rulerDecorators;
(function (rulerDecorators) {
    /**
     *           ————————base fn————————
     */
    /**
     * Getter decorator Factory.
     * @factory
     * @param handle - Function to define the getter behavior.
     * @returns A property decorator.
     */
    function $getter(handle) {
        return function (target, propertyKey) {
            Object.defineProperty(target, propertyKey, {
                get() {
                    return handle(target, propertyKey);
                },
                enumerable: true,
                configurable: true,
            });
        };
    }
    rulerDecorators.$getter = $getter;
    /**
     * Setter decorator Factory.
     * @factory
     * @param handle - Function to define the setter behavior.
     * @returns A property decorator.
     */
    function $setter(handle) {
        return function (target, propertyKey) {
            Object.defineProperty(target, propertyKey, {
                set(value) {
                    target[propertyKey] = handle(target, propertyKey, value);
                },
                enumerable: true,
                configurable: true,
            });
        };
    }
    rulerDecorators.$setter = $setter;
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
    rulerDecorators.$defineProperty = $defineProperty;
    /*
     * built-in functions
     */
    //     -------- math limit --------
    /**
     * Ensures the property value is never less than zero.
     */
    rulerDecorators.isPositive = $setter((thisArg, key, v) => typeof v === "bigint" ? (v > 0 ? v : 0n) : Math.max(0, v));
    /**
     * Ensures the property value does not exceed a specified limit.
     * @param limit - `[b,n]`The maximum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    rulerDecorators.noOver = (limit) => $setter((thisArg, key, v) => {
        let resolvedLimit;
        if (typeof limit === "string") {
            const refValue = thisArg[limit];
            if (typeof refValue === "bigint" || typeof refValue === "number") {
                resolvedLimit = refValue;
            }
            else {
                throw new Error("Referenced limit must be bigint or number");
            }
        }
        else {
            resolvedLimit = limit;
        }
        if (typeof v === "bigint") {
            const bigintLimit = typeof resolvedLimit === "bigint" ? resolvedLimit : BigInt(resolvedLimit);
            return v < bigintLimit ? v : bigintLimit;
        }
        else {
            const numberLimit = typeof resolvedLimit === "number" ? resolvedLimit : Number(resolvedLimit);
            return Math.min(numberLimit, v);
        }
    });
    /**
     * Ensures the property value is never less than a specified limit.
     * @param limit - `[b,n]`The maximum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    rulerDecorators.noLower = (limit) => $setter((thisArg, key, v) => {
        if (typeof limit === "string")
            limit = thisArg[limit];
        return typeof v === "bigint" ? (BigInt(limit) < v ? v : limit) : Math.max(Number(limit), v);
    });
    //     -------- conditional --------
    /**
     * Intercept when it gonna change, do sth or process input than cover the value
     * So is why it called `Watch`
     * @param T Input type, or let it infer by itself
     */
    rulerDecorators.watchSet = (handle) => $setter(handle);
    /**
     *
     * @param condition
     * @returns
     */
    rulerDecorators.changeable_Only_Satisfies = (condition) => $setter((thisArg, key, v) => (condition() ? v : thisArg));
    //     -------- authority like --------
    rulerDecorators.conditionalWrite = (...conditionHandles) => {
        return $setter((thisArg, key, v) => conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key, v) : h)) ? v : thisArg[key]);
    };
    rulerDecorators.conditionalRead = (...conditionHandles) => {
        return $getter((thisArg, key) => conditionHandles.every((h) => (typeof h === "function" ? h(thisArg, key) : h)) ? thisArg[key] : undefined);
    };
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive changes.
     */
    rulerDecorators.onlyTheClassCanWrite = (thisClassCtor) => rulerDecorators.conditionalWrite((thisArg) => thisArg.constructor === thisClassCtor);
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you hsave no right of, otherwise returns sth.
     */
    rulerDecorators.onlyTheClassCanRead = (thisClassCtor) => rulerDecorators.conditionalWrite((thisArg) => thisArg.constructor === thisClassCtor);
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive changes.
     */
    rulerDecorators.onlyTheClassAndSubCanWrite = (thisClassCtor) => rulerDecorators.conditionalWrite((thisArg) => thisArg.constructor instanceof thisClassCtor);
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you hsave no right of, otherwise returns sth.
     */
    rulerDecorators.onlyTheClassAndSubCanRead = (thisClassCtor) => rulerDecorators.conditionalWrite((thisArg) => thisArg.constructor instanceof thisClassCtor);
    function egg() { }
    rulerDecorators.egg = egg;
})(rulerDecorators || (exports.rulerDecorators = rulerDecorators = {}));
