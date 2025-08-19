/**
 * @this
 * @extraModule
 * @moreExtra see https://github.com/cinast/ruler-Decorators-extra-libraries or other pack at npm
 * @namespace valueRecorder
 * @exported src\rulerDecorators.ts ~577
 */
/**
 * @extraModule
 * @namespace valueRecorder
 */
export declare namespace valueRecorder {
    const $recordThis: (maxSteps?: number) => PropertyDecorator & MethodDecorator;
    function undo(target: any, key: keyof typeof target): boolean;
    function redo(target: any, key: keyof typeof target): boolean;
}
//# sourceMappingURL=valueRecorder.d.ts.map