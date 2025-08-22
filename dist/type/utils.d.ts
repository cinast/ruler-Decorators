import { $interceptionModes, decoratorType } from "./rulerDecorators";
/** Identifies decorator type from arguments */
export declare function getDecoratorType(args: any[]): decoratorType | "UNKNOWN";
/**
 * and anywise
 * @param props
 * @returns
 */
export declare function $defineProperty<T>(...props: any[]): PropertyDecorator;
/**
 * Check if decorator type is compatible with interception mode
 * 检查装饰器类型是否与拦截模式兼容
 */
export declare function isModeCompatible(decoratorType: decoratorType, mode: $interceptionModes): boolean;
/**
 * Automatic mode selector for rulerDecorators
 * 根据配置和装饰器类型及运行时条件自动选择最佳模式
 * @returns see $modTypes
 */
export declare function rd_executeModeSelector(decoratorType: Exclude<decoratorType, "ParameterDecorator">, target: any, propertiesWithRuleApplied: number): $interceptionModes;
/**
 * Get the count of decorated properties for a target
 * 获取目标对象上被装饰的属性数量
 */
export declare function getDecoratedPropertyCount(target: any): number;
/**
 * Check if a property has handlers
 * 检查属性是否有处理器
 */
export declare function hasHandlersFor(target: object, propertyKey: string | symbol): boolean;
/**
 * Apply getter handlers for a property
 * 应用属性的 getter 处理器
 */
export declare function applyGetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any;
/**
 * Apply setter handlers for a property
 * 应用属性的 setter 处理器
 */
export declare function applySetterHandlers(receiver: any, propertyKey: string | symbol, value: any): any;
/**
 * Apply parameter handlers for a method
 * 应用方法的参数处理器
 */
export declare function applyParamHandlers(receiver: any, methodKey: string | symbol, method: Function, args: any[]): any[];
/**
 * Apply parameter rejection handlers for a method
 * 应用方法的参数拒绝处理器
 */
export declare function applyParamRejectionHandlers(receiver: any, methodKey: string | symbol, method: Function, args: any[], conditionResult: any): any[];
//# sourceMappingURL=utils.d.ts.map