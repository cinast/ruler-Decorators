/**
 * @author @cinast
 */
/**
 * \*code candies\* \
 * Make u easier decorate ur properties \
 * soo trash it to add additional get or set,
 *
 * @author cinast
 * @since 2022-11-29
 * @update 2025-7-28
 * @version 1.0.0
 *
 * **@warning** tsconfg `experimentalDecorators` must be `true` \
 * **@tip** tsconfg.json with that should be placed at ts files' Parent or sibling folders \
 * **@tip** tsc need 5.2+
 */
export declare namespace rulerDecorators {
    /**
     *           ————————base fn————————
     */
    /**
     * Getter decorator Factory.
     * @factory
     * @param handle - Function to define the getter behavior.
     * @returns A property decorator.
     */
    function $getter(handle: (thisArg: any, propertyKey: string | symbol, ...arg: any[]) => unknown): PropertyDecorator;
    /**
     * Setter decorator Factory.
     * @factory
     * @param handle - Function to define the setter behavior.
     * @returns A property decorator.
     */
    function $setter<T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T): PropertyDecorator;
    /**
     * and anywise
     * @param props
     * @returns
     */
    function $defineProperty<T>(...props: any[][]): PropertyDecorator;
    /**
     * Ensures the property value is never less than zero.
     */
    const isPositive: PropertyDecorator;
    /**
     * Ensures the property value does not exceed a specified limit.
     * @param limit - `[b,n]`The maximum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    const noOver: (limit: bigint | number | string) => PropertyDecorator;
    /**
     * Ensures the property value is never less than a specified limit.
     * @param limit - `[b,n]`The maximum allowed value, \
     *                `[str]`or the key of the property that holds the limit.
     */
    const noLower: (limit: bigint | number) => PropertyDecorator;
    /**
     * Intercept when it gonna change, do sth or process input than cover the value
     * So is why it called `Watch`
     * @param T Input type, or let it infer by itself
     */
    const watchSet: <T>(handle: (thisArg: any, propertyKey: string | symbol, value: T) => T) => PropertyDecorator;
    /**
     *
     * @param condition
     * @returns
     */
    const changeable_Only_Satisfies: (condition: () => boolean) => PropertyDecorator;
    const conditionalWrite: (...conditionHandles: (boolean | ((thisArg: any, key: any, v: any) => boolean))[]) => PropertyDecorator;
    const conditionalRead: (...conditionHandles: (boolean | ((thisArg: any, key: any) => boolean))[]) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive changes.
     */
    const onlyTheClassCanWrite: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you hsave no right of, otherwise returns sth.
     */
    const onlyTheClassCanRead: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns Keep still if you hsave no right of, otherwise receive changes.
     */
    const onlyTheClassAndSubCanWrite: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    /**
     * `Protect`'s another version, but viewable to outer.
     * @param thisClassCtor Constructor of that class.
     * @returns `undefined` if you hsave no right of, otherwise returns sth.
     */
    const onlyTheClassAndSubCanRead: (thisClassCtor: new (...args: any[]) => any) => PropertyDecorator;
    function egg(): void;
}
