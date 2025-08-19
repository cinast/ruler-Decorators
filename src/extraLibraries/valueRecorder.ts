/**
 * @this
 * @extraModule
 * @moreExtra see https://github.com/cinast/ruler-Decorators-extra-libraries or other pack at npm
 * @namespace valueRecorder
 * @exported src\rulerDecorators.ts ~577
 */

("use strict");

import { debugLogger } from "../api.test";
import { $setter } from "../rulerDecorators";

const recordStorage = new WeakMap<
    object,
    Record<
        string | symbol,
        {
            recordList: any[];
            redoStack: any[];
            trigger: boolean;
        }
    >
>();

/**
 * @extraModule
 * @namespace valueRecorder
 */
export namespace valueRecorder {
    export const $recordThis = (maxSteps: number = 10) => {
        return $setter((thisArg, key: keyof typeof thisArg, value) => {
            if (!recordStorage.get(thisArg)) {
                recordStorage.set(thisArg, {});
            }
            const storage = recordStorage.get(thisArg)!;

            // 初始化历史记录列表
            if (!storage[key]) {
                storage[key] = {
                    recordList: [],
                    redoStack: [],
                    trigger: false,
                };
            }
            if (storage[key].trigger) {
                storage[key].trigger = false;
                return value;
            }

            const currentValue = thisArg[key];
            const history = storage[key];
            console.log(String(key) + " history", history);

            // 保存旧值到历史记录
            history.recordList.push(currentValue);

            // 限制历史记录长度
            if (history.recordList.length > maxSteps) {
                history.recordList.shift();
            }

            // 清空重做栈（新操作覆盖重做历史）
            history.redoStack = [];

            return value;
        });
    };

    // 撤销操作
    export function undo(target: any, key: keyof typeof target): boolean {
        const storage = recordStorage.get(target)!;
        if (!storage) return false;

        const history = storage[key];
        if (!history || history.recordList.length === 0) return false;

        const currentValue = target[key];

        const lastValue = history.recordList.pop()!;

        // 保存当前值到重做栈
        history.redoStack.push(currentValue);
        storage[key].trigger = true;
        // 恢复历史值
        debugLogger(console.log, "[undo] " + String(key) + " history", history);
        (target as any)[key] = lastValue;
        return true;
    }

    // 重做操作
    export function redo(target: any, key: keyof typeof target): boolean {
        const storage = recordStorage.get(target);

        if (!storage) return false;

        const history = storage[key];

        if (!history || history.redoStack.length === 0) return false;

        const nextValue = history.redoStack.pop()!;

        // 保存当前值到历史记录
        history.recordList.push(target[key]);
        storage[key].trigger = true;

        // 应用重做值
        debugLogger(console.log, "[redo] " + String(key) + " history", history);
        (target as any)[key] = nextValue;
        return true;
    }
}
