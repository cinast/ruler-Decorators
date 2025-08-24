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

### 3. [type.ts](../../src/type.ts)

### 4. [type.handles.ts](../../src/type.handles.ts)

-   句柄类型定义
-   定义一阶和二阶处理器类型

### 5. [utils.ts](../../src/utils.ts)

-   工具函数
-   装饰器类型检测、模式选择等辅助功能

### 6. [manage.ts](../../src/manage.ts)

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
            // 回绝处理
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

> _参见内置额外模组 [valueRecorder](../../src/extraLibraries/valueRecorder.ts)_

通过 `extraMod.router.ts` 注册独立扩展：

```typescript
// ./myExtension.ts
// 创建独立模块
export namespace myExtension {
    customRule,
    otherFunction,
};
```

```typescript
// 在 extraMod.router.ts 中注册
export * as myExtension from "./myExtension";
```

## 最佳实践

1. **命名空间管理**

    - 直接扩展内置库：使用 `rulerDecorators.extend.router.ts`
    - 独立扩展：使用 `extraMod.router.ts` 并指定命名空间

2. **类型安全**

    - 为自定义规则提供明确的类型参数
    - ~~使用 TypeScript 泛型增强类型推断~~  
      做不到啊

3. **性能优化**

    - 避免过深的处理链
    - 使用合适的拦截模式
    - 利用 \_\_Setting 进行配置优化

4. **调试维护**
    - 使用 debugLogger 记录关键操作
    - 为复杂规则添加详细注释
    - 编写单元测试验证行为
