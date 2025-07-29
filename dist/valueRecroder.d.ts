export declare const $recordThis: (maxSteps?: number) => PropertyDecorator;
export declare const thisSymbols: unique symbol;
export declare function undo<T>(target: T, key: keyof T): boolean;
export declare function redo<T>(target: T, key: keyof T): boolean;
