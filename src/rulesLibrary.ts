//     -------- Rules Library --------

/**
 * @namespace rulerDecorators
 * Predefined property rule decorators collection
 * 预定义的属性规则装饰器集合
 *
 * @functional Extensible decorator factories
 * @functional 可扩展的装饰器工厂
 * @extendable Can be used as base for custom rules
 * @extendable 可作为自定义规则的基础
 *
 * @core_concept Built on factoryI/factoryII foundations
 * @core_concept 基于一阶/二阶工厂构建
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-9
 * @version 1.0.0
 *
 * @notice Decorators type: experimental stage 2
 * @notice 装饰器类型：实验性stage 2
 * @warning tsconfig `experimentalDecorators` must be `true`
 * @warning 必须设置tsconfig的experimentalDecorators为true
 * @tip tsconfig.json should be placed at ts files' parent or sibling folders
 * @tip tsconfig.json应放在ts文件的父级或同级目录
 * @tip Requires TypeScript 5.2+
 * @tip 需要TypeScript 5.2+版本
 */

/**
 * @this
 * @namespace rulerDecorators
 */

import { $conditionalWrite, $conditionalRead } from "./rulerDecorators";
import { __Setting } from "./moduleMeta";
export { __Setting };
("use strict");

//     -------- math toy --------

/**
 * Integer value validator decorator
 * 整数值验证装饰器
 *
 * @rule Ensures property value is integer
 * @rule 确保属性值为整数
 * @param onError - Error handling strategy:
 *                错误处理策略:
 *                - Function: Custom handler (v: number, o?: unknown) => T
 *                - "ceil"|"floor"|"round": Math rounding method
 *                - number: Fixed fallback value
 *                - none: Wait for warning or error thrown
 * @warning Returns undefined if validation fails and no onError provided
 * @warning 如果验证失败且未提供onError处理，则返回undefined
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const Int = (onError?: ((v: number | bigint, o?: unknown) => number) | "ceil" | "floor" | "round" | number) =>
    $conditionalWrite<number>(
        "Error",
        [(_, __, v: number) => !v.toString().includes(".")],
        [
            (_, __, v, o) =>
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
 * Positive number validator decorator
 * 正数验证装饰器
 *
 * @rule Ensures property value is always positive
 * @rule 确保属性值始终为正数
 * @param value - Input value to validate
 *                待验证的输入值
 * @returns true if value is positive, false otherwise
 *          如果值为正数返回true，否则返回false
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const alwaysPositive = $conditionalWrite<bigint | number>("Warn", [(thisArg, key, v: bigint | number) => v > 0]);

/**
 * Negative number validator decorator
 * 负数验证装饰器
 *
 * @rule Ensures property value is always negative
 * @rule 确保属性值始终为负数
 * @param value - Input value to validate
 *                待验证的输入值
 * @returns true if value is negative, false otherwise
 *          如果值为负数返回true，否则返回false
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const alwaysNegative = $conditionalWrite<bigint | number>("Warn", [(thisArg, key, v: bigint | number) => v < 0]);

/**
 * Minimum value validator decorator
 * 最小值验证装饰器
 *
 * @rule Ensures property value is >= minimum
 * @rule 确保属性值不小于最小值
 * @param min - Minimum allowed value (number or bigint)
 *              允许的最小值(数字或大整数)
 * @param allowEqual - Whether to allow equal to minimum (default: true)
 *                    是否允许等于最小值(默认: true)
 * @returns New value if below minimum, original value otherwise
 *          低于最小值时返回新值，否则保持原值
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const minimum = (min: bigint | number, allowEqual: boolean = true) =>
    $conditionalWrite<number | bigint>(
        "ignore",
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
 * Maximum value validator decorator
 * 最大值验证装饰器
 *
 * @rule Ensures property value is <= maximum
 * @rule 确保属性值不大于最大值
 * @param max - Maximum allowed value (number or bigint)
 *              允许的最大值(数字或大整数)
 * @param allowEqual - Whether to allow equal to maximum (default: true)
 *                    是否允许等于最大值(默认: true)
 * @returns New value if above maximum, original value otherwise
 *          超过最大值时返回新值，否则保持原值
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export const maximum = (max: bigint | number, allowEqual: boolean = true) =>
    $conditionalWrite<number | bigint>("ignore", [
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
    $conditionalWrite<string>("Warn", [
        (_, __, value) =>
            typeof value == "string" && !patten.some((pat) => (typeof pat === "string" ? value.includes(pat) : pat.test(value))),
    ]);

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
    $conditionalWrite<string>("Warn", [
        (_, __, value) =>
            typeof value == "string" && patten.every((pat) => (typeof pat == "string" ? value.includes(pat) : pat.test(value))),
    ]);

export const trimBlank = $conditionalWrite<string>("ignore", [
    (_, __, value) => {
        const sanitized = value.trim();
        return {
            approached: true,
            output: sanitized,
        };
    },
]);

/**
 * 根据长度规则验证并调整字符串
 * @param length 目标长度
 * @param tail 可选操作符和文本：
 *   - `+文本`：如果不足长度则追加
 *   - `-文本`：如果超出长度则替换末尾
 */
export const validateLength = (length: number | bigint, tail?: `+${string}` | `-${string}`) =>
    $conditionalWrite<string>("ignore", [
        // 处理tail
        () => ({
            approached: false,
            output: tail ? (tail[0] === "+" ? tail.length - 1 : -(tail.length - 1)) : 0,
        }),
        (_, __, value, p) => {
            const len = Number(length) + Number(p.output);
            if (!tail) return { approached: true, output: value.slice(0, len) };

            const [op, text] = [tail[0], tail.slice(1)];
            let result = value;

            if (op === "+" && value.length < len) {
                result = value + text.repeat(Math.ceil((len - value.length) / text.length)).slice(0, len - value.length);
            } else if (op === "-" && value.length > len) {
                result = value.slice(0, len - text.length) + text;
            }

            return { approached: true, output: result.slice(0, len) };
        },
    ]);

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
    $conditionalRead("Error", [
        (thisArg) => thisArg instanceof thisClass && Object.getPrototypeOf(thisArg) === thisClass.prototype,
    ]);

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
    $conditionalWrite("Error", [
        (thisArg) => thisArg instanceof thisClass && Object.getPrototypeOf(thisArg) === thisClass.prototype,
    ]);

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
    $conditionalWrite("Error", [(thisArg) => thisArg instanceof thisClass]);

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
    $conditionalRead("Error", [(thisArg) => thisArg instanceof thisClass]);

//     -------- strange --------

/**
 * @deprecated 😂➡️demo used and even failed
 * @param date
 * @returns
 */
export const triggeredOnSomeDay = (date: Date | number) =>
    $conditionalRead("Error", [() => Date.now() == (typeof date == "number" ? date : date.getMilliseconds())]);

// export function egg() {}
