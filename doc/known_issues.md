# Known Issues & Technical Limitations

## 🚨 WeakMap 存储方案

```ts
const storage = new WeakMap<any, any>();
// 耻辱 ↑
```

-   **问题**：不得不使用 WeakMap 来避免无限递归，这是技术现实下的妥协
-   **影响**：存储方式不够优雅，可能影响调试体验
-   **临时方案**：目前无更好替代方案，这是装饰器实现的常见模式

> _你不能让一个 setter 去设置自己_  
> _(property).descriptor.set = (v)=> (property) = v_  
> _你在想什么_

## 💥 装饰器叠加问题

-   **问题**：多个装饰器同时使用时可能互相覆盖原有的 get/set 方法
-   **重现步骤**：
    ```ts
    @decorator1
    @decorator2
    property = 0; // 可能只有最后一个装饰器生效
    ```
-   **临时方案**：暂时避免多个装饰器叠加使用，等待后续重构

## 🚧 初始化阻挡现象

-   **问题**：在某些情况下装饰器会阻挡属性的初始赋值
-   **示例**：
    ```ts
    @someDecorator
    value = 42; // 可能无法正确初始化
    ```
-   **临时方案**：@ts-ignore + Object.defineProperty

## 🔄 装饰器顺序问题

```ts
// 世纪笑话
setter → getter → getter → getter... (无限循环)
setter → setter → setter → setter... (无限循环)
setter → getter → setter → getter... (无限循环)
```

-   **问题**：装饰器应用顺序不当可能导致无限递归
-   **临时方案**：仔细设计装饰器逻辑，避免相互调用

## ⚠️ 其他注意事项

1. **TS 版本要求**：必须使用 TypeScript 5.2+
2. **配置要求**：必须启用`experimentalDecorators`
3. **调试困难**：装饰器代码调试较复杂

## 📅 计划修复

这些问题将在未来版本中逐步解决，当前版本请~~谨慎使用~~ **来人救我！**![cry, laugh and sense of embarrassment](img/捂脸哭笑.png)![cry, laugh and sense of embarrassment](img/捂脸哭笑.png)![cry, laugh and sense of embarrassment](img/捂脸哭笑.png)
