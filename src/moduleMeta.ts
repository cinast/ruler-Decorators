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
    /**
     * @deprecated
     * my design were no as safety as that required \
     * 此作品还不够格
     */
    pro: () => void;
    /**
     * entertaining \
     * 娱乐就好
     */
    dev: () => void;
    /**
     * @deprecated
     * Take your work to ruin \
     * 作死！
     */
    godMod: () => void;
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
    pro() {
        Object.assign(this, {
            "$conditionalWR.defaultErrorType": "Error",
            "debugLogger.logInnerDetails": false,
            "$debug.allowUsing": false,
            "$debug.debugger": false,
            "$debug.enableLog": false,
            "$debug.enableWarn": false,
            "$debug.allowReturn": false,
            "$debug.callHandles": false,
        });
        this.lock();
    },
    dev() {
        Object.assign(this, {
            "$conditionalWR.defaultErrorType": "Error",
            "debugLogger.logInnerDetails": false,
            "$debug.allowUsing": true,
            "$debug.debugger": false,
            "$debug.enableLog": true,
            "$debug.enableWarn": true,
            "$debug.allowReturn": false,
            "$debug.callHandles": true,
        });
        this.lock();
    },

    godMod() {
        Object.assign(this, {
            "$conditionalWR.defaultErrorType": "Error",
            "debugLogger.logInnerDetails": true,
            "$debug.allowUsing": true,
            "$debug.debugger": true,
            "$debug.enableLog": true,
            "$debug.enableWarn": true,
            "$debug.allowReturn": true,
            "$debug.callHandles": true,
        });
        this.lock();
    },
};

export const version = "1.0.0" as const;
