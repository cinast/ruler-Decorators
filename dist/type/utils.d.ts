import { $interceptionModes, decoratorType } from "./rulerDecorators";
export declare const byTheWay: (re: any, doSth: ((r: typeof re) => any)[]) => any;
export declare const processIt: (input: any, doSth: Function[]) => Function;
/** Identifies decorator type from arguments */
export declare function getDecoratorType(args: any[]): decoratorType | "UNKNOWN";
/**
 * and anywise
 * @param props
 * @returns
 */
export declare function $defineProperty(props: Record<string, PropertyDescriptor>): PropertyDecorator & MethodDecorator & ClassDecorator;
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
//# sourceMappingURL=utils.d.ts.map