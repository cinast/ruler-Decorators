/**
 * @this
 * @extraModule
 * @moreExtra see https://github.com/cinast/ruler-Decorators-extra-libraries or other pack at npm
 * @deprecated
 * @namespace valueRecorder
 * @exported src\rulerDecorators.ts ~577
 */
("use strict");

import { thisSymbols } from "./moduleMeta";
import { $setter } from "./rulerDecorators";

export const $recordThis = (maxSteps: number = 10) => {
    return $setter((thisArg, key: keyof typeof thisArg, value) => {
        // 初始化历史记录存储
        if (!thisArg[thisSymbols]) {
            thisArg[thisSymbols] = {};
        }

        const storage = thisArg[thisSymbols];
        const recordKey = `${String(key)}_history`;

        // 初始化历史记录列表
        if (!storage[recordKey]) {
            storage[recordKey] = {
                recordList: [],
                redoStack: [],
            };
        }

        const history = storage[recordKey];
        const currentValue = thisArg[key];

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
export function undo<T>(target: T, key: keyof T): boolean {
    const symbol = thisSymbols;
    const storage = (target as any)[symbol];

    if (!storage) return false;

    const recordKey = `${String(key)}_history`;
    const history = storage[recordKey];

    if (!history || history.recordList.length === 0) return false;

    const currentValue = target[key];
    const lastValue = history.recordList.pop()!;

    // 保存当前值到重做栈
    history.redoStack.push(currentValue);

    // 恢复历史值
    (target as any)[key] = lastValue;
    return true;
}

// 重做操作
export function redo<T>(target: T, key: keyof T): boolean {
    const symbol = thisSymbols;
    const storage = (target as any)[symbol];

    if (!storage) return false;

    const recordKey = `${String(key)}_history`;
    const history = storage[recordKey];

    if (!history || history.redoStack.length === 0) return false;

    const nextValue = history.redoStack.pop()!;

    // 保存当前值到历史记录
    history.recordList.push(target[key]);

    // 应用重做值
    (target as any)[key] = nextValue;
    return true;
}
