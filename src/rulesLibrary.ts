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
 * @tip Built on factoryI/factoryII foundations
 * @tip 基于一阶/二阶工厂构建
 * @author cinast
 * @since 2022-11-29
 * @update 2025-8-19
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

import { __Setting } from "./moduleMeta";
import {
    $conditionalRead,
    $conditionalWrite,
    $setter,
    filterHandler,
    paramFilterHandler,
    rejectHandler,
} from "./rulerDecorators";
export { __Setting };
("use strict");

// debugging use
// (___, p) => {
//     console.log(p);
//     return p.approached;
// },

// square power of candy
export const iAgreeAboutThat: (out?: any) => filterHandler & rejectHandler & paramFilterHandler & paramFilterHandler =
    (out?: any): filterHandler & rejectHandler & paramFilterHandler & paramFilterHandler =>
    () => {
        return out
            ? true
            : {
                  approached: true,
                  output: out,
              };
    };

export const passThat: (out?: any) => {
    approached: true;
    output: any;
} = (out?: any) => {
    return {
        approached: true,
        output: out,
    };
};

//     -------- script candy --------

/**
 * *function for lazy you*
 *
 * Give me handler and args, and I'l do all thing you need
 * (trigged on changing)
 * @param handler array.sort、console.log etc.
 * @param args args[0] value of property
 * @returns processed thing
 */
export const auto = (handler: Function, ...args: any[]) => $setter((_, __, v) => handler(v));

/**
 * Intercept when it gonna change, do sth other but not disturb it
 * So is why it called `Watch`
 * @template T Input type, or let it infer by itself
 */
export const watchSet = <T>(
    handle: (
        thisArg: any,
        attr: string | symbol,
        value: T,
        lastResult: any,
        pipeInfo: { index: number; handlers: Function[] }
    ) => T
) =>
    $setter<T>((lastResult, value, target, attr, pipeInfo) => {
        handle(target, attr, value, lastResult, pipeInfo);
        return value;
    });

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
 */
export const Int = (onError?: ((v: number | bigint, o?: unknown) => number) | "ceil" | "floor" | "round" | number) =>
    $conditionalWrite<number>(
        "Error",
        [(p) => !p.output.toString().includes(".")],
        [
            (p, fr) =>
                onError
                    ? {
                          approached: true,
                          output:
                              typeof onError == "function"
                                  ? onError(p.output, fr)
                                  : typeof onError == "number"
                                  ? onError
                                  : {
                                        ceil: Math.ceil(p.output),
                                        floor: Math.floor(p.output),
                                        round: Math.round(p.output),
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
 */
export const alwaysPositive = $conditionalWrite<bigint | number>("Warn", [(p) => p.output > 0]);

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
 */
export const alwaysNegative = $conditionalWrite<bigint | number>("Warn", [(p) => p.output < 0]);

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
 */
export const minimum = (min: bigint | number, allowEqual: boolean = true) =>
    $conditionalWrite<number | bigint>(
        "ignore",
        [
            (p) => {
                const v = p.output;
                return allowEqual
                    ? typeof v == "number"
                        ? v >= Number(min)
                        : v >= min
                    : typeof v == "number"
                    ? v > Number(min)
                    : v > min;
            },
        ],
        [
            (p, fr) => {
                return { approached: true, output: min };
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
 */
export const maximum = (max: bigint | number, allowEqual: boolean = true) =>
    $conditionalWrite<number | bigint>(
        "ignore",
        [
            (p) => {
                const v = p.output;
                return allowEqual
                    ? typeof v == "number"
                        ? Math.max(v, Number(max)) == max
                        : v <= max
                    : typeof v == "number"
                    ? Math.max(v, Number(max)) == max && p.output !== Number(max)
                    : v < max;
            },
        ],
        [iAgreeAboutThat(max)]
    );

export const range = (min: number, max: number) =>
    $conditionalWrite("ignore", [(p) => passThat(Math.min(Math.max(p.output, min), max))]);

//     -------- String  toy --------
/**
 * Rejects strings containing specified patterns
 * 回绝包含指定模式的字符串
 * @param patten - Patterns to exclude (string or RegExp)
 *                 要排除的模式(字符串或正则表达式)
 *
 * @param replace - replace excluded string
 *                  替换排除的字符串
 */
export const stringExcludes = (patten: (RegExp | string)[], replace: string = "") =>
    $conditionalWrite(
        "Warn",
        [
            (p) =>
                typeof p.output == "string" &&
                !patten.some((pat) => (typeof pat === "string" ? p.output.includes(pat) : pat.test(p.output))),
        ],
        [
            (p, fr) => {
                // 回绝处理器 - 直接返回过滤后的值
                if (typeof p.output === "string") {
                    let result = p.output;
                    for (const pattern of patten) {
                        if (typeof pattern === "string") {
                            result = result.replace(new RegExp(pattern, "g"), replace);
                        } else {
                            result = result.replace(pattern, replace);
                        }
                    }
                    return { approached: true, output: result };
                }
                return false;
            },
        ]
    );

/**
 * Requires strings to contain specified patterns
 * 要求字符串包含指定模式
 * @param patten - Required patterns (string or RegExp)
 *                 要求的模式(字符串或正则表达式)
 */
export const stringRequires = (...patten: (RegExp | string)[]) =>
    $conditionalWrite("Warn", [
        (p) =>
            typeof p.output == "string" &&
            patten.every((pat) => (typeof pat == "string" ? p.output.includes(pat) : pat.test(p.output))),
    ]);

// value limit

export const oneOf = (list: any[]) => $conditionalWrite("Warn", [(p) => list.includes(p.output)]);

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
 */
export const onlyTheClassAndSubCanRead = (thisClass: new (...args: any[]) => any) =>
    $conditionalRead("Error", [(thisArg) => thisArg instanceof thisClass]);

export * from "./extraLibraries/rulerDecorators.extend.router";
