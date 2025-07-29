"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thisSymbols = exports.$recordThis = void 0;
exports.undo = undo;
exports.redo = redo;
const rulerDecorators_1 = require("./rulerDecorators");
const $recordThis = (maxSteps = 10) => {
    return (0, rulerDecorators_1.$setter)((thisArg, key, value) => {
        // 初始化历史记录存储
        if (!thisArg[rulerDecorators_1.rulerDecorators.thisSymbols]) {
            thisArg[rulerDecorators_1.rulerDecorators.thisSymbols] = {};
        }
        const storage = thisArg[rulerDecorators_1.rulerDecorators.thisSymbols];
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
exports.$recordThis = $recordThis;
exports.thisSymbols = Symbol("rulerDecorators");
// 撤销操作
function undo(target, key) {
    const symbol = rulerDecorators_1.rulerDecorators.thisSymbols;
    const storage = target[symbol];
    if (!storage)
        return false;
    const recordKey = `${String(key)}_history`;
    const history = storage[recordKey];
    if (!history || history.recordList.length === 0)
        return false;
    const currentValue = target[key];
    const lastValue = history.recordList.pop();
    // 保存当前值到重做栈
    history.redoStack.push(currentValue);
    // 恢复历史值
    target[key] = lastValue;
    return true;
}
// 重做操作
function redo(target, key) {
    const symbol = rulerDecorators_1.rulerDecorators.thisSymbols;
    const storage = target[symbol];
    if (!storage)
        return false;
    const recordKey = `${String(key)}_history`;
    const history = storage[recordKey];
    if (!history || history.redoStack.length === 0)
        return false;
    const nextValue = history.redoStack.pop();
    // 保存当前值到历史记录
    history.recordList.push(target[key]);
    // 应用重做值
    target[key] = nextValue;
    return true;
}
