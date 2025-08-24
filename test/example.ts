import {
    processIt,
    descriptorStorage,
    $ClassProxy,
    $getter,
    $paramChecker,
    $PropertyProxy,
    valueStorage,
} from "./../src/rulerDecorators";
import {
    $$init,
    $conditionalRead,
    $conditionalWrite,
    $setter,
    getDescriptor,
    rulerDecorators,
    valueRecorder,
} from "../src/rulerDecorators";

rulerDecorators.__Setting.godMod();

// ==================== 1. 基础属性装饰器测试 ====================
console.log("\n1. 基础属性装饰器测试");

class BasicTest {
    @$$init()
    @rulerDecorators.minimum(-5)
    num = -10;

    @$$init()
    @rulerDecorators.alwaysPositive
    positive = -10;

    @$$init()
    @rulerDecorators.Int("ceil")
    int = -22.7;

    @$$init()
    @rulerDecorators.stringExcludes(["damn", "shit"])
    str = "default";

    @$$init()
    @rulerDecorators.range(0, 100)
    percentage = 50;

    @$$init()
    @rulerDecorators.oneOf(["active", "inactive", "pending"])
    status = "active";

    constructor() {
        console.log("BasicTest 构造函数调用");
    }
}

console.log("创建 BasicTest 实例...");
const basicTest = new BasicTest();
console.log("初始值:");
console.log("num:", basicTest.num, "预期被修正为 -5");
console.log("positive:", basicTest.positive, "预期 undef");
console.log("int:", basicTest.int, "预期被修正为 -22 (ceil)");
console.log("str:", basicTest.str, "预期保持不变");
console.log("percentage:", basicTest.percentage, "预期保持不变");
console.log("status:", basicTest.status, "预期保持不变");

// 测试赋值操作
console.log("\n测试赋值操作...");
basicTest.num = -20;
console.log("num = -20 ->", basicTest.num, "预期被修正为 -5");

basicTest.positive = -5;
console.log("positive = -5 ->", basicTest.positive, "预期 undef");

basicTest.int = 15.3;
console.log("int = 15.3 ->", basicTest.int, "预期被修正为 16 (ceil)");

basicTest.str = "this is damn good";
console.log("str = 'this is damn good' ->", basicTest.str, '预期被过滤为 "this is  good"（有两个空格，因为只是删除了"damn"）');

basicTest.percentage = 150;
console.log("percentage = 150 ->", basicTest.percentage, "预期被修正为 100");

basicTest.status = "invalid";
console.log("status = 'invalid' ->", basicTest.status, "预期变成active");

// ==================== 2. 条件读写装饰器测试 ====================
console.log("\n2. 条件读写装饰器测试");

class ConditionalTest {
    @$$init()
    @$conditionalWrite(
        "Error",
        [
            (obj, key, value) => value % 2 === 0, // 只允许偶数
        ],
        [
            (obj, key, value, conditionResult) => {
                console.log(`拒绝写入 ${value}，不是偶数`);
                return { approached: true, output: conditionResult.output + 1 }; // 自动修正为下一个奇数
            },
        ]
    )
    evenOnly: number = 0;

    @$$init()
    @$conditionalRead(
        "Warn",
        [
            (obj, key, value) => value > 100, // 只允许读取大于100的值
        ],
        [
            (obj, key, value, conditionResult) => {
                console.log(`拒绝读取 ${value}，值太小`);
                return { approached: true, output: 100 }; // 返回最小值
            },
        ]
    )
    readIfLarge: number = 50;

    constructor() {
        console.log("ConditionalTest 构造函数调用");
    }
}

console.log("创建 ConditionalTest 实例...");
const conditionalTest = new ConditionalTest();

// 测试条件写入
console.log("\n测试条件写入...");
conditionalTest.evenOnly = 4;
console.log("evenOnly = 4 ->", conditionalTest.evenOnly, "预期成功");

conditionalTest.evenOnly = 7;
console.log("evenOnly = 7 ->", conditionalTest.evenOnly, "预期被修正为 8");

// 测试条件读取
console.log("\n测试条件读取...");
console.log("readIfLarge (初始值 50) ->", conditionalTest.readIfLarge, "预期返回 100");

conditionalTest.readIfLarge = 150;
console.log("readIfLarge = 150 ->", conditionalTest.readIfLarge, "预期返回 150");

// ==================== 3. 类代理模式测试 ====================
console.log("\n3. 类代理模式测试");

@$ClassProxy()
class ClassProxyTest {
    @$$init()
    @rulerDecorators.minimum(0)
    nonNegative: number = -5;

    @$$init()
    @rulerDecorators.stringExcludes(["badword"])
    text: string = "hello";

    @$$init()
    dynamicValue: any = null;

    constructor() {
        console.log("ClassProxyTest 构造函数调用");
        this.nonNegative = -10; // 预期被修正为 0
    }

    // 普通方法
    getInfo() {
        return `nonNegative: ${this.nonNegative}, text: ${this.text}`;
    }
}

console.log("创建 ClassProxyTest 实例...");
const classProxyTest = new ClassProxyTest();
console.log("初始值:");
console.log("nonNegative:", classProxyTest.nonNegative, "预期被修正为 0");
console.log("text:", classProxyTest.text, "预期保持不变");

// 测试代理功能
console.log("\n测试代理功能...");
classProxyTest.nonNegative = -15;
console.log("nonNegative = -15 ->", classProxyTest.nonNegative, "预期被修正为 0");

classProxyTest.text = "this is a badword";
console.log("text = 'this is a badword' ->", classProxyTest.text, '预期被过滤为 "this is a"');

// 测试方法调用
console.log("\n测试方法调用...");
console.log("getInfo():", classProxyTest.getInfo());

// ==================== 4. 属性代理模式测试 ====================
console.log("\n4. 属性代理模式测试");

class PropertyProxyTest {
    @$$init("property-proxy")
    @$PropertyProxy()
    @rulerDecorators.range(1, 10)
    ratedValue: number = 5;

    @$$init()
    @rulerDecorators.alwaysPositive
    normalValue: number = -5;

    constructor() {
        console.log("PropertyProxyTest 构造函数调用");
    }
}

console.log("创建 PropertyProxyTest 实例...");
const propertyProxyTest = new PropertyProxyTest();
console.log("初始值:");
console.log("ratedValue:", propertyProxyTest.ratedValue, "预期保持不变");
console.log("normalValue:", propertyProxyTest.normalValue, "预期保持不变");

// 测试属性代理
console.log("\n测试属性代理...");
propertyProxyTest.ratedValue = 15;
console.log("ratedValue = 15 ->", propertyProxyTest.ratedValue, "预期被修正为 10");

propertyProxyTest.normalValue = -5;
console.log("normalValue = -5 ->", propertyProxyTest.normalValue, "预期被修正为 undef");

// ==================== 5. 方法参数装饰器测试 ====================
console.log("\n5. 方法参数装饰器测试");

class MethodParamTest {
    @$$init()
    values: number[] = [];

    @$$init()
    @$paramChecker(
        // 参数处理器 - 确保所有参数都是正数
        (obj, methodName, method, args, prevResult) => {
            const processedArgs = args.map((arg) => (typeof arg === "number" && arg < 0 ? Math.abs(arg) : arg));
            return { approached: true, output: processedArgs };
        },
        // 拒绝处理器 - 记录拒绝的参数
        (obj, methodName, method, args, conditionResult, prevResult) => {
            console.log(`方法 ${String(methodName)} 调用被拒绝，参数:`, args);
            return { approached: true, output: [] };
        }
    )
    addValues(...numbers: number[]): void {
        this.values.push(...numbers);
        console.log(`添加了值: ${numbers.join(", ")}`);
    }

    @$$init()
    @$paramChecker(
        // 参数处理器 - 确保参数是有效的百分比
        (obj, methodName, method, args, prevResult) => {
            if (args.length > 0 && typeof args[0] === "number") {
                const value = Math.max(0, Math.min(100, args[0]));
                return { approached: true, output: [value] };
            }
            return false;
        }
    )
    setPercentage(value: number): void {
        console.log(`设置百分比: ${value}%`);
    }

    constructor() {
        console.log("MethodParamTest 构造函数调用");
    }
}

console.log("创建 MethodParamTest 实例...");
const methodParamTest = new MethodParamTest();
// 测试方法参数处理
console.log("\n测试方法参数处理...");
methodParamTest.addValues(1, -2, 3, -4); // 负数预期被转为正数
console.log("values:", methodParamTest.values, "预期包含 [1, 2, 3, 4]");

methodParamTest.setPercentage(150); //"预期被修正为 100
methodParamTest.setPercentage(-50); // "预期被修正为 0

// ==================== 6. 自定义setter/getter测试 ====================
console.log("\n6. 自定义setter/getter测试");

class CustomAccessorTest {
    private _value: number = 0;

    @$$init()
    @$setter((obj, key, value) => {
        console.log(`设置 ${String(key)}: ${value}`);
        return value * 2; // 所有设置的值都翻倍
    })
    @$getter((obj, key, value) => {
        console.log(`获取 ${String(key)}: ${value}`);
        return value / 2; // 所有获取的值都减半
    })
    customValue: number = 10;

    @$$init()
    @$setter((obj, key, value) => {
        if (typeof value === "string") {
            return value.toUpperCase();
        }
        return value;
    })
    uppercaseText: string = "hello";

    constructor() {
        console.log("CustomAccessorTest 构造函数调用");
    }
}

console.log("创建 CustomAccessorTest 实例...");
const customAccessorTest = new CustomAccessorTest();
console.log("初始值:");
console.log("customValue:", customAccessorTest.customValue, "预期显示获取日志并返回 5");
console.log("uppercaseText:", customAccessorTest.uppercaseText, '预期显示 "hello"');

// 测试自定义访问器
console.log("\n测试自定义访问器...");
customAccessorTest.customValue = 20; // 预期显示设置日志并存储 40
console.log("customValue after set 20:", customAccessorTest.customValue, "预期显示获取日志并返回 20");

customAccessorTest.uppercaseText = "world";
console.log("uppercaseText after set 'world':", customAccessorTest.uppercaseText, '预期显示 "WORLD"');

// ==================== 7. 值记录器测试 ====================
console.log("\n7. 值记录器测试");

class ValueRecorderTest {
    @$$init()
    @valueRecorder.$recordThis()
    recordedValue: number = 0;

    @$$init()
    @valueRecorder.$recordThis(3)
    limitedHistory: number = 0;

    constructor() {
        console.log("ValueRecorderTest 构造函数调用");
    }
}

console.log("创建 ValueRecorderTest 实例...");
const valueRecorderTest = new ValueRecorderTest();

// 测试值记录器
console.log("\n测试值记录器...");
valueRecorderTest.recordedValue = 10;
valueRecorderTest.recordedValue = 20;
valueRecorderTest.recordedValue = 30;
valueRecorderTest.recordedValue = 40;

console.log("当前 recordedValue:", valueRecorderTest.recordedValue, "预期是 40");

// 测试撤销/重做
console.log("\n测试撤销操作...");
valueRecorder.undo(valueRecorderTest, "recordedValue");
console.log("撤销一次:", valueRecorderTest.recordedValue, "预期是 30");

valueRecorder.undo(valueRecorderTest, "recordedValue");
console.log("撤销两次:", valueRecorderTest.recordedValue, "预期是 20");

console.log("\n测试重做操作...");
valueRecorder.redo(valueRecorderTest, "recordedValue");
console.log("重做一次:", valueRecorderTest.recordedValue, "预期是 30");

valueRecorder.redo(valueRecorderTest, "recordedValue");
console.log("重做两次:", valueRecorderTest.recordedValue, "预期是 40");

// 测试有限历史
console.log("\n测试有限历史...");
valueRecorderTest.limitedHistory = 1;
valueRecorderTest.limitedHistory = 2;
valueRecorderTest.limitedHistory = 3;
valueRecorderTest.limitedHistory = 4; // 预期丢弃最早的历史记录

console.log("当前 limitedHistory:", valueRecorderTest.limitedHistory, "预期是 4");

valueRecorder.undo(valueRecorderTest, "limitedHistory");
console.log("撤销一次 limitedHistory:", valueRecorderTest.limitedHistory, "预期是 3");

valueRecorder.undo(valueRecorderTest, "limitedHistory");
console.log("撤销两次 limitedHistory:", valueRecorderTest.limitedHistory, "预期是 2");

valueRecorder.undo(valueRecorderTest, "limitedHistory");
console.log("撤销三次 limitedHistory:", valueRecorderTest.limitedHistory, "预期是 1 (历史记录已满)");

// ==================== 8. 混合模式测试 ====================
console.log("\n8. 混合模式测试");

@$ClassProxy()
class MixedModeTest {
    @$$init("property-proxy")
    @$PropertyProxy()
    @rulerDecorators.range(0, 100)
    @valueRecorder.$recordThis()
    proxiedValue: number = 50;

    @$$init()
    @rulerDecorators.alwaysPositive
    @$conditionalWrite("Warn", [(obj, key, value) => value < 1000])
    accessorValue: number = 100;

    @$$init()
    @$paramChecker((obj, methodName, method, args, prevResult) => {
        const processedArgs = args.map((arg) => (typeof arg === "number" ? Math.abs(arg) : arg));
        return { approached: true, output: processedArgs };
    })
    processData(...values: number[]): number[] {
        return values.map((v) => v * 2);
    }

    constructor() {
        console.log("MixedModeTest 构造函数调用");
    }
}

console.log("创建 MixedModeTest 实例...");
const mixedModeTest = new MixedModeTest();

// 测试混合模式
console.log("\n测试混合模式...");
mixedModeTest.proxiedValue = 150; // 预期被修正为 100
console.log("proxiedValue = 150 ->", mixedModeTest.proxiedValue, "预期是 100");

mixedModeTest.accessorValue = -50; // 预期被修正为 1
console.log("accessorValue = -50 ->", mixedModeTest.accessorValue, "预期是 100 (alwaysPositive条件写入拒绝)");

mixedModeTest.accessorValue = 2000; // 预期触发警告
console.log("accessorValue = 2000 ->", mixedModeTest.accessorValue, "预期是 100 (小于1000条件写入拒绝)");

console.log("proxiedValue", mixedModeTest.proxiedValue);
mixedModeTest.proxiedValue = 200; // 预期触发警告
console.log("proxiedValue = 200 ->", mixedModeTest.proxiedValue, "预期是 100 (小于1000条件写入拒绝)");
mixedModeTest.proxiedValue = 30;
console.log("proxiedValue = 30 ->", mixedModeTest.proxiedValue, "预期是 30 ");
mixedModeTest.proxiedValue = 50;
console.log("proxiedValue = 50 ->", mixedModeTest.proxiedValue, "预期是 50 ");
valueRecorder.undo(mixedModeTest, "proxiedValue");
console.log("proxiedValue undo", mixedModeTest.proxiedValue);
valueRecorder.undo(mixedModeTest, "proxiedValue");
console.log("proxiedValue undo", mixedModeTest.proxiedValue);

// 测试方法参数处理
console.log("\n测试方法参数处理...");
console.log(getDescriptor(mixedModeTest, "processData"));

const result = mixedModeTest.processData(5, -10, 15);
console.log("processData(5, -10, 15) ->", result, "预期是 [10, 20, 30]");

// ==================== 9. 存储系统检查 ====================
console.log("\n9. 存储系统检查");

console.log("检查 descriptorStorage...");
console.log("BasicTest 描述符:", descriptorStorage.get(BasicTest.prototype));
console.log("ClassProxyTest 描述符:", descriptorStorage.get(ClassProxyTest.prototype));

console.log("检查 valueStorage...");
console.log("ValueRecorderTest 值存储:", valueStorage.get(valueRecorderTest));

// ==================== 10. 性能测试 ====================
class pr0xytTest {
    @$$init("property-proxy", {
        set: [
            (t, k, v) => {
                switch (k) {
                    case "a":
                        return 9990;
                }
                return;
            },
        ],
    })
    obj = {
        a: 0,
    };
    @$$init("property-proxy", {
        set: [
            (t, k, v) => {
                v % 2 === 0 ? v : v * 2;
            },
        ],
    })
    arr = [1, 2, 4, 63, 2];
    constructor() {}
}

const proxyTest = new pr0xytTest();
console.log("proxyTest.arr", proxyTest.arr, "预期[2,2,4,126,2]");
console.log("proxyTest.obj", proxyTest.obj, "预期{a:9990}");

// ==================== 11. 性能测试 ====================
console.log("\n11. 性能测试");

class PerformanceTest {
    @$$init()
    @rulerDecorators.range(0, 1000)
    value: number = 500;

    constructor() {
        console.log("PerformanceTest 构造函数调用");
    }
}

console.log("创建 PerformanceTest 实例...");
const performanceTest = new PerformanceTest();

// 测试大量赋值操作
function performance(times: number) {
    console.log(`执行 ${times} 次赋值操作...`);
    const startTime = Date.now();

    for (let i = 0; i < times; i++) {
        performanceTest.value = Math.random() * 1500;
    }

    const endTime = Date.now();
    console.log(`完成 ${times} 次赋值操作，耗时: ${endTime - startTime}ms`);
}
performance(1e4);
performance(1e8);
console.log("\n=== 全方位测试完成 ===");
