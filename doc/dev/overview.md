# tree of `src/`

-   [moduleMeta.ts](../../src/moduleMeta.ts) ~~模组内全局配置~~ 也许现在是 rd 的单独配置  
    `->exported at rulerDecorators`  
    `was imported everywhere`
-   [rulerDecorators.ts](../../src/rulerDecorators.ts) 核心&库入口  
    `entrance -> *out*`
-   [rulesLibrary.ts](../../src/rulesLibrary.ts) 规则内置库
    `->exported as rulerDecorators at rulerDecorators.ts -> *out*`
-   [type.handles.ts](../../src/type.handles.ts)句柄类型定义
-   [utils.ts](../../src/utils.ts) 杂项
-   `extraLibraries/`
    -   [extraMod.router](../../src/extraLibraries/extraMod.router.ts) 额外模组导入路由器  
        `->exported -> *out*`
    -   [rulerDecorators.extend.router](../../src/extraLibraries/rulerDecorators.extend.router.ts) 内置规则库扩展路由器  
        `->imported at ../rulesLibrary`
    -   [valueRecorder.ts](../../src/extraLibraries/valueRecorder.ts) 扩展示例  
        `->imported at extraMod.router`

**_注意_**

1. 如果你想做自己的 rulerDecorators 派生库，  
   要在`extraMod`处登记。

2. 如果你没有给自己的库加上令名空间或者`as`，这意味着你导出到了 rulerDecorators 库的公共令名空间  
   除非你想直接扩展 rd 原有的内置内容  
   否则不建议

3. 如果你想直接扩展的话，更建议的是从`rulerDecorators.extend.router`导入，  
   而且会和内置规则库共用令名空间  
   有更好的语义
