import { rulerDecorators, $debugger } from "./rulerDecorators";

class TestClass {
    @rulerDecorators.onlyTheClassCanRead(TestClass)
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
        try {
        } catch (e: any) {
            // console.log("External class cannot access readOnlyProperty:", e.message);
        }
        console.log("try to change that property", obj.readOnlyProperty);
        obj.readOnlyProperty = [0, 289289];
        console.log("result", obj.readOnlyProperty);
        try {
        } catch (e: any) {
            // console.log("failed to change:", e.message);
        }
    }
}

console.log("Creating instance...");
const test = new TestClass();
test.testAccess();

console.log("Accessing from external class...");
const external = new ExternalClass();
external.accessProperty(test);

console.log("Instance created, readOnlyProperty:", test.readOnlyProperty);
