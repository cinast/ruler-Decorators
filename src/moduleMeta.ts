/**
 * @this
 * @metaOf rulerDecorators
 * @setting
 */

("use strict");

/**
 * may u would u this \
 * someday, maybe
 */
export const thisSymbols: unique symbol = Symbol("rulerDecorators");

/**
 * setting for rd lib functions
 */
export const __Setting: {
    /**
     * Global switch of warn or ignore when trying to change read-only property
     */
    "$conditionalWR.defaultErrorType": "Warn" | "Error";
    "debugLogger.logInnerDetails": boolean;
    "$debug.allowUsing": boolean;
    "$debug.debugger": boolean;
    "$debug.enableLog": boolean;
    "$debug.enableWarn": boolean;
    "$debug.allowReturn": boolean;
    "$debug.callHandles": boolean;

    lock: () => void;
} = {
    "$conditionalWR.defaultErrorType": "Error",
    "debugLogger.logInnerDetails": false,
    "$debug.allowUsing": true,
    "$debug.debugger": false,
    "$debug.enableLog": true,
    "$debug.enableWarn": true,
    "$debug.allowReturn": false,
    "$debug.callHandles": true,
    lock() {
        Object.freeze(__Setting);
    },
};

export const version = "1.0.0" as const;
