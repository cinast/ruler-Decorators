import { __Setting } from "./moduleMeta";
import { $interceptionModes, decoratorType } from "./rulerDecorators";
("use strict");

export const byTheWay = (re: any, doSth: ((r: typeof re) => any)[]) => {
    doSth.forEach((f) => f(re));
    return re;
};

export const processIt = (input: any, doSth: Function[]) => doSth.reduce((p, f) => f(p));

/** Identifies decorator type from arguments */
export function getDecoratorType(args: any[]): decoratorType | "UNKNOWN" {
    // 检查参数长度和类型
    if (typeof args[0] === "function") {
        return "ClassDecorator";
    }

    if (
        typeof args[2] === "object" &&
        typeof args[0] === "object" &&
        (typeof args[1] === "string" || typeof args[1] === "symbol")
    ) {
        return "MethodDecorator";
    }

    if (
        typeof args[2] === undefined ||
        (typeof args[0] === "object" && (typeof args[1] === "string" || typeof args[1] === "symbol"))
    ) {
        return "PropertyDecorator";
    }

    if (
        typeof args[2] === "number" &&
        typeof args[0] === "object" &&
        (typeof args[1] === "string" || typeof args[1] === "symbol")
    ) {
        return "ParameterDecorator";
    }

    return "UNKNOWN";
}

/**
 * and anywise
 * @param props
 * @returns
 */
export function $defineProperty(props: Record<string, PropertyDescriptor>): PropertyDecorator & MethodDecorator & ClassDecorator {
    return function (target: any, attr?: string | symbol, desc?: PropertyDescriptor): any {
        const whoIsThis = getDecoratorType([target, attr, desc]);
        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                const element = props[key];
                switch (whoIsThis) {
                    case "ClassDecorator":
                        if (typeof target === "function") {
                            // 对于类装饰器，返回一个新的类
                            return class extends target {
                                constructor(...args: any[]) {
                                    super(...args);
                                    Object.defineProperty(this, key, element);
                                }
                            };
                        } else {
                            // 如果不是构造函数，直接修改原型
                            Object.defineProperty(target, key, element);
                            return target;
                        }
                    case "PropertyDecorator":
                        Object.defineProperty(target, key, element);
                        break;
                    case "MethodDecorator":
                        if (desc) {
                            // 对于方法装饰器，可以返回新的描述符
                            return Object.assign({}, desc, element);
                        }
                        break;
                }
            }
        }

        // 对于属性和方法装饰器，如果没有返回新值，应该返回 undefined 或原描述符
        if (whoIsThis === "MethodDecorator" && desc) {
            return desc;
        }
        return undefined;
    } as any; // 使用类型断言来解决复杂的类型问题
}

/**
 * Check if decorator type is compatible with interception mode
 * 检查装饰器类型是否与拦截模式兼容
 */
export function isModeCompatible(decoratorType: decoratorType, mode: $interceptionModes): boolean {
    const compatibility: Record<decoratorType, $interceptionModes[]> = {
        ClassDecorator: ["class-proxy", "accessor"],
        PropertyDecorator: ["property-proxy", "accessor"],
        MethodDecorator: ["function-param-accessor", "accessor"],
        ParameterDecorator: [], // 暂不支持
    };

    return compatibility[decoratorType].includes(mode);
}
/**
 * Automatic mode selector for rulerDecorators
 * 根据配置和装饰器类型及运行时条件自动选择最佳模式
 * @returns see $modTypes
 */

export function rd_executeModeSelector(
    decoratorType: Exclude<decoratorType, "ParameterDecorator">,
    target: any,
    propertiesWithRuleApplied: number
): $interceptionModes {
    // 1. 检查是否强制禁用 Proxy
    if (__Setting["Optimize.$$init.disableUsingProxy"]) {
        return "accessor";
    }

    // 2. 检查环境是否支持 Proxy
    if (typeof Proxy === "undefined") {
        return "accessor";
    }

    // 3. 筛选可确定的
    switch (decoratorType) {
        case "ClassDecorator":
            return __Setting["Optimize.$$init.disableUsingProxy"] ? "accessor" : "class-proxy";
        case "MethodDecorator":
            return "function-param-accessor";
    }

    // target: [] | {...}
    // 4. 对数组特别设定
    if (target instanceof Array) {
        return __Setting["Optimize.$$init.disableUsingProxy"] ? "accessor" : "property-proxy";
    }

    // target: {...}
    // 5.对普遍对象类 检查是否超过属性数量阈值
    const threshold = __Setting["Optimize.$$init.autoUseProxyWhenRuledKeysMoreThan"];
    if (propertiesWithRuleApplied > threshold) {
        return "property-proxy";
    }

    // 6. 回退到默认值
    return __Setting["Optimize.$$init.defaultMod"] == "proxy" ? "property-proxy" : "accessor";
}
export const is_supposedTypes = [
    "array",
    "bigint",
    "boolean",
    "function",
    "number",
    "object",
    "string",
    "symbol",
    "null",
    "undefined",
    "NaN",
    "Infinity",
    "Integer",
    "float",
    "promise",
    "regexp",
    "date",
    "error",
    "map",
    "set",
    "weakmap",
    "weakset",
    "arraybuffer",
    "typedarray",
    "generator",
    "generatorfunction",
    "asyncfunction",
    "arguments",
] as const;
export type is_supposedTypesT = (typeof is_supposedTypes)[number];
export const is = (type: is_supposedTypesT) => (v: any) => {
    return {
        // 基本类型
        array: Array.isArray(v),
        bigint: typeof v === "bigint",
        boolean: typeof v === "boolean",
        function: typeof v === "function",
        number: typeof v === "number",
        object: typeof v === "object" && v !== null,
        string: typeof v === "string",
        symbol: typeof v === "symbol",

        // 特殊值
        null: v === null,
        undefined: typeof v === "undefined",
        NaN: Number.isNaN(v),
        Infinity: typeof v === "number" && !isFinite(v) && !Number.isNaN(v),

        // 数学
        Integer: Number.isInteger(v),
        float: typeof v === "number" && !Number.isInteger(v) && isFinite(v),

        // 对象子类型
        promise: v instanceof Promise,
        regexp: v instanceof RegExp,
        date: v instanceof Date,
        error: v instanceof Error,
        map: v instanceof Map,
        set: v instanceof Set,
        weakmap: v instanceof WeakMap,
        weakset: v instanceof WeakSet,
        arraybuffer: v instanceof ArrayBuffer,

        // 函数子类型
        generator: Object.prototype.toString.call(v) === "[object Generator]",
        generatorfunction: Object.prototype.toString.call(v) === "[object GeneratorFunction]",
        asyncfunction: Object.prototype.toString.call(v) === "[object AsyncFunction]",
        arguments: Object.prototype.toString.call(v) === "[object Arguments]",

        // 类数组类型
        typedarray: ArrayBuffer.isView(v) && !(v instanceof DataView),
    }[type];
};
