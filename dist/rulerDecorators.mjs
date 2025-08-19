var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/moduleMeta.ts
var thisSymbols = Symbol("rulerDecorators");
var __Setting = {
  veryStrict: false,
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
      enableChangingType: false,
      "$conditionalWR.defaultErrorType": "Error",
      "debugLogger.logInnerDetails": false,
      "$debug.allowUsing": false,
      "$debug.debugger": false,
      "$debug.enableLog": false,
      "$debug.enableWarn": false,
      "$debug.allowReturn": false,
      "$debug.callHandles": false
    });
    this.lock();
  },
  dev() {
    Object.assign(this, {
      enableChangingType: false,
      "$conditionalWR.defaultErrorType": "Error",
      "debugLogger.logInnerDetails": false,
      "$debug.allowUsing": true,
      "$debug.debugger": false,
      "$debug.enableLog": true,
      "$debug.enableWarn": true,
      "$debug.allowReturn": false,
      "$debug.callHandles": true
    });
    this.lock();
  },
  godMod() {
    Object.assign(this, {
      enableChangingType: true,
      "$conditionalWR.defaultErrorType": "Error",
      "debugLogger.logInnerDetails": true,
      "$debug.allowUsing": true,
      "$debug.debugger": true,
      "$debug.enableLog": true,
      "$debug.enableWarn": true,
      "$debug.allowReturn": true,
      "$debug.callHandles": true
    });
    this.lock();
  }
};

// src/api.test.ts
function debugLogger(f, ...args) {
  if (__Setting["debugLogger.logInnerDetails"]) return f(...args);
}

// src/rulesLibrary.ts
var rulesLibrary_exports = {};
__export(rulesLibrary_exports, {
  Int: () => Int,
  __Setting: () => __Setting,
  alwaysNegative: () => alwaysNegative,
  alwaysPositive: () => alwaysPositive,
  maximum: () => maximum,
  minimum: () => minimum,
  onlyTheClassAndSubCanRead: () => onlyTheClassAndSubCanRead,
  onlyTheClassAndSubCanWrite: () => onlyTheClassAndSubCanWrite,
  onlyTheClassCanRead: () => onlyTheClassCanRead,
  onlyTheClassCanWrite: () => onlyTheClassCanWrite,
  stringExcludes: () => stringExcludes,
  stringRequires: () => stringRequires
});
var Int = (onError) => $conditionalWrite(
  "Error",
  [(_, __, v) => !v.toString().includes(".")],
  [
    (_, __, v, o) => onError ? {
      approached: true,
      output: typeof onError == "function" ? onError(v, o) : typeof onError == "number" ? onError : {
        ceil: Math.ceil(v),
        floor: Math.floor(v),
        round: Math.round(v)
      }[onError]
    } : false
  ]
);
var alwaysPositive = $conditionalWrite("Warn", [(thisArg, key, v) => v > 0]);
var alwaysNegative = $conditionalWrite("Warn", [(thisArg, key, v) => v < 0]);
var minimum = (min, allowEqual = true) => $conditionalWrite(
  "ignore",
  [
    (_, __, v) => allowEqual ? typeof v == "number" ? Math.min(v, Number(min)) == min : v >= min : typeof v == "number" ? Math.min(v, Number(min)) == min && v !== Number(min) : v > min
  ],
  [
    () => {
      return {
        approached: true,
        output: min
      };
    }
  ]
);
var maximum = (max, allowEqual = true) => $conditionalWrite(
  "ignore",
  [
    (_, __, v) => allowEqual ? typeof v == "number" ? Math.max(v, Number(max)) == max : v <= max : typeof v == "number" ? Math.max(v, Number(max)) == max && v !== Number(max) : v < max
  ],
  [
    () => {
      return {
        approached: true,
        output: max
      };
    }
  ]
);
var stringExcludes = (patten, replace) => $conditionalWrite(
  "Warn",
  [
    (_, __, value) => typeof value == "string" && !patten.some((pat) => typeof pat === "string" ? value.includes(pat) : pat.test(value))
  ],
  [(_, __, v) => replace ? !patten.some((pat) => v.replace(pat, replace)) : false]
);
var stringRequires = (...patten) => $conditionalWrite("Warn", [
  (_, __, value) => typeof value == "string" && patten.every((pat) => typeof pat == "string" ? value.includes(pat) : pat.test(value))
]);
var onlyTheClassCanRead = (thisClass) => $conditionalRead("Error", [
  (thisArg) => thisArg instanceof thisClass && Object.getPrototypeOf(thisArg) === thisClass.prototype
]);
var onlyTheClassCanWrite = (thisClass) => $conditionalWrite("Error", [
  (thisArg) => thisArg instanceof thisClass && Object.getPrototypeOf(thisArg) === thisClass.prototype
]);
var onlyTheClassAndSubCanWrite = (thisClass) => $conditionalWrite("Error", [(thisArg) => thisArg instanceof thisClass]);
var onlyTheClassAndSubCanRead = (thisClass) => $conditionalRead("Error", [(thisArg) => thisArg instanceof thisClass]);

// src/extraLibraries/valueRecorder.ts
var recordStorage = /* @__PURE__ */ new WeakMap();
var valueRecorder;
((valueRecorder2) => {
  valueRecorder2.$recordThis = (maxSteps = 10) => {
    return $setter((thisArg, key, value) => {
      if (!recordStorage.get(thisArg)) {
        recordStorage.set(thisArg, {});
      }
      const storage = recordStorage.get(thisArg);
      if (!storage[key]) {
        storage[key] = {
          recordList: [],
          redoStack: [],
          trigger: false
        };
      }
      if (storage[key].trigger) {
        storage[key].trigger = false;
        return value;
      }
      const currentValue = thisArg[key];
      const history = storage[key];
      console.log(String(key) + " history", history);
      history.recordList.push(currentValue);
      if (history.recordList.length > maxSteps) {
        history.recordList.shift();
      }
      history.redoStack = [];
      return value;
    });
  };
  function undo(target, key) {
    const storage = recordStorage.get(target);
    if (!storage) return false;
    const history = storage[key];
    if (!history || history.recordList.length === 0) return false;
    const currentValue = target[key];
    const lastValue = history.recordList.pop();
    history.redoStack.push(currentValue);
    storage[key].trigger = true;
    debugLogger(console.log, "[undo] " + String(key) + " history", history);
    target[key] = lastValue;
    return true;
  }
  valueRecorder2.undo = undo;
  function redo(target, key) {
    const storage = recordStorage.get(target);
    if (!storage) return false;
    const history = storage[key];
    if (!history || history.redoStack.length === 0) return false;
    const nextValue = history.redoStack.pop();
    history.recordList.push(target[key]);
    storage[key].trigger = true;
    debugLogger(console.log, "[redo] " + String(key) + " history", history);
    target[key] = nextValue;
    return true;
  }
  valueRecorder2.redo = redo;
})(valueRecorder || (valueRecorder = {}));

// src/rulerDecorators.ts
var instanceStorage = /* @__PURE__ */ new WeakMap();
var wrapperCache = /* @__PURE__ */ new WeakMap();
var setterHandlers = /* @__PURE__ */ new WeakMap();
var getterHandlers = /* @__PURE__ */ new WeakMap();
function $addSetterHandler(target, propertyKey, handler) {
  let handlersMap = setterHandlers.get(target);
  if (!handlersMap) {
    handlersMap = /* @__PURE__ */ new Map();
    setterHandlers.set(target, handlersMap);
  }
  let handlers = handlersMap.get(propertyKey);
  if (!handlers) {
    handlers = [];
    handlersMap.set(propertyKey, handlers);
  }
  handlers.push(handler);
}
function $addGetterHandler(target, propertyKey, handler) {
  let handlersMap = getterHandlers.get(target);
  if (!handlersMap) {
    handlersMap = /* @__PURE__ */ new Map();
    getterHandlers.set(target, handlersMap);
  }
  let handlers = handlersMap.get(propertyKey);
  if (!handlers) {
    handlers = [];
    handlersMap.set(propertyKey, handlers);
  }
  handlers.push(handler);
}
function $removeSetterHandler(target, propertyKey, handler) {
  const handlersMap = setterHandlers.get(target);
  if (!handlersMap) return false;
  const handlers = handlersMap.get(propertyKey);
  if (!handlers) return false;
  const index = handlers.indexOf(handler);
  if (index === -1) return false;
  handlers.splice(index, 1);
  return true;
}
function $removeGetterHandler(target, propertyKey, handler) {
  const handlersMap = getterHandlers.get(target);
  if (!handlersMap) return false;
  const handlers = handlersMap.get(propertyKey);
  if (!handlers) return false;
  const index = handlers.indexOf(handler);
  if (index === -1) return false;
  handlers.splice(index, 1);
  return true;
}
var $$init = (initialSetters = [], initialGetters = []) => {
  return function(target, propertyKey, descriptor) {
    debugLogger(console.log, "$$init decorator applied to:", target?.name || target, propertyKey, descriptor);
    const initStorage = (t) => !instanceStorage.has(t) && instanceStorage.set(t, {});
    initStorage(target);
    if (typeof target === "function" && target.prototype) {
      initStorage(target.prototype);
    }
    const initHandlers = (map, t) => !map.has(t) && map.set(t, /* @__PURE__ */ new Map());
    initHandlers(setterHandlers, target);
    initHandlers(getterHandlers, target);
    if (typeof target === "function" && target.prototype) {
      initHandlers(setterHandlers, target.prototype);
      initHandlers(getterHandlers, target.prototype);
    }
    if (typeof propertyKey === "undefined") {
      if (typeof target === "function" && target.prototype) {
        return class extends target {
          constructor(...args) {
            super(...args);
            debugLogger(console.log, "Decorated class constructor called");
            const instance = {};
            instanceStorage.set(this, instance);
            const settersMap2 = setterHandlers.get(target.prototype) || /* @__PURE__ */ new Map();
            for (const [key2, handlers] of settersMap2.entries()) {
              const initialValue = this[key2];
              debugLogger(
                console.log,
                `Processing decorated property ${String(key2)} with initial value:`,
                initialValue
              );
              const processed = handlers.reduce((val, handler) => {
                const result = handler(this, key2, val, val, 0, handlers);
                debugLogger(console.log, `Handler for ${String(key2)} processed value:`, val, "=>", result);
                return result;
              }, initialValue);
              instance[key2] = processed;
              debugLogger(console.log, `Final value for ${String(key2)}:`, processed);
            }
            debugLogger(console.log, "Instance fully initialized with decorated values:", instance);
          }
        };
      }
      return target;
    }
    const key = propertyKey;
    const targetObj = target;
    let settersMap = setterHandlers.get(targetObj);
    if (!settersMap) {
      settersMap = /* @__PURE__ */ new Map();
      setterHandlers.set(targetObj, settersMap);
    }
    if (!settersMap.has(key)) settersMap.set(key, [...initialSetters]);
    let gettersMap = getterHandlers.get(targetObj);
    if (!gettersMap) {
      gettersMap = /* @__PURE__ */ new Map();
      getterHandlers.set(targetObj, gettersMap);
    }
    if (!gettersMap.has(key)) gettersMap.set(key, [...initialGetters]);
    if (!instanceStorage.has(targetObj)) {
      instanceStorage.set(targetObj, {});
    }
    const protoStore = instanceStorage.get(targetObj);
    if (descriptor) {
      if ("value" in descriptor) {
        protoStore[key] = descriptor.value;
      } else if ("get" in descriptor || "set" in descriptor) {
        protoStore[key] = descriptor;
      }
    }
    return {
      configurable: true,
      enumerable: descriptor ? descriptor.enumerable : true,
      // 统一的 setter 处理
      set(value) {
        debugLogger(console.log, "Setter triggered for", key, "with value", value);
        let objStore = instanceStorage.get(this);
        if (!objStore) {
          objStore = {};
          instanceStorage.set(this, objStore);
        }
        const setters = setterHandlers.get(targetObj)?.get(key) || [];
        const result = setters.reduce(
          (prev, handler, idx, arr) => {
            const newVal = handler(this, key, value, prev, idx, [...arr]);
            debugLogger(console.log, `Handler ${idx} processed value:`, newVal);
            return newVal;
          },
          value
          // 初始值使用传入的value
        );
        objStore[key] = result;
        debugLogger(console.log, "Final stored value:", result);
        debugLogger(console.log, "Stored in value:", instanceStorage.get(this));
        const wrapperMap = wrapperCache.get(this);
        if (wrapperMap) {
          delete wrapperMap[key];
        }
      },
      // 统一的 getter 处理
      get() {
        const getters = getterHandlers.get(targetObj)?.get(key) || [];
        let baseValue;
        const objStore = instanceStorage.get(this) || {};
        if (key in objStore) {
          baseValue = objStore[key];
        } else {
          const protoStore2 = instanceStorage.get(targetObj) || {};
          baseValue = protoStore2[key];
        }
        if (typeof baseValue === "function") {
          let wrapperMap = wrapperCache.get(this);
          if (!wrapperMap) {
            wrapperMap = {};
            wrapperCache.set(this, wrapperMap);
          }
          if (!wrapperMap[key]) {
            wrapperMap[key] = function(...args) {
              let result = baseValue.apply(this, args);
              return getters.reduce(
                (prev, handler, idx, arr) => handler(this, key, this, prev, idx, [...arr]),
                result
              );
            };
          }
          return wrapperMap[key];
        }
        return getters.reduce(
          (prev, handler, idx, arr) => handler(this, key, this[key], prev, idx, [...arr]),
          baseValue
        );
      }
    };
  };
};
function $setter(handle) {
  return function(target, attr, descriptor) {
    $addSetterHandler(target, attr, function(thisArg, key, value, lastResult, index, handlers) {
      return handle(thisArg, key, value, lastResult, index, handlers);
    });
  };
}
function $getter(handle) {
  return function(target, attr, descriptor) {
    $addGetterHandler(target, attr, function(thisArg, key, value, lastResult, index, handlers) {
      return handle(thisArg, key, value, lastResult, index, handlers);
    });
  };
}
var $conditionalWrite = (errorType, conditionHandles, rejectHandlers) => {
  return $setter((thisArg, key, newVal, lastResult, index, handlers) => {
    const handlersArray = [...conditionHandles];
    const callResult = handlersArray.reduce(
      (lastProcess, handler, idx, arr) => {
        const r = handler(thisArg, key, newVal, lastProcess, idx, conditionHandles);
        return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
      },
      { approached: false, output: lastResult }
    );
    if (callResult.approached) return callResult.output;
    if (rejectHandlers?.length) {
      const rejectHandlersArray = [...rejectHandlers];
      const rejectResult = rejectHandlersArray.reduce(
        (lastProcess, handler, idx, arr) => {
          const r = handler(thisArg, key, newVal, callResult, lastProcess, idx, rejectHandlers);
          return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
        },
        {
          approached: true,
          output: lastResult
        }
      );
      if (rejectResult.approached) return rejectResult.output;
      const warningMsg = `Property '${String(key)}' write rejected. Final output: ${JSON.stringify(rejectResult.output)}`;
      switch (errorType || __Setting["$conditionalWR.defaultErrorType"]) {
        case "Warn":
          console.warn(`\u26A0\uFE0F ${warningMsg}`);
          break;
        case "Error":
          throw new Error(`\u{1F6AB} ${warningMsg}`);
      }
    }
    return thisArg[key];
  });
};
var $conditionalRead = (errorType, conditionHandles, rejectHandlers) => {
  return $getter((thisArg, key, value, lastResult, index, handlers) => {
    const handlersArray = [...conditionHandles];
    const callResult = handlersArray.reduce(
      (lastProcess, handler, idx, arr) => {
        const r = handler(thisArg, key, value, lastProcess, idx, conditionHandles);
        return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
      },
      { approached: false, output: lastResult }
    );
    if (callResult.approached) return callResult.output;
    if (rejectHandlers?.length) {
      const rejectHandlersArray = [...rejectHandlers];
      const rejectResult = rejectHandlersArray.reduce(
        (lastProcess, handler, idx, arr) => {
          const r = handler(thisArg, key, value, callResult, lastProcess, idx, rejectHandlers);
          return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
        },
        {
          approached: true,
          output: lastResult
        }
      );
      if (rejectResult.approached) return rejectResult.output;
      const warningMsg = `Property '${String(key)}' read rejected. Final output: ${JSON.stringify(rejectResult.output)}`;
      switch (errorType || __Setting["$conditionalWR.defaultErrorType"]) {
        case "Warn":
          console.warn(`\u26A0\uFE0F ${warningMsg}`);
          break;
        case "Error":
          throw new Error(`\u{1F6AB} ${warningMsg}`);
      }
    }
    return void 0;
  });
};
export {
  $$init,
  $addGetterHandler,
  $addSetterHandler,
  $conditionalRead,
  $conditionalWrite,
  $getter,
  $removeGetterHandler,
  $removeSetterHandler,
  $setter,
  rulesLibrary_exports as rulerDecorators,
  valueRecorder
};
