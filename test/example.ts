import { processIt, descriptorStorage } from "./../src/rulerDecorators";
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

let a = { num: 0 };
$$init("accessor", (t, k, v) => {
    console.log(v);
})(a, "num");
console.log(a);

class test {
    @$$init()
    @rulerDecorators.minimum(-5)
    num = -10;

    @$$init()
    @rulerDecorators.alwaysPositive
    positive = -10;

    @$$init()
    @rulerDecorators.Int("ceil")
    int = -22;

    @$$init()
    @rulerDecorators.stringExcludes(["damn"])
    str = "default";

    @$$init<number>()
    @$conditionalWrite<number>("ignore", [
        (_: any, __: string | symbol, ___: number) => {
            return { approached: false, output: "abcd" + ___ };
        },
        (_, __, ___, p) => {
            return {
                approached: true,
                output: p.output,
            };
        },
    ])
    typeCheater: number = 0;

    constructor() {
        this.int = 0.2;
        this.str = "damn";
    }
}
let t = new test();
let no_ = 0;
function logs() {
    no_++;
    console.log("_______ " + no_ + " _______");
    console.log("int: number (int)    ", t.int, typeof t.int);
    console.log("str: string          ", t.str, typeof t.str);
    console.log("num: number >= -5     ", t.num, typeof t.num);
    console.log("positive: number > 0 ", t.positive, typeof t.positive);
    console.log("typeCheater: number  ", t.typeCheater, typeof t.typeCheater);
}

console.log("initialed result");
logs();

t.int = 8.9;
t.num = -5;
t.positive = 9;
logs();

t.int = 6.1;
t.positive = -9;
logs();

console.log("type cheating test");
// @ts-ignore
t.typeCheater = "##@dgd";
logs();

console.log();
console.log("----test2----");
class test2 {
    @$$init()
    @valueRecorder.$recordThis()
    a: number = 0;
}
let t2 = new test2();
t2.a = 1;
console.log("t2.a", t2.a);
t2.a *= 2;
console.log("t2.a", t2.a);
t2.a *= 2;
console.log("t2.a", t2.a);

valueRecorder.undo(t2, "a");
console.log("undo t2.a", t2.a);
valueRecorder.undo(t2, "a");
console.log("undo t2.a", t2.a);
valueRecorder.undo(t2, "a");
console.log("undo t2.a", t2.a);
valueRecorder.undo(t2, "a");
console.log("undo t2.a", t2.a);
valueRecorder.undo(t2, "a");

console.log("redo t2.a", t2.a);
valueRecorder.redo(t2, "a");
console.log("redo t2.a", t2.a);
valueRecorder.redo(t2, "a");
console.log("redo t2.a", t2.a);
valueRecorder.redo(t2, "a");
console.log("redo t2.a", t2.a);
valueRecorder.redo(t2, "a");
console.log("redo t2.a", t2.a);
valueRecorder.redo(t2, "a");

valueRecorder.undo(t2, "a");
valueRecorder.undo(t2, "a");
console.log("undo*2 t2.a", t2.a);
t2.a = 100;
console.log("t2.a = 100", t2.a);
valueRecorder.redo(t2, "a");
console.log("try redo t2.a", t2.a);

// // class TestClass {
//     // Simplified approach: Use onlyTheClassCanWrite for write protection

//     @rulerDecorators.onlyTheClassCanRead(TestClass)
//     readOnlyProperty: number[];
//     constructor() {
//         this.readOnlyProperty = [0, 0, 3, 3];
//         console.log("In constructor, readOnlyProperty:", this.readOnlyProperty);
//     }

//     testAccess() {
//         console.log("Accessing from within class:", this.readOnlyProperty);
//     }
// }

// class ExternalClass {
//     accessProperty(obj: TestClass) {
//         console.log("Accessing from external class:", obj.readOnlyProperty);
//         console.log("try to change that property", obj.readOnlyProperty);
//         obj.readOnlyProperty = [0, 289289];
//         console.log("result", obj.readOnlyProperty);
//     }
// }

// console.log("Creating instance...");
// const test = new TestClass();
// test.testAccess();

// console.log("Accessing from external class...");
// const external = new ExternalClass();
// external.accessProperty(test);

// console.log("Accessing from outer scope...");
// test.readOnlyProperty = [0, 28, 390, 219];
// console.log("result", test.readOnlyProperty);

// console.log("Instance created, readOnlyProperty:", test.readOnlyProperty);
