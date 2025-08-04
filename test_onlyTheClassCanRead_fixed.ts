import { rulerDecorators, $debugger } from "./rulerDecorators";

class TestClass {
    @rulerDecorators.onlyTheClassCanRead(TestClass)
    //@ts-ignore
    readOnlyProperty: number[];

    constructor() {
        // Use Object.defineProperty to initialize the property
        Object.defineProperty(this, "readOnlyProperty", {
            value: [1, 2, 3],
            writable: false,
            enumerable: true,
            configurable: true,
        });
        //@ts-ignore

        console.log("In constructor, readOnlyProperty:", this.readOnlyProperty);
    }

    testAccess() {
        console.log("Accessing from within class:", this.readOnlyProperty);
    }
}

class ExternalClass {
    accessProperty(obj: TestClass) {
        try {
            console.log("Accessing from external class:", obj.readOnlyProperty);
        } catch (e: any) {
            console.log("External class cannot access readOnlyProperty:", e.message);
        }
        try {
            console.log("try to change that property", obj.readOnlyProperty);
            obj.readOnlyProperty = [0, 289289];
            console.log("result", obj.readOnlyProperty);
        } catch (e: any) {
            console.log("failed to change:", e.message);
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
