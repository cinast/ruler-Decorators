var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/moduleMeta.ts
var thisSymbols = Symbol("rulerDecorators");
var __Setting = {
  veryStrict: false,
  "Optimize.$$init.autoUseProxyWhenRuledKeysMoreThan": 10n,
  "Optimize.$$init.defaultMod": "accessor",
  "Optimize.$$init.disableUsingProxy": false,
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

// src/utils.ts
var byTheWay = (re, doSth) => {
  doSth.forEach((f) => f(re));
  return re;
};
var processIt = (input, doSth) => doSth.reduce((p, f) => f(p));
function getDecoratorType(args) {
  if (typeof args[0] === "function") {
    return "ClassDecorator";
  }
  if (typeof args[2] === "object" && typeof args[0] === "object" && (typeof args[1] === "string" || typeof args[1] === "symbol")) {
    return "MethodDecorator";
  }
  if (typeof args[2] === void 0 || typeof args[0] === "object" && (typeof args[1] === "string" || typeof args[1] === "symbol")) {
    return "PropertyDecorator";
  }
  if (typeof args[2] === "number" && typeof args[0] === "object" && (typeof args[1] === "string" || typeof args[1] === "symbol")) {
    return "ParameterDecorator";
  }
  return "UNKNOWN";
}
function $defineProperty(props) {
  return function(target, attr, desc) {
    const whoIsThis = getDecoratorType([target, attr, desc]);
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const element = props[key];
        switch (whoIsThis) {
          case "ClassDecorator":
            if (typeof target === "function") {
              return class extends target {
                constructor(...args) {
                  super(...args);
                  Object.defineProperty(this, key, element);
                }
              };
            } else {
              Object.defineProperty(target, key, element);
              return target;
            }
          case "PropertyDecorator":
            Object.defineProperty(target, key, element);
            break;
          case "MethodDecorator":
            if (desc) {
              return Object.assign({}, desc, element);
            }
            break;
        }
      }
    }
    if (whoIsThis === "MethodDecorator" && desc) {
      return desc;
    }
    return void 0;
  };
}
function isModeCompatible(decoratorType, mode) {
  const compatibility = {
    ClassDecorator: ["class-proxy", "accessor"],
    PropertyDecorator: ["property-proxy", "accessor"],
    MethodDecorator: ["function-param-accessor", "accessor"],
    ParameterDecorator: []
    // 暂不支持
  };
  return compatibility[decoratorType].includes(mode);
}
function rd_executeModeSelector(decoratorType, target, propertiesWithRuleApplied) {
  if (__Setting["Optimize.$$init.disableUsingProxy"]) {
    return "accessor";
  }
  if (typeof Proxy === "undefined") {
    return "accessor";
  }
  switch (decoratorType) {
    case "ClassDecorator":
      return __Setting["Optimize.$$init.disableUsingProxy"] ? "accessor" : "class-proxy";
    case "MethodDecorator":
      return "function-param-accessor";
  }
  if (target instanceof Array) {
    return __Setting["Optimize.$$init.disableUsingProxy"] ? "accessor" : "property-proxy";
  }
  const threshold = __Setting["Optimize.$$init.autoUseProxyWhenRuledKeysMoreThan"];
  if (propertiesWithRuleApplied > threshold) {
    return "property-proxy";
  }
  return __Setting["Optimize.$$init.defaultMod"] == "proxy" ? "property-proxy" : "accessor";
}

// src/api.test.ts
function debugLogger(f, ...args) {
  if (__Setting["debugLogger.logInnerDetails"]) return f(...args);
}
function $debugger(logArgs = false, ...debuggers) {
  if (!__Setting["$debug.allowUsing"]) return;
  const shouldLogArgs = typeof logArgs === "boolean" ? logArgs : false;
  const debugHandlers = typeof logArgs === "boolean" ? debuggers : [logArgs, ...debuggers].filter(Boolean);
  return function(...args) {
    if (__Setting["$debug.enableLog"] && shouldLogArgs) {
      console.log(`\u{1F6A8} ${getDecoratorType(args)} decorator arguments:`);
      console.log(args);
    }
    if (__Setting["$debug.debugger"]) debugger;
    if (__Setting["$debug.callHandles"])
      debugHandlers.forEach((debug, i) => {
        try {
          if (typeof debug === "string" && __Setting["$debug.enableLog"]) console.log(`\u{1F4E2} ${debug}`);
          else if (typeof debug === "function" && __Setting["$debug.callHandles"]) {
            const result = debug(...args);
            if (__Setting["$debug.enableLog"])
              console.log({
                index: `${i}`,
                message: `\u{1F4E2} Debugger result: ${result}`
              });
          }
        } catch (e) {
          if (__Setting["$debug.enableWarn"]) console.error(`\u26A0\uFE0F Debug handler[${i}] error:`, e);
        }
      });
    switch (args.length) {
      case 1:
        return class extends args[0] {
        };
      case 2:
        return;
      case 3:
        if (typeof args[2] === "number") {
          return;
        } else {
          return args[2];
        }
      default:
        console.warn("\u26A0\uFE0F Unsupported decorator signature", args);
        return;
    }
  };
}
function useTest() {
}

// src/manage.ts
function $markPropertyAsClassProxyManaged(target, propertyKey) {
  const descriptor = getDescriptor(target, propertyKey);
  descriptor.managedByClassProxy = true;
  descriptor.propertyMode = "proxy";
  setDescriptor(target, propertyKey, descriptor);
}
function isPropertyManagedByClassProxy(target, propertyKey) {
  const descriptor = getDescriptor(target, propertyKey);
  return !!descriptor.managedByClassProxy;
}
function hasHandlersFor(target, propertyKey) {
  const descriptor = getDescriptor(target, propertyKey);
  const hasSetter = Boolean(descriptor.setters?.length);
  const hasGetter = Boolean(descriptor.getters?.length);
  const hasParam = Boolean(descriptor.paramHandlers?.length);
  return hasSetter || hasGetter || hasParam;
}
function setDescriptor(target, propertyKey, descriptor) {
  const targetMap = getOrCreateTargetMap(target);
  targetMap.set(propertyKey, descriptor);
}
function hasDescriptors(target) {
  const targetMap = descriptorStorage.get(target);
  return !!targetMap && targetMap.size > 0;
}
function getAllDescriptors(target) {
  return descriptorStorage.get(target);
}
function getDescriptor(target, propertyKey) {
  const targetMap = getOrCreateTargetMap(target);
  let descriptor = targetMap.get(propertyKey);
  if (!descriptor) {
    descriptor = {
      interceptionEnabled: true,
      interceptionModes: "accessor",
      setters: [],
      getters: []
    };
    targetMap.set(propertyKey, descriptor);
  }
  return descriptor;
}
function getDecoratedPropertyCount(target) {
  if (!target) return 0;
  const targetMap = descriptorStorage.get(target);
  if (!targetMap) return 0;
  let count = 0;
  for (const descriptor of targetMap.values()) {
    if (descriptor.setters?.length || descriptor.getters?.length) {
      count++;
    }
  }
  return count;
}
function getPropertyModes(target) {
  const targetMap = descriptorStorage.get(target);
  if (!targetMap) {
    return /* @__PURE__ */ new Map();
  }
  const modes = /* @__PURE__ */ new Map();
  for (const [propertyKey, descriptor] of targetMap.entries()) {
    if (descriptor.propertyMode) {
      modes.set(propertyKey, descriptor.propertyMode);
    }
  }
  return modes;
}
function getOrCreateTargetMap(target) {
  let targetMap = descriptorStorage.get(target);
  if (!targetMap) {
    targetMap = /* @__PURE__ */ new Map();
    descriptorStorage.set(target, targetMap);
  }
  return targetMap;
}
function createAccessorInterception(instance, targetPrototype) {
  const handlerProperties = /* @__PURE__ */ new Set();
  const targetMap = descriptorStorage.get(targetPrototype);
  if (targetMap) {
    for (const [propertyKey, descriptor] of targetMap.entries()) {
      if (descriptor.setters?.length || descriptor.getters?.length) {
        handlerProperties.add(propertyKey);
      }
    }
  }
  for (const propertyKey of handlerProperties) {
    let value = $applySetterHandlers(instance, propertyKey, instance[propertyKey]);
    Object.defineProperty(instance, propertyKey, {
      get: () => {
        debugLogger(console.log, "Accessor getter triggered for", propertyKey);
        return $applyGetterHandlers(instance, propertyKey, value);
      },
      set: (newValue) => {
        debugLogger(console.log, "Accessor setter triggered for", propertyKey, "with value", newValue);
        value = $applySetterHandlers(instance, propertyKey, newValue);
      },
      enumerable: true,
      configurable: true
    });
  }
  return instance;
}
function createPropertyProxy(instance, prototype) {
  const allDescriptors = getAllDescriptors(prototype);
  if (allDescriptors) {
    for (const descriptor of allDescriptors.values()) {
      if (descriptor.proxyInstance === instance) {
        return descriptor.originalInstance;
      }
      if (descriptor.originalInstance === instance) {
        return descriptor.proxyInstance;
      }
    }
  }
  const proxy = new Proxy(instance, {
    get(target, propertyKey, receiver) {
      const descriptor = getDescriptor(prototype, propertyKey);
      if (descriptor.propertyMode === "proxy") {
        debugLogger(console.log, "Property Proxy getter triggered for", propertyKey);
        let value = Reflect.get(target, propertyKey, receiver);
        return $applyGetterHandlers(receiver, propertyKey, value);
      }
      return Reflect.get(target, propertyKey, receiver);
    },
    set(target, propertyKey, value, receiver) {
      const descriptor = getDescriptor(prototype, propertyKey);
      if (descriptor.propertyMode === "proxy") {
        debugLogger(console.log, "Property Proxy setter triggered for", propertyKey, "with value", value);
        const processedValue = $applySetterHandlers(receiver, propertyKey, value);
        return Reflect.set(target, propertyKey, processedValue, receiver);
      }
      return Reflect.set(target, propertyKey, value, receiver);
    }
  });
  const targetMap = descriptorStorage.get(prototype);
  if (targetMap) {
    for (const [propertyKey, descriptor] of targetMap.entries()) {
      if (descriptor.propertyMode === "accessor") {
        let value = instance[propertyKey];
        Object.defineProperty(proxy, propertyKey, {
          get: () => {
            debugLogger(console.log, "Accessor getter triggered for", propertyKey);
            return $applyGetterHandlers(proxy, propertyKey, value);
          },
          set: (newValue) => {
            debugLogger(console.log, "Accessor setter triggered for", propertyKey, "with value", newValue);
            value = $applySetterHandlers(proxy, propertyKey, newValue);
          },
          enumerable: true,
          configurable: true
        });
      }
      descriptor.proxyInstance = proxy;
      descriptor.originalInstance = instance;
      targetMap.set(propertyKey, descriptor);
    }
  }
  return proxy;
}
function createClassProxy(instance, prototype) {
  const allDescriptors = getAllDescriptors(prototype);
  if (allDescriptors) {
    for (const descriptor of allDescriptors.values()) {
      if (descriptor.proxyInstance === instance) {
        return descriptor.originalInstance;
      }
      if (descriptor.originalInstance === instance) {
        return descriptor.proxyInstance;
      }
    }
  }
  const proxy = new Proxy(instance, {
    get(target, propertyKey, receiver) {
      debugLogger(console.log, "Class Proxy getter triggered for", propertyKey);
      let value = Reflect.get(target, propertyKey, receiver);
      const descriptor = getDescriptor(prototype, propertyKey);
      const getters = descriptor.getters || [];
      if (getters.length > 0) {
        value = getters.reduce(
          (prev, handler, idx, arr) => handler(prev, value, receiver, propertyKey, { index: idx, handlers: [...arr] }),
          value
        );
      }
      if (typeof value === "function") {
        return value.bind(receiver);
      }
      return value;
    },
    set(target, propertyKey, value, receiver) {
      debugLogger(console.log, "Class Proxy setter triggered for", propertyKey, "with value", value);
      let processedValue = value;
      const descriptor = getDescriptor(prototype, propertyKey);
      const setters = descriptor.setters || [];
      if (setters.length > 0) {
        processedValue = setters.reduce(
          (prev, handler, idx, arr) => handler(prev, value, receiver, propertyKey, { index: idx, handlers: [...arr] }),
          value
        );
      }
      return Reflect.set(target, propertyKey, processedValue, receiver);
    }
  });
  const targetMap = descriptorStorage.get(prototype);
  if (targetMap) {
    for (const [propertyKey, descriptor] of targetMap.entries()) {
      descriptor.proxyInstance = proxy;
      descriptor.originalInstance = instance;
      targetMap.set(propertyKey, descriptor);
    }
  }
  return proxy;
}
function $addSetterHandler(target, propertyKey, handler) {
  const descriptor = getDescriptor(target, propertyKey);
  descriptor.setters = [...descriptor.setters || [], handler];
  setDescriptor(target, propertyKey, descriptor);
}
function $addGetterHandler(target, propertyKey, handler) {
  const descriptor = getDescriptor(target, propertyKey);
  descriptor.getters = [...descriptor.getters || [], handler];
  setDescriptor(target, propertyKey, descriptor);
}
function $removeSetterHandler(target, propertyKey, handler) {
  const descriptor = getDescriptor(target, propertyKey);
  if (!descriptor.setters || descriptor.setters.length === 0) return false;
  const index = descriptor.setters.indexOf(handler);
  if (index === -1) return false;
  descriptor.setters.splice(index, 1);
  setDescriptor(target, propertyKey, descriptor);
  return true;
}
function $removeGetterHandler(target, propertyKey, handler) {
  const descriptor = getDescriptor(target, propertyKey);
  if (!descriptor.getters || descriptor.getters.length === 0) return false;
  const index = descriptor.getters.indexOf(handler);
  if (index === -1) return false;
  descriptor.getters.splice(index, 1);
  setDescriptor(target, propertyKey, descriptor);
  return true;
}
function $addParamHandler(target, methodKey, handlerOrHandlers) {
  const descriptor = getDescriptor(target, methodKey);
  if (Array.isArray(handlerOrHandlers) && Array.isArray(handlerOrHandlers[0])) {
    const wrapper = createParamWrapperFilter(handlerOrHandlers);
    descriptor.paramHandlers = [...descriptor.paramHandlers || [], wrapper];
  } else if (typeof handlerOrHandlers === "object" && !Array.isArray(handlerOrHandlers)) {
    const wrapper = createParamWrapperFilter(handlerOrHandlers);
    descriptor.paramHandlers = [...descriptor.paramHandlers || [], wrapper];
  } else {
    descriptor.paramHandlers = [...descriptor.paramHandlers || [], handlerOrHandlers];
  }
  setDescriptor(target, methodKey, descriptor);
}
function $addParamRejectionHandler(target, methodKey, handlerOrHandlers) {
  const descriptor = getDescriptor(target, methodKey);
  if (!descriptor.paramRejectHandlers) {
    descriptor.paramRejectHandlers = [];
  }
  const isHandlerChain = Array.isArray(handlerOrHandlers) && Array.isArray(handlerOrHandlers[0]) || typeof handlerOrHandlers === "object" && !Array.isArray(handlerOrHandlers);
  if (isHandlerChain) {
    const wrapper = createParamWrapperReject(handlerOrHandlers);
    descriptor.paramRejectHandlers.push(wrapper);
  } else {
    descriptor.paramRejectHandlers.push(handlerOrHandlers);
  }
  setDescriptor(target, methodKey, descriptor);
}
function $applyGetterHandlers(receiver, propertyKey, value) {
  const descriptor = getDescriptor(receiver, propertyKey);
  const getters = descriptor.getters || [];
  if (getters.length === 0) return value;
  return getters.reduce(
    (prev, handler, idx, arr) => handler(prev, value, receiver, propertyKey, { index: idx, handlers: [...arr] }),
    value
  );
}
function $applySetterHandlers(receiver, propertyKey, value) {
  const descriptor = getDescriptor(receiver, propertyKey);
  const setters = descriptor.setters || [];
  if (setters.length === 0) return value;
  return setters.reduce(
    (prev, handler, idx, arr) => handler(prev, value, receiver, propertyKey, { index: idx, handlers: arr }),
    value
  );
}
function $applyParamHandlers(receiver, methodKey, method, args) {
  const descriptor = getDescriptor(receiver, methodKey);
  const paramHandlers = descriptor.paramHandlers || [];
  if (paramHandlers.length === 0)
    return {
      approached: false,
      output: args
    };
  try {
    const result = paramHandlers.reduce(
      (prev, handler, idx, arr) => {
        const r = handler(
          prev,
          args,
          { this: receiver, methodName: methodKey, method },
          { currentIndex: idx, handlers: [...arr] }
        );
        return typeof r === "boolean" ? {
          approached: r,
          output: prev.output
        } : r;
      },
      {
        approached: false,
        output: args
      }
    );
    return result;
  } catch (error) {
    debugLogger(console.error, "Parameter handler error for method", methodKey, ":", error);
    return {
      approached: false,
      output: args
    };
  }
}
function $applyParamRejectionHandlers(receiver, methodKey, method, args, FilterLastOutput) {
  const descriptor = getDescriptor(receiver, methodKey);
  const rejectHandlers = descriptor.paramRejectHandlers || [];
  if (rejectHandlers.length === 0)
    return {
      approached: false,
      output: args
    };
  try {
    const result = rejectHandlers.reduce(
      (prev, handler, idx, arr) => {
        const r = handler(
          prev,
          FilterLastOutput,
          args,
          { this: receiver, methodName: methodKey, method },
          { currentIndex: idx, handlers: [...arr] }
        );
        return typeof r === "boolean" ? {
          approached: r,
          output: prev.output
        } : r;
      },
      {
        approached: false,
        output: args
      }
    );
    return result;
  } catch (error) {
    debugLogger(console.error, "Parameter reject handler error for method", methodKey, ":", error);
    return {
      approached: false,
      output: args
    };
  }
}
var createParamWrapperFilter = (handlerChain) => {
  let paramsChain = [];
  if (Array.isArray(handlerChain)) {
    paramsChain = [...handlerChain];
  } else {
    const maxIndex = Math.max(...Object.keys(handlerChain).map(Number));
    paramsChain = Array(maxIndex + 1).fill(void 0);
    for (const [indexStr, handlers] of Object.entries(handlerChain)) {
      const index = Number(indexStr);
      paramsChain[index] = handlers;
    }
  }
  return function(prevResult, args, thisInfo, pipeInfo) {
    let processedArgs = [...prevResult.output];
    let anyApproached = false;
    for (let argIdx = 0; argIdx < paramsChain.length; argIdx++) {
      const chain = paramsChain[argIdx];
      if (!chain || chain.length === 0) continue;
      const result = chain.reduce(
        (prev, handler, handlerIndex, handlerArray) => {
          const r = handler(
            prev,
            args[argIdx],
            {
              argIdx,
              args,
              inputArgs: prevResult.output
            },
            thisInfo,
            pipeInfo
          );
          return typeof r === "boolean" ? { approached: r, output: prev.output } : r;
        },
        { approached: false, output: processedArgs[argIdx] }
      );
      processedArgs[argIdx] = result.output;
      if (result.approached) {
        anyApproached = true;
      }
    }
    return {
      approached: anyApproached,
      output: processedArgs
    };
  };
};
var createParamWrapperReject = (handlerChain) => {
  let paramsChain = [];
  if (Array.isArray(handlerChain)) {
    paramsChain = [...handlerChain];
  } else {
    const maxIndex = Math.max(...Object.keys(handlerChain).map(Number));
    paramsChain = Array(maxIndex + 1).fill(void 0);
    for (const [indexStr, handlers] of Object.entries(handlerChain)) {
      const index = Number(indexStr);
      paramsChain[index] = handlers;
    }
  }
  return function(prevResult, FilterLastOutput, args, thisInfo, pipeInfo) {
    let processedArgs = [...prevResult.output];
    let anyApproached = false;
    for (let argIdx = 0; argIdx < paramsChain.length; argIdx++) {
      const chain = paramsChain[argIdx];
      if (!chain || chain.length === 0) continue;
      const result = chain.reduce(
        (prev, handler, handlerIndex, handlerArray) => {
          const r = handler(
            prev,
            FilterLastOutput,
            args[argIdx],
            {
              argIdx,
              args,
              inputArgs: prevResult.output
            },
            thisInfo,
            pipeInfo
          );
          return typeof r === "boolean" ? { approached: r, output: prev.output } : r;
        },
        { approached: false, output: processedArgs[argIdx] }
      );
      processedArgs[argIdx] = result.output;
      if (result.approached) {
        anyApproached = true;
      }
    }
    return {
      approached: anyApproached,
      output: processedArgs
    };
  };
};

// src/rulesLibrary.ts
var rulesLibrary_exports = {};
__export(rulesLibrary_exports, {
  Int: () => Int,
  __Setting: () => __Setting,
  alwaysNegative: () => alwaysNegative,
  alwaysPositive: () => alwaysPositive,
  auto: () => auto,
  iAgreeAboutThat: () => iAgreeAboutThat,
  maximum: () => maximum,
  minimum: () => minimum,
  oneOf: () => oneOf,
  onlyTheClassAndSubCanRead: () => onlyTheClassAndSubCanRead,
  onlyTheClassAndSubCanWrite: () => onlyTheClassAndSubCanWrite,
  onlyTheClassCanRead: () => onlyTheClassCanRead,
  onlyTheClassCanWrite: () => onlyTheClassCanWrite,
  passThat: () => passThat,
  range: () => range,
  stringExcludes: () => stringExcludes,
  stringRequires: () => stringRequires,
  watchSet: () => watchSet
});
var iAgreeAboutThat = (out) => (...args) => {
  return out ? true : {
    approached: true,
    output: out
  };
};
var passThat = (out) => {
  return {
    approached: true,
    output: out
  };
};
var auto = (handler, ...args) => $setter((_, __, v) => handler(v));
var watchSet = (handle) => $setter((lastResult, value, target, attr, pipeInfo) => {
  handle(target, attr, value, lastResult, pipeInfo);
  return value;
});
var Int = (onError) => $conditionalWrite(
  "Error",
  [(p) => !p.output.toString().includes(".")],
  [
    (p, fr) => onError ? {
      approached: true,
      output: typeof onError == "function" ? onError(p.output, fr) : typeof onError == "number" ? onError : {
        ceil: Math.ceil(p.output),
        floor: Math.floor(p.output),
        round: Math.round(p.output)
      }[onError]
    } : false
  ]
);
var alwaysPositive = $conditionalWrite("Warn", [(p) => p.output > 0]);
var alwaysNegative = $conditionalWrite("Warn", [(p) => p.output < 0]);
var minimum = (min, allowEqual = true) => $conditionalWrite(
  "ignore",
  [
    (p) => byTheWay(p, [(g) => console.log("\u2139\uFE0F catches", g)]),
    (p) => {
      const v = p.output;
      return allowEqual ? typeof v == "number" ? v >= Number(min) : v >= min : typeof v == "number" ? v > Number(min) : v > min;
    }
  ],
  [
    (p, fr) => {
      return { approached: true, output: min };
    }
  ]
);
var maximum = (max, allowEqual = true) => $conditionalWrite(
  "ignore",
  [
    (p) => {
      const v = p.output;
      return allowEqual ? typeof v == "number" ? Math.max(v, Number(max)) == max : v <= max : typeof v == "number" ? Math.max(v, Number(max)) == max && p.output !== Number(max) : v < max;
    }
  ],
  [iAgreeAboutThat(max)]
);
var range = (min, max) => $conditionalWrite("ignore", [(p) => passThat(Math.min(Math.max(p.output, min), max))]);
var stringExcludes = (patten, replace = "") => $conditionalWrite(
  "Warn",
  [
    (p) => typeof p.output == "string" && !patten.some((pat) => typeof pat === "string" ? p.output.includes(pat) : pat.test(p.output))
  ],
  [
    (p, fr) => {
      if (typeof p.output === "string") {
        let result = p.output;
        for (const pattern of patten) {
          if (typeof pattern === "string") {
            result = result.replace(new RegExp(pattern, "g"), replace);
          } else {
            result = result.replace(pattern, replace);
          }
        }
        return { approached: true, output: result };
      }
      return false;
    }
  ]
);
var stringRequires = (...patten) => $conditionalWrite("Warn", [
  (p) => typeof p.output == "string" && patten.every((pat) => typeof pat == "string" ? p.output.includes(pat) : pat.test(p.output))
]);
var oneOf = (list) => $conditionalWrite("Warn", [(p) => list.includes(p.output)]);
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
    return $setter((lastResult, value, target, key, pipeInfo) => {
      if (!recordStorage.get(target)) {
        recordStorage.set(target, {});
      }
      const storage = recordStorage.get(target);
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
      const currentValue = target[key];
      const history = storage[key];
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
var descriptorStorage = /* @__PURE__ */ new WeakMap();
var valueStorage = /* @__PURE__ */ new WeakMap();
if (typeof Proxy === "undefined") {
  console.warn("This environment don't suppose Proxy");
  __Setting["Optimize.$$init.disableUsingProxy"] = true;
  __Setting["Optimize.$$init.defaultMod"] = "accessor";
}
function $$init(...args) {
  return function(target, propertyKey, descriptor) {
    debugLogger(console.log, "$$init decorator applied to:", target?.name || target, propertyKey, descriptor);
    if (!descriptorStorage.has(target)) descriptorStorage.set(target, /* @__PURE__ */ new Map());
    if (typeof target === "function" && target.prototype && !descriptorStorage.has(target.prototype)) {
      descriptorStorage.set(target.prototype, /* @__PURE__ */ new Map());
    }
    const whoIsThisDecorator = getDecoratorType([target, propertyKey, descriptor]);
    debugLogger(console.log, "detectedDecoratorType:", whoIsThisDecorator);
    if (whoIsThisDecorator === "UNKNOWN") throw "rulerDecorators now not suppose this kind of Decorator";
    const [interceptionMode, handlers] = args.length === 0 ? [
      rd_executeModeSelector(
        whoIsThisDecorator,
        target,
        getDecoratedPropertyCount(target)
      ),
      []
    ] : typeof args[0] === "string" ? [args[0], args.slice(1)] : [
      rd_executeModeSelector(
        whoIsThisDecorator,
        target,
        getDecoratedPropertyCount(target)
      ),
      args
    ];
    const driveMod = interceptionMode === "accessor" || interceptionMode === "function-param-accessor" ? "accessor" : "proxy";
    const key = propertyKey;
    const targetObj = target;
    const rdDescriptor = getDescriptor(targetObj, key);
    switch (whoIsThisDecorator) {
      case "ClassDecorator":
        rdDescriptor.interceptionModes = interceptionMode;
        setDescriptor(targetObj, key, rdDescriptor);
        return typeof target === "function" && target.prototype ? class extends target {
          constructor(...args2) {
            super(...args2);
            const targetMap = descriptorStorage.get(target.prototype);
            if (targetMap) {
              for (const propertyKey2 of targetMap.keys()) {
                $markPropertyAsClassProxyManaged(target.prototype, propertyKey2);
              }
            }
            if (driveMod === "proxy") {
              return createClassProxy(this, target.prototype);
            } else {
              return createAccessorInterception(this, target.prototype);
            }
          }
        } : target;
      case "PropertyDecorator":
        rdDescriptor.interceptionModes = interceptionMode;
        setDescriptor(targetObj, key, rdDescriptor);
        const classProxyDescriptor = getDescriptor(targetObj, Symbol.for("ClassProxy"));
        if (classProxyDescriptor.ClassProxyEnabled) {
          $markPropertyAsClassProxyManaged(targetObj, key);
        }
        switch (driveMod) {
          case "accessor":
            rdDescriptor.setters = [
              ...rdDescriptor.setters || [],
              ...handlers.length > 0 ? handlers[0] : []
            ];
            rdDescriptor.getters = [
              ...rdDescriptor.getters || [],
              ...handlers.length > 1 ? handlers[1] : []
            ];
            if (!classProxyDescriptor.ClassProxyEnabled) {
              if (!valueStorage.has(targetObj)) {
                valueStorage.set(targetObj, /* @__PURE__ */ new Map());
              }
              const valueMap = valueStorage.get(targetObj);
              if (descriptor && descriptor.value !== void 0) {
                valueMap.set(key, descriptor.value);
              } else if (!valueMap.has(key)) {
                valueMap.set(key, void 0);
              }
              $defineProperty({
                [key]: {
                  get() {
                    const value = valueMap.get(key);
                    return $applyGetterHandlers(target, key, value);
                  },
                  set(value) {
                    const processedValue = $applySetterHandlers(target, key, value);
                    valueMap.set(key, processedValue);
                  },
                  enumerable: true,
                  configurable: true
                }
              })(targetObj, key);
            }
            break;
          case "proxy":
            const propertyModes = getPropertyModes(targetObj);
            propertyModes.set(key, "proxy");
            if (descriptor) {
              return descriptor;
            }
            break;
        }
        break;
      case "MethodDecorator":
        rdDescriptor.interceptionModes = "function-param-accessor";
        if (handlers.length > 0) {
          const paramHandler = handlers[0];
          const is2DArray = Array.isArray(paramHandler) && Array.isArray(paramHandler[0]);
          const isRecordFormat = typeof paramHandler === "object" && !Array.isArray(paramHandler);
          if (is2DArray || isRecordFormat) {
            const wrapper = createParamWrapperFilter(paramHandler);
            rdDescriptor.paramHandlers = [...rdDescriptor.paramHandlers || [], wrapper];
          } else if (Array.isArray(paramHandler)) {
            rdDescriptor.paramHandlers = [...rdDescriptor.paramHandlers || [], ...paramHandler];
          } else {
            rdDescriptor.paramHandlers = [...rdDescriptor.paramHandlers || [], paramHandler];
          }
        }
        if (handlers.length > 1) {
          const paramRejectHandler = handlers[1];
          const is2DArray = Array.isArray(paramRejectHandler) && Array.isArray(paramRejectHandler[0]);
          const isRecordFormat = typeof paramRejectHandler === "object" && !Array.isArray(paramRejectHandler);
          if (is2DArray || isRecordFormat) {
            const wrapper = createParamWrapperReject(paramRejectHandler);
            rdDescriptor.paramRejectHandlers = [...rdDescriptor.paramRejectHandlers || [], wrapper];
          } else if (Array.isArray(paramRejectHandler)) {
            rdDescriptor.paramRejectHandlers = [...rdDescriptor.paramRejectHandlers || [], ...paramRejectHandler];
          } else {
            rdDescriptor.paramRejectHandlers = [
              ...rdDescriptor.paramRejectHandlers || [],
              paramRejectHandler
            ];
          }
        }
        setDescriptor(targetObj, key, rdDescriptor);
        if (descriptor) {
          if (typeof descriptor.value === "function") {
            const originalMethod = descriptor.value;
            descriptor.value = function(...args2) {
              const processedArgs = $applyParamHandlers(target, key, originalMethod, args2);
              if (processedArgs.approached) return originalMethod.apply(target, processedArgs.output);
              const rejectResult = $applyParamRejectionHandlers(target, key, originalMethod, args2, processedArgs);
              if (rejectResult.approached) return rejectResult.output;
              const warningMsg = `Call method '$${String(key)}' rejected. Final output: ${JSON.stringify(
                rejectResult.output
              )},the function will not be called.`;
              throw new Error(`\u{1F6AB} ${warningMsg}`);
            };
            return descriptor;
          } else if (typeof descriptor.get === "function" || typeof descriptor.set === "function") {
            console.warn("Parameter decorators are not supported on accessors (getters/setters)");
            return descriptor;
          } else {
            console.warn("Method decorator applied to non-method property");
            return descriptor;
          }
        }
        break;
      case "ParameterDecorator":
        throw "rulerDecorators now not suppose ParameterDecorator";
    }
    return descriptor;
  };
}
function $ClassProxy() {
  return function(target) {
    const prototype = target.prototype;
    const descriptor = getDescriptor(prototype, Symbol.for("ClassProxy"));
    descriptor.ClassProxyEnabled = true;
    setDescriptor(prototype, Symbol.for("ClassProxy"), descriptor);
    return class extends target {
      constructor(...args) {
        super(...args);
        const targetMap = descriptorStorage.get(prototype);
        if (targetMap) {
          for (const propertyKey of targetMap.keys()) {
            $markPropertyAsClassProxyManaged(prototype, propertyKey);
          }
        }
        return createClassProxy(this, prototype);
      }
    };
  };
}
function $PropertyProxy() {
  return function(target, propertyKey) {
    const classProxyDescriptor = getDescriptor(target, Symbol.for("ClassProxy"));
    if (classProxyDescriptor.ClassProxyEnabled) {
      $markPropertyAsClassProxyManaged(target, propertyKey);
    } else {
      const propertyModes = getPropertyModes(target);
      propertyModes.set(propertyKey, "proxy");
    }
  };
}
function $setter(handle) {
  return function(target, attr, descriptor) {
    $addSetterHandler(target, attr, function(lastResult, value, target2, key, pipeInfo) {
      return handle(lastResult, value, target2, key, pipeInfo);
    });
  };
}
function $getter(handle) {
  return function(target, attr, descriptor) {
    $addGetterHandler(target, attr, function(lastResult, value, target2, key, pipeInfo) {
      return handle(lastResult, value, target2, key, pipeInfo);
    });
  };
}
function $paramChecker(handle, rejectHandle) {
  return function(target, methodKey, descriptor) {
    $addParamHandler(target, methodKey, function(lastResult, args, thisInfo, pipeInfo) {
      return handle(lastResult, args, thisInfo, pipeInfo);
    });
    if (rejectHandle) {
      $addParamRejectionHandler(target, methodKey, function(lastResult, FilterLastOutput, args, thisInfo, pipeInfo) {
        return rejectHandle(lastResult, FilterLastOutput, args, thisInfo, pipeInfo);
      });
    }
  };
}
var $conditionalWrite = (errorType, conditionHandles, rejectHandlers) => {
  return $setter((lastResult, value, target, key, pipeInfo) => {
    const handlersArray = [...conditionHandles];
    const FilterLastOutput = handlersArray.reduce(
      (lastProcess, handler, idx, arr) => {
        const r = handler(lastProcess, value, target, key, { currentIndex: idx, handlers: arr });
        return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
      },
      { approached: false, output: lastResult }
    );
    if (FilterLastOutput.approached) return FilterLastOutput.output;
    if (rejectHandlers?.length) {
      const rejectHandlersArray = [...rejectHandlers];
      const rejectResult = rejectHandlersArray.reduce(
        (lastProcess, handler, idx, arr) => {
          const r = handler(lastProcess, FilterLastOutput, value, target, key, { currentIndex: idx, handlers: arr });
          return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
        },
        {
          approached: false,
          output: lastResult
        }
      );
      if (rejectResult.approached) return rejectResult.output;
      const warningMsg = `Property '${String(key)}' write rejected. Final output: ${JSON.stringify(
        rejectResult.output
      )}, and the value keep still.`;
      switch (errorType || __Setting["$conditionalWR.defaultErrorType"]) {
        case "Warn":
          console.warn(`\u26A0\uFE0F ${warningMsg}`);
          break;
        case "Error":
          throw new Error(`\u{1F6AB} ${warningMsg}`);
      }
    }
    return target[key];
  });
};
var $conditionalRead = (errorType, conditionHandles, rejectHandlers) => {
  return $getter((lastResult, value, target, key, pipeInfo) => {
    const handlersArray = [...conditionHandles];
    const FilterLastOutput = handlersArray.reduce(
      (lastProcess, handler, idx, arr) => {
        const r = handler(lastProcess, value, target, key, { currentIndex: idx, handlers: arr });
        return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
      },
      { approached: false, output: lastResult }
    );
    if (FilterLastOutput.approached) return FilterLastOutput.output;
    if (rejectHandlers?.length) {
      const rejectHandlersArray = [...rejectHandlers];
      const rejectResult = rejectHandlersArray.reduce(
        (lastProcess, handler, idx, arr) => {
          const r = handler(lastProcess, FilterLastOutput, value, target, key, { currentIndex: idx, handlers: arr });
          return typeof r === "boolean" ? { approached: r, output: lastProcess.output } : r;
        },
        {
          approached: false,
          output: lastResult
        }
      );
      if (rejectResult.approached) return rejectResult.output;
      const warningMsg = `Property '${String(key)}' read rejected. Final output: ${JSON.stringify(
        rejectResult.output
      )}, this rule return nothing.`;
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
  $ClassProxy,
  $PropertyProxy,
  $addGetterHandler,
  $addParamHandler,
  $addParamRejectionHandler,
  $addSetterHandler,
  $applyGetterHandlers,
  $applyParamHandlers,
  $applyParamRejectionHandlers,
  $applySetterHandlers,
  $conditionalRead,
  $conditionalWrite,
  $debugger,
  $defineProperty,
  $getter,
  $markPropertyAsClassProxyManaged,
  $paramChecker,
  $removeGetterHandler,
  $removeSetterHandler,
  $setter,
  byTheWay,
  createAccessorInterception,
  createClassProxy,
  createParamWrapperFilter,
  createParamWrapperReject,
  createPropertyProxy,
  debugLogger,
  descriptorStorage,
  getAllDescriptors,
  getDecoratedPropertyCount,
  getDecoratorType,
  getDescriptor,
  getOrCreateTargetMap,
  getPropertyModes,
  hasDescriptors,
  hasHandlersFor,
  isModeCompatible,
  isPropertyManagedByClassProxy,
  processIt,
  rd_executeModeSelector,
  rulesLibrary_exports as rulerDecorators,
  setDescriptor,
  useTest,
  valueRecorder,
  valueStorage
};
