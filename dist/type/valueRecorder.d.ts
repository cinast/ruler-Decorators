/**
 * @this
 * @extraModule
 * @moreExtra see https://github.com/cinast/ruler-Decorators-extra-libraries or other pack at npm
 * @deprecated
 * @namespace valueRecorder
 * @exported src\rulerDecorators.ts ~577
 */
export declare namespace valueRecorder {
    const $recordThis: (maxSteps?: number) => PropertyDecorator & MethodDecorator;
    function undo<T>(target: T, key: keyof T): boolean;
    function redo<T>(target: T, key: keyof T): boolean;
}
//# sourceMappingURL=valueRecorder.d.ts.map