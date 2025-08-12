export declare namespace valueRecorder {
    const $recordThis: (maxSteps?: number) => PropertyDecorator & MethodDecorator;
    function undo<T>(target: T, key: keyof T): boolean;
    function redo<T>(target: T, key: keyof T): boolean;
}
//# sourceMappingURL=valueRecorder.d.ts.map