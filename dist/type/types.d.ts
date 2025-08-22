import { rd_GetterHandle, rd_SetterHandle } from "./type.handles";
export interface rd_ProxyHandler<T extends object> {
    get: rd_GetterHandle[];
    set: rd_SetterHandle[];
}
//# sourceMappingURL=types.d.ts.map