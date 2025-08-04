import { rulerDecorators, $debugger } from "./rulerDecorators";

class TestClass {
    // Use onlyTheClassCanWrite to allow the class to write, but we'll handle read protection separately
    @rulerDecorators.onlyTheClassCanRead(TestClass)
    @rulerDecorators.onlyTheClassCanWrite(TestClass)
    readOnlyProperty: number[];

    constructor() {
        this.readOnlyProperty = [0, 0, 3, 3];
        console.log("In constructor, readOnlyProperty:", this.readOnlyProperty);
    }

    testAccess() {
        console.log("Accessing from within class:", this.readOnlyProperty);
    }
}

class ExternalClass {
    accessProperty(obj: TestClass) {
        console.log("Accessing from external class:", obj.readOnlyProperty);
        console.log("try to change that property", obj.readOnlyProperty);
        obj.readOnlyProperty = [0, 289289];
        console.log("result", obj.readOnlyProperty);
    }
}

console.log("Creating instance...");
const test = new TestClass();
test.testAccess();

console.log("Accessing from external class...");
const external = new ExternalClass();
external.accessProperty(test);

console.log("Instance created, readOnlyProperty:", test.readOnlyProperty);
