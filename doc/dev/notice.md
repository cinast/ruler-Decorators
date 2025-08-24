# $$init 初始化函数

自动布置驱动函数对或者代理
注册完句柄，万事大吉

# 驱动模式&操作拦截模式

目前只有两种驱动模式`assessor`和`proxy`

还有 4 种操作拦截模式：

-   class-proxy (默认)
    监控整个对象，并且代管所有属性（含属性的属性）的操作句柄
    调用的时候直接去看它的 rd 描述符的 str/gtr 或者 proxy trap

-   property-proxy (显式配置)
    监控整个属性，并且代管所有属性（含属性的属性）的操作句柄
    调用的时候直接去看它的 rd 描述符的 str/gtr 或者 proxy trap
    比较常用于数组/对象，也可以用于监控方法的调用
    _你别忘了这是 proxy，他的 trap 太强大了_

-   accessor (默认)
    魔改的普通 gtr/str 对
    问注册的描述符，然后取函数调用

-   function-param-accessor（针对函数属性的默认）
    用于函数调用前的预处理，主要是过滤参数
    用的是 value 套 callback，预处理再 call

# 装饰器类型与模式对应关系

（没有写显式就是不必要显式写上 mode 参数）

-   **ClassDecorator**:

    -   class-proxy (默认)

-   **PropertyDecorator**:

    -   property-proxy (显式配置)

    -   accessor (默认)

    -   function-param-accessor（针对函数属性的默认）

-   **MethodDecorator**:

    -   function-param-accessor (默认)

-   **ParameterDecorator**:
    -   暂时不打算

# notice 注意事项

1.  永远不要用`target[key]`，  
    能用函数提供的`value`就用`value`  
    不然轻者性能差点要死~~（除非你有什么别的要求）~~（← 有也别想）
    重者调用栈溢出，祭祖都没用。

2.  你要记住，这里是类型检查管不到的地方。

3.  你怎么能在属性描述符里面用 this 呢
4.  描述符有`get/set`就没有`value`，  
    ES 说的。

5.  无论干什么也不要往原来的属性上面搞，  
    因为已经被魔改了，那个属性已经不是原来的属性了  
    尽管他很像。  
    你需要我提供的魔改变量。
6.  你拿到的属性不一定有描述符，他可能刚刚被定义

7.  不要套太多好函数工厂

8.  你不要妄想两种模式一块用

9.  JS 是 JS，RD 是 RD  
    ~~RD 是 JS 的超集~~（我没这么说过）
