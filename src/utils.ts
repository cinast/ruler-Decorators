import { debugLogger } from "./api.test";
import { getDescriptor } from "./manage";
import { __Setting } from "./moduleMeta";
import { $interceptionModes, $setter, decoratorType, Storage } from "./rulerDecorators";
("use strict");

/** Identifies decorator type from arguments */
export function getDecoratorType(args: any[]): decoratorType | "UNKNOWN" {
    console.log("getDecoratorType args:", args);

    // 检查参数长度和类型
    if (args.length === 1 && typeof args[0] === "function") {
        return "ClassDecorator";
    }

    if (args.length === 2 && typeof args[0] === "object" && (typeof args[1] === "string" || typeof args[1] === "symbol")) {
        return "PropertyDecorator";
    }

    if (
        args.length === 3 &&
        typeof args[0] === "object" &&
        (typeof args[1] === "string" || typeof args[1] === "symbol") &&
        (args[2] === undefined || (args[2] && typeof args[2] === "object"))
    ) {
        return "MethodDecorator";
    }

    if (
        args.length === 3 &&
        typeof args[0] === "object" &&
        (typeof args[1] === "string" || typeof args[1] === "symbol") &&
        typeof args[2] === "number"
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
export function $defineProperty<T>(...props: any[]): PropertyDecorator {
    return function (target: any, attr: string | symbol) {
        Object.defineProperty(target, attr, props);
    };
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
/**
 * Get the count of decorated properties for a target
 * 获取目标对象上被装饰的属性数量
 */

export function getDecoratedPropertyCount(target: any): number {
    if (!target) return 0;

    const targetMap = Storage.get(target);
    if (!targetMap) return 0;

    // 计算有处理器的属性数量
    let count = 0;
    for (const descriptor of targetMap.values()) {
        if (descriptor.setters?.length || descriptor.getters?.length) {
            count++;
        }
    }

    return count;
}
/**
 * Check if a property has handlers
 * 检查属性是否有处理器
 */

export function hasHandlersFor(target: object, propertyKey: string | symbol): boolean {
    const descriptor = getDescriptor(target, propertyKey);
    const hasSetter = Boolean(descriptor.setters?.length);
    const hasGetter = Boolean(descriptor.getters?.length);
    const hasParam = Boolean(descriptor.paramHandlers?.length);
    return hasSetter || hasGetter || hasParam;
}
/**
 * Apply getter handlers for a property
 * 应用属性的 getter 处理器
 */

export function applyGetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any {
    const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(prototype, propertyKey);
    const getters = descriptor.getters || [];
    if (getters.length === 0) return value;

    return getters.reduce((prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]), value);
}
/**
 * Apply setter handlers for a property
 * 应用属性的 setter 处理器
 */

export function applySetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any {
    const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(prototype, propertyKey);
    const setters = descriptor.setters || [];
    if (setters.length === 0) return value;

    return setters.reduce((prev, handler, idx, arr) => handler(receiver, propertyKey, value, prev, idx, [...arr]), value);
}
/**
 * Apply parameter handlers for a method
 * 应用方法的参数处理器
 */
export function applyParamHandlers(receiver: any, methodKey: string | symbol, method: Function, args: any[]): any[] {
    const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(prototype, methodKey);
    const paramHandlers = descriptor.paramHandlers || [];
    if (paramHandlers.length === 0) return args;

    try {
        return paramHandlers.reduce((prev, handler, idx, arr) => {
            const result = handler(receiver, methodKey, method, args, { approached: false, output: prev }, idx, [...arr]);
            return typeof result === "boolean" ? prev : result.output;
        }, args);
    } catch (error) {
        debugLogger(console.error, "Parameter handler error for method", methodKey, ":", error);
        return args; // 发生错误时返回原始参数
    }
}
/**
 * Apply parameter rejection handlers for a method
 * 应用方法的参数拒绝处理器
 */

export function applyParamRejectionHandlers(
    receiver: any,
    methodKey: string | symbol,
    method: Function,
    args: any[],
    conditionResult: any
): any[] {
    const prototype = Object.getPrototypeOf(receiver);
    const descriptor = getDescriptor(prototype, methodKey);
    const rejectHandlers = descriptor.paramRejectHandlers || [];
    if (rejectHandlers.length === 0) return args;

    return rejectHandlers.reduce((prev, handler, idx, arr) => {
        const result = handler(receiver, methodKey, method, args, conditionResult, { approached: false, output: prev }, idx, [
            ...arr,
        ]);
        return typeof result === "boolean" ? prev : result.output;
    }, args);
}
