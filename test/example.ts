import { instanceStorage, rulerDecorators, setterHandlers, wrapperCache } from "../src/rulerDecorators";

class test {
    @rulerDecorators.alwaysPositive
    num;
    @rulerDecorators.Int()
    int;
    constructor() {
        this.num = -1;
        this.int = 0.2;
    }
}
let t = new test();
console.log(t);
t.num = -1;
t.int = 0.2;
console.log(t);
console.log("Setter handlers:", setterHandlers.get(test.prototype));
console.log("instanceStorage handlers:", instanceStorage.get(test.prototype));
console.log("wrapperCache handlers:", wrapperCache.get(test.prototype));
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
