/**
 * @this
 * @metaOf rulerDecorators
 * @setting
 */

("use strict");

/**
 * take it if u need, it might be useful \
 * *when* u are extending this module
 */
export const thisSymbols: unique symbol = Symbol("rulerDecorators");

/**
 * setting for rd lib functions
 */
export const __Setting: {
    [key: string]: any;
    /**
     * Global switch of warn or ignore when trying to change read-only property
     */
    readOnlyPropertyWarningEnabled: boolean;
    readOnlyPropertyWarningType: "Warning" | "Error";
} = {
    readOnlyPropertyWarningEnabled: false,
    readOnlyPropertyWarningType: "Warning",
};

export const version = "1.0.0" as const;
