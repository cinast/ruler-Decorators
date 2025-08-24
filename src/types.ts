import { paramFilterHandler, paramRejectionHandler, rd_GetterHandle, rd_SetterHandle } from "./type.handles";

export interface rd_ProxyTraps<T extends any> {
    // apply: ((target: T, thisArg: any, argArray: any[]) => any)[];

    // construct?(target: T, argArray: any[], newTarget: Function): object;

    // defineProperty?(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean;

    // deleteProperty?(target: T, p: string | symbol): boolean;

    get?: rd_GetterHandle[];

    // getOwnPropertyDescriptor?(target: T, p: string | symbol): PropertyDescriptor | undefined;

    // getPrototypeOf?(target: T): object | null;

    // has?(target: T, p: string | symbol): boolean;

    // isExtensible?(target: T): boolean;

    // ownKeys?(target: T): ArrayLike<string | symbol>;

    // preventExtensions?(target: T): boolean;

    set?: rd_SetterHandle[];

    // setPrototypeOf?(target: T, v: object | null): boolean;
}
