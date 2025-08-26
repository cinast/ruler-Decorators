/**
 * 测试新的参数处理器调用链功能
 */

import { $$init } from "../src/rulerDecorators";

// 测试类
class TestClass {
    @$$init(
        "function-param-accessor",
        [
            // param1 的处理器链
            [
                // phase 1
                (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                    console.log(`Param1 - Phase 1: argIdx=${argIdx}, value=${args[argIdx]}`);
                    return { approached: false, output: prevResult.output };
                },
                // phase 2
                (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                    console.log(`Param1 - Phase 2: argIdx=${argIdx}, value=${args[argIdx]}`);
                    return { approached: false, output: prevResult.output };
                },
                // phase 3
                (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                    console.log(`Param1 - Phase 3: argIdx=${argIdx}, value=${args[argIdx]}`);
                    return {
                        approached: true,
                        output: prevResult.output.map((val, idx) => (idx === argIdx ? `processed_${val}` : val)),
                    };
                },
            ],
            // param2 的处理器链
            [
                // phase 1
                (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                    console.log(`Param2 - Phase 1: argIdx=${argIdx}, value=${args[argIdx]}`);
                    return { approached: false, output: prevResult.output };
                },
                // phase 2
                (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                    console.log(`Param2 - Phase 2: argIdx=${argIdx}, value=${args[argIdx]}`);
                    return {
                        approached: true,
                        output: prevResult.output.map((val, idx) => (idx === argIdx ? val * 2 : val)),
                    };
                },
            ],
        ],
        [
            // param1 的拒绝处理器链
            [
                (thisArg, methodName, method, argIdx, args, inputArgs, FilterLastOutput, prevResult, currentIndex, handlers) => {
                    console.log(`Param1 Reject - Phase 1: argIdx=${argIdx}`);
                    return { approached: false, output: prevResult.output };
                },
            ],
            // param2 的拒绝处理器链
            [
                (thisArg, methodName, method, argIdx, args, inputArgs, FilterLastOutput, prevResult, currentIndex, handlers) => {
                    console.log(`Param2 Reject - Phase 1: argIdx=${argIdx}`);
                    return { approached: false, output: prevResult.output };
                },
            ],
        ]
    )
    testMethod(param1: string, param2: number): string {
        return `Result: ${param1}, ${param2}`;
    }

    // 测试对象格式的处理器链
    @$$init("function-param-accessor", {
        0: [
            // 第一个参数的处理器
            (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                console.log(`Object Format - Param0: ${args[argIdx]}`);
                return {
                    approached: true,
                    output: prevResult.output.map((val, idx) => (idx === argIdx ? val.toUpperCase() : val)),
                };
            },
        ],
        2: [
            // 第三个参数的处理器
            (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                console.log(`Object Format - Param2: ${args[argIdx]}`);
                return {
                    approached: true,
                    output: prevResult.output.map((val, idx) => (idx === argIdx ? val + "_suffix" : val)),
                };
            },
        ],
    })
    testMethod2(param1: string, param2: number, param3: string): string {
        return `Result: ${param1}, ${param2}, ${param3}`;
    }
}

// 测试执行
const testInstance = new TestClass();

console.log("=== 测试数组格式的处理器链 ===");
const result1 = testInstance.testMethod("hello", 10);
console.log("Final Result:", result1);

console.log("\n=== 测试对象格式的处理器链 ===");
const result2 = testInstance.testMethod2("world", 20, "test");
console.log("Final Result:", result2);

// 测试空处理器链的情况
class EmptyTestClass {
    @$$init("function-param-accessor", [
        [], // param1 无处理器
        [
            // param2 有处理器
            (thisArg, methodName, method, argIdx, args, inputArgs, prevResult, currentIndex, handlers) => {
                return {
                    approached: true,
                    output: prevResult.output.map((val, idx) => (idx === argIdx ? val * 3 : val)),
                };
            },
        ],
    ])
    testMethod(param1: string, param2: number): string {
        return `Empty Test: ${param1}, ${param2}`;
    }
}

console.log("\n=== 测试空处理器链 ===");
const emptyTestInstance = new EmptyTestClass();
const result3 = emptyTestInstance.testMethod("test", 5);
console.log("Empty Test Result:", result3);
