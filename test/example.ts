import { $$init, $conditionalRead, $conditionalWrite, $setter, rulerDecorators } from "../src/rulerDecorators";

rulerDecorators.__Setting.dev();
class test {
    // @$$init()
    // proxyed = 0;
    @$$init()
    @rulerDecorators.minimum(100)
    num = -10;
    @$$init()
    @rulerDecorators.Int("ceil")
    int = -22;
    @$$init()
    @rulerDecorators.stringExcludes("250")
    str = "default";
    @$$init()
    @$conditionalWrite<number>("ignore", [
        (_: any, __: string | symbol, ___: number) => {
            return { approached: false, output: "ospos" + ___ };
        },
        (_, __, ___, p) => {
            return {
                approached: true,
                output: p.output,
            };
        },
    ])
    a: number = 0;
    @$$init()
    @$setter((a, b, c, d, e, g) => {})
    b: number = 0;

    constructor() {
        // this.proxyed = 5;
        this.num = -1;
        this.int = 0.2;
        this.str = "250250";
    }
}
let t = new test();
console.log(t);
// t.proxyed = 10;
t.num = -5;
t.int = 0.2;
console.log(t);
// console.log(t.proxyed);

// console.log("Setter handlers:", setterHandlers.get(test.prototype));
// console.log("instanceStorage handlers:", instanceStorage.get(test.prototype));
// console.log("wrapperCache handlers:", wrapperCache.get(test.prototype));

console.log("______________");
console.log(t.int);
console.log(t.str);
console.log(t.num);
console.log(t.a);
// @ts-ignore
t.a = "##@dgd";
console.log(t.a);

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
