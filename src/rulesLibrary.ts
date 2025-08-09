//     -------- Rules --------

/**
 * @this
 * @functional
 * @extendable
 * \*code candies\* \
 * Make u easier decorate ur properties \
 * soo trash it to add additional get or set,
 *
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-9
 * @version 1.0.0
 *
 * **@notice** Decorators type: experimental **stage 2**
 *
 * **@warning** tsconfg `experimentalDecorators` must be `true` \
 * **@tip** tsconfg.json with that should be placed at ts files' Parent or sibling folders \
 * **@tip** tsc need 5.2+
 */

/**
 * @this
 * @namespace rulerDecorators
 */

import { $setter, $conditionalWrite, $conditionalRead } from "./rulerDecorators";

("use strict");

//     -------- math toy --------

/**
 * 限制整数
 * @Warning 定义的时候就不通过，也不给onerror附上默认值，那就是undefined
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const Int = <T extends number | bigint = number>(
    onError?: ((v: number, o?: unknown) => T) | "ceil" | "floor" | "round" | number
) =>
    $conditionalWrite<number>(
        [(_, __, v) => !v.toString().includes(".")],
        [
            (_, __, v: number, o) =>
                onError
                    ? {
                          approached: true,
                          output:
                              typeof onError == "function"
                                  ? onError(v, o)
                                  : typeof onError == "number"
                                  ? onError
                                  : {
                                        ceil: Math.ceil(v),
                                        floor: Math.floor(v),
                                        round: Math.round(v),
                                    }[onError],
                      }
                    : false,
        ]
    );

/**
 * Ensures property value is always positive
 * 确保属性值始终为正数
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const alwaysPositive = $conditionalWrite<bigint | number>([
    (thisArg, key, v: bigint | number) => {
        console.log("alwaysPositive validator called with:", v);
        return v > 0;
    },
]);

/**
 * Ensures property value is always negative
 * 确保属性值始终为负数
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const alwaysNegative = $conditionalWrite<bigint | number>([(thisArg, key, v: bigint | number) => v < 0]);

/**
 * Sets minimum value for property
 * 设置属性的最小值
 * @param min - Minimum allowed value (number or bigint)
 *              允许的最小值(数字或大整数)
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const minimum = (min: bigint | number, allowEqual: boolean = true) =>
    $conditionalWrite<number | bigint>(
        [
            (_, __, v) =>
                allowEqual
                    ? typeof v == "number"
                        ? Math.min(v, Number(min)) == min
                        : v >= min
                    : typeof v == "number"
                    ? Math.min(v, Number(min)) == min && v !== Number(min)
                    : v > min,
        ],
        [
            () => {
                return {
                    approached: true,
                    output: min,
                };
            },
        ]
    );

// coming-soon
// export const interval = (min: bigint | number, max: bigint | number, leftEqual: boolean = true, rightEqual: boolean = true) =>
//     $conditionalWrite<number | bigint>((_, __, v) => {});

/**
 * Sets maximum value for property
 * 设置属性的最大值
 * @param max - Maximum allowed value (number or bigint)
 *              允许的最大值(数字或大整数)
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const maximum = (max: bigint | number, allowEqual: boolean = true) =>
    $conditionalWrite<number | bigint>([
        (_, __, v) =>
            allowEqual
                ? typeof v == "number"
                    ? Math.max(v, Number(max)) == max
                    : v <= max
                : typeof v == "number"
                ? Math.max(v, Number(max)) == max && v !== Number(max)
                : v < max,
    ]);

//     -------- String  toy --------
/**
 * Rejects strings containing specified patterns
 * 拒绝包含指定模式的字符串
 * @param patten - Patterns to exclude (string or RegExp)
 *                 要排除的模式(字符串或正则表达式)
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const stringExcludes = (...patten: (RegExp | string)[]) =>
    $conditionalWrite(
        [
            (_, __, value) =>
                typeof value == "string" &&
                !patten.every((pat) => (typeof pat === "string" ? value.includes(pat) : pat.test(value))),
        ],
        [
            (_, __, value) => false,
            //忘了
        ]
    );

/**
 * Requires strings to contain specified patterns
 * 要求字符串包含指定模式
 * @param patten - Required patterns (string or RegExp)
 *                 要求的模式(字符串或正则表达式)
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const stringRequires = (...patten: (RegExp | string)[]) =>
    $conditionalWrite([
        (_, __, value) =>
            typeof value == "string" && patten.every((pat) => (typeof pat == "string" ? value.includes(pat) : pat.test(value))),
    ]);

//     -------- unnamed --------

// export const ;
// 没灵感了
// 有意者请见github.com/cinast/ruler-Decorators
// 展示结束
/**
 *
 */
//     -------- authority like --------

/**
 * @deprecated
 * @tip
 * 作为表达式调用时，无法解析属性修饰器的签名。
 * 运行时将使用 2 个自变量调用修饰器，但修饰器需要 1 个。ts(1240)
 * 装饰器函数返回类型为“PropertyDecorator”，但预期为“void”或“any”。ts(1271)
 * @onlyTheClassXXX ←忘记加括号，可以指定类，可以this可以其他
 * [property] a = 0
 */

/**
 * @Warning But that only make sense where sub class defined \
 * 但是作用只对子类有用
 *
 * Restrict property read access to only specified class instances
 * 限制属性读取权限，仅允许指定类的实例访问
 * @param thisClass - Class constructor to check against
 *                   用于权限检查的类构造函数
 * @returns Original value if access allowed, undefined otherwise
 *          允许访问时返回原值，否则返回undefined
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 */
export const onlyTheClassCanRead = (thisClass: new (...args: any[]) => any) =>
    $conditionalRead([(thisArg) => thisArg instanceof thisClass && Object.getPrototypeOf(thisArg) === thisClass.prototype]);

/**
 * @deprecated
 * @Warning But that only make sense where sub class defined \
 * 但是作用只对子类有用
 *
 * Restrict property write access to only specified class instances
 * 限制属性写入权限，仅允许指定类的实例修改
 * @param thisClass - Class constructor to check against
 *                   用于权限检查的类构造函数
 * @returns New value if access allowed, keeps old value otherwise
 *          允许访问时接受新值，否则保持原值
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const onlyTheClassCanWrite = (thisClass: new (...args: any[]) => any) =>
    $conditionalWrite([(thisArg) => thisArg instanceof thisClass && Object.getPrototypeOf(thisArg) === thisClass.prototype]);

/**
 * @deprecated
 * @Warning But limited by skill and no sense at there \
 * 但是受限于技术，没效果啊！
 *
 * Restrict property write access to specified class and its subclasses
 * 限制属性写入权限，允许指定类及其子类的实例修改
 * @param thisClass - Base class constructor to check against
 *                   用于权限检查的基类构造函数
 * @returns New value if access allowed, keeps old value otherwise
 *          允许访问时接受新值，否则保持原值
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const onlyTheClassAndSubCanWrite = (thisClass: new (...args: any[]) => any) =>
    $conditionalWrite([(thisArg) => thisArg instanceof thisClass]);

/**
 * @deprecated
 * @Warning But limited by skill and no sense at there \
 * 但是受限于技术，没效果啊！
 *
 * Restrict property read access to specified class and its subclasses
 * 限制属性读取权限，允许指定类及其子类的实例访问
 * @param thisClass - Base class constructor to check against
 *                   用于权限检查的基类构造函数
 * @returns Original value if access allowed, undefined otherwise
 *          允许访问时返回原值，否则返回undefined
 * @overload Property decorator
 * @overload Method decorator (get accessor)
 * @overload Auto-accessor decorator
 */
export const onlyTheClassAndSubCanRead = (thisClass: new (...args: any[]) => any) =>
    $conditionalRead([(thisArg) => thisArg instanceof thisClass]);

//     -------- strange --------

/**
 * @deprecated 😂➡️demo used and even failed
 * @param date
 * @returns
 */
export const triggeredOnSomeDay = (date: Date | number) =>
    $conditionalRead([() => Date.now() == (typeof date == "number" ? date : date.getMilliseconds())]);

// export function egg() {}
