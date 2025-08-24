[file content begin]

# 项目结构概述

## 核心文件

### 1. [rulerDecorators.ts](../../src/rulerDecorators.ts)

-   库的核心入口点
-   包含主要装饰器工厂和类型定义
-   导出所有公共 API

### 2. [rulesLibrary.ts](../../src/rulesLibrary.ts)

-   内置规则库
-   包含常用的验证和转换规则
-   作为 `rulerDecorators` 命名空间导出

### 3. [type.handles.ts](../../src/type.handles.ts)

-   句柄类型定义
-   定义一阶和二阶处理器类型

### 4. [utils.ts](../../src/utils.ts)

-   工具函数
-   装饰器类型检测、模式选择等辅助功能

### 5. [manage.ts](../../src/manage.ts)

-   存储管理功能
-   描述符和值的存储、检索操作
-   代理创建和访问器拦截实现

## 扩展库结构

### extraLibraries/

-   **[extraMod.router.ts](../../src/extraLibraries/extraMod.router.ts)**

    -   额外模块导入路由器
    -   导出到主库的公共命名空间

-   **[rulerDecorators.extend.router.ts](../../src/extraLibraries/rulerDecorators.extend.router.ts)**

    -   内置规则库扩展路由器
    -   与内置规则库共用命名空间

-   **[valueRecorder.ts](../../src/extraLibraries/valueRecorder.ts)**
    -   值记录器扩展
    -   提供撤销/重做功能

## 配置和元数据

### [moduleMeta.ts](../../src/moduleMeta.ts)

-   模块全局配置
-   包含库的设置和默认值

### [api.test.ts](../../src/api.test.ts)

-   测试工具函数
-   调试日志记录功能

## 开发指南

### 1. 创建自定义规则

```typescript
import { $setter, $conditionalWrite } from "./rulerDecorators";

// 简单规则
export const customRule = $setter((target, key, value) => {
    // 处理逻辑
    return processedValue;
});

// 条件规则
export const customConditionalRule = $conditionalWrite(
    "Warn",
    [
        (target, key, value, prevResult) => {
            // 条件检查
            return conditionResult;
        },
    ],
    [
        (target, key, value, conditionResult, prevResult) => {
            // 拒绝处理
            return fallbackValue;
        },
    ]
);
```

### 2. 扩展内置规则库

通过 `rulerDecorators.extend.router.ts` 添加新规则：

```typescript
// 在扩展路由器中添加
export const newRule = $conditionalWrite(/* ... */);

// 会自动合并到内置规则库中
```

### 3. 创建独立扩展模块

通过 `extraMod.router.ts` 注册独立扩展：

```typescript
// 创建独立模块
export const myExtension = {
    customRule,
    otherFunction,
};

// 在 extraMod.router.ts 中注册
export * as myExtension from "./myExtension";
```

## 最佳实践

1. **命名空间管理**

    - 直接扩展内置库：使用 `rulerDecorators.extend.router.ts`
    - 独立扩展：使用 `extraMod.router.ts` 并指定命名空间

2. **类型安全**

    - 为自定义规则提供明确的类型参数
    - 使用 TypeScript 泛型增强类型推断

3. **性能优化**

    - 避免过深的处理链
    - 使用合适的拦截模式
    - 利用 \_\_Setting 进行配置优化

4. **调试维护**
    - 使用 debugLogger 记录关键操作
    - 为复杂规则添加详细注释
    - 编写单元测试验证行为
      [file content end]

## [file name]: getting_started.md

[file content begin]

# 快速开始指南

## 安装

```bash
npm install ruler-decorators
# 或
yarn add ruler-decorators
```

## 基本用法

### 1. 启用库功能

```typescript
import { rulerDecorators } from "ruler-decorators";

// 启用所有设置（推荐）
rulerDecorators.__Setting.godMod();
```

### 2. 基本属性验证

```typescript
import { $$init, rulerDecorators } from "ruler-decorators";

class Example {
    @$$init()
    @rulerDecorators.minimum(0)
    positiveNumber = 5;

    @$$init()
    @rulerDecorators.stringExcludes(["badword"])
    text = "hello";

    @$$init()
    @rulerDecorators.range(1, 100)
    percentage = 50;
}

const example = new Example();
example.positiveNumber = -10; // 自动修正为 0
example.text = "badword content"; // 自动过滤为 " content"
example.percentage = 150; // 自动修正为 100
```

### 3. 条件读写

```typescript
import { $$init, $conditionalWrite, $conditionalRead } from "ruler-decorators";

class Example {
    @$$init()
    @$conditionalWrite("Warn", [
        (obj, key, value) => value % 2 === 0, // 只允许偶数
    ])
    evenNumber = 2;

    @$$init()
    @$conditionalRead("Warn", [
        (obj, key, value) => value > 100, // 只允许读取大于100的值
    ])
    largeNumber = 50;
}

const example = new Example();
example.evenNumber = 3; // 警告，保持原值
console.log(example.largeNumber); // 警告，返回 100
```

### 4. 类代理模式

```typescript
import { $$init, $ClassProxy, rulerDecorators } from "ruler-decorators";

@$ClassProxy()
class Example {
    @$$init()
    @rulerDecorators.minimum(0)
    value = -5;

    constructor() {
        this.value = -10; // 自动修正为 0
    }
}

const example = new Example();
example.value = -15; // 自动修正为 0
```

### 5. 函数参数处理

```typescript
import { $$init, $paramChecker } from "ruler-decorators";

class Example {
    @$$init()
    @$paramChecker((obj, methodName, method, args, prevResult) => {
        // 将所有参数转换为正数
        const processedArgs = prevResult.output.map((arg) => (typeof arg === "number" ? Math.abs(arg) : arg));
        return { approached: true, output: processedArgs };
    })
    processNumbers(...numbers: number[]) {
        return numbers.map((n) => n * 2);
    }
}

const example = new Example();
const result = example.processNumbers(1, -2, 3); // 参数自动转换为 [1, 2, 3]
// result: [2, 4, 6]
```

### 6. 值记录器

```typescript
import { $$init, valueRecorder } from "ruler-decorators";

class Example {
    @$$init()
    @valueRecorder.$recordThis()
    value = 0;
}

const example = new Example();
example.value = 1;
example.value = 2;
example.value = 3;

valueRecorder.undo(example, "value"); // 回退到 2
valueRecorder.redo(example, "value"); // 重做到 3
```

## 高级用法

### 自定义规则

```typescript
import { $$init, $setter, $conditionalWrite } from "ruler-decorators";

// 简单自定义规则
export const doubleValue = $setter((target, key, value) => {
    return value * 2;
});

// 条件自定义规则
export const positiveOnly = $conditionalWrite(
    "Error",
    [(target, key, value) => value > 0],
    [
        (target, key, value, conditionResult) => 1, // 失败时返回 1
    ]
);

class Example {
    @$$init()
    @doubleValue
    @positiveOnly
    value = 1;
}

const example = new Example();
example.value = 5; // 10 (5 * 2)
example.value = -3; // 1 (修正为正值)
```

### 模式选择

```typescript
import { $$init } from "ruler-decorators";

class Example {
    // 显式指定模式
    @$$init("accessor")
    accessorValue = 1;

    @$$init("property-proxy")
    proxyValue = 2;

    @$$init("function-param-accessor")
    method() {
        // 方法实现
    }
}
```

## 配置选项

```typescript
import { __Setting } from "ruler-decorators";

// 禁用 Proxy 使用
__Setting["Optimize.$$init.disableUsingProxy"] = true;

// 设置默认模式
__Setting["Optimize.$$init.defaultMod"] = "accessor";

// 设置属性数量阈值
__Setting["Optimize.$$init.autoUseProxyWhenRuledKeysMoreThan"] = 5;

// 启用详细日志
__Setting["debugLogger.logInnerDetails"] = true;
```

## 故障排除

### 常见问题

1. **装饰器不生效**

    - 确保 `tsconfig.json` 中 `experimentalDecorators` 设为 `true`
    - 检查是否正确导入了装饰器

2. **Proxy 不支持的环境**

    - 库会自动回退到 accessor 模式
    - 可手动禁用 Proxy 使用

3. **类型错误**

    - 明确指定类型参数
    - 检查泛型约束

4. **性能问题**
    - 避免过长的处理链
    - 选择合适的拦截模式

### 调试技巧

```typescript
// 启用详细调试
import { debugLogger } from "ruler-decorators";
debugLogger(console.log, "Debug message", data);

// 检查存储状态
import { descriptorStorage, valueStorage } from "ruler-decorators";
console.log("Descriptors:", descriptorStorage.get(target));
console.log("Values:", valueStorage.get(target));
```
