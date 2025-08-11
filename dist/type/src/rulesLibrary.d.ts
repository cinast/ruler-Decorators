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
 * @warning Returns undefined if validation fails and no onError provided
 * @warning 如果验证失败且未提供onError处理，则返回undefined
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export declare const Int: <T extends number | bigint = number>(onError?: ((v: number, o?: unknown) => T) | "ceil" | "floor" | "round" | number) => PropertyDecorator;
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
export declare const alwaysPositive: PropertyDecorator;
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
export declare const alwaysNegative: PropertyDecorator;
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
export declare const minimum: (min: bigint | number, allowEqual?: boolean) => PropertyDecorator;
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
export declare const maximum: (max: bigint | number, allowEqual?: boolean) => PropertyDecorator;
/**
 * Rejects strings containing specified patterns
 * 拒绝包含指定模式的字符串
 * @param patten - Patterns to exclude (string or RegExp)
 *                 要排除的模式(字符串或正则表达式)
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export declare const stringExcludes: (...patten: (RegExp | string)[]) => PropertyDecorator;
/**
 * Requires strings to contain specified patterns
 * 要求字符串包含指定模式
 * @param patten - Required patterns (string or RegExp)
 *                 要求的模式(字符串或正则表达式)
 * @overload Property decorator
 * @overload Method decorator (set accessor)
 * @overload Auto-accessor decorator
 */
export declare const stringRequires: (...patten: (RegExp | string)[]) => PropertyDecorator;
/**
 *
 */
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
export declare const onlyTheClassCanRead: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
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
export declare const onlyTheClassCanWrite: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
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
export declare const onlyTheClassAndSubCanWrite: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
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
export declare const onlyTheClassAndSubCanRead: (thisClass: new (...args: any[]) => any) => PropertyDecorator;
/**
 * @deprecated 😂➡️demo used and even failed
 * @param date
 * @returns
 */
export declare const triggeredOnSomeDay: (date: Date | number) => PropertyDecorator;
//# sourceMappingURL=rulesLibrary.d.ts.map