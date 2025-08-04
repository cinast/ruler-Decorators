import { rulerDecorators, setReadOnlyPropertyWarning } from "./rulerDecorators";

class TestClass {
    @rulerDecorators.onlyTheClassCanRead(TestClass)
    readOnlyProperty: number[] = [1, 2, 3];

    constructor() {
        console.log("In constructor, readOnlyProperty:", this.readOnlyProperty);
    }

    testAccess() {
        console.log("Accessing from within class:", this.readOnlyProperty);
    }

    testModification() {
        console.log("Trying to modify from within class...");
        this.readOnlyProperty = [4, 5, 6];
        console.log("After modification from within class:", this.readOnlyProperty);
    }
}

class ExternalClass {
    accessProperty(obj: TestClass) {
        try {
            console.log("Accessing from external class:", obj.readOnlyProperty);
        } catch (e: any) {
            console.log("External class cannot access readOnlyProperty:", e.message);
        }
    }

    modifyProperty(obj: TestClass) {
        try {
            console.log("Trying to modify from external class...");
            obj.readOnlyProperty = [7, 8, 9];
            console.log("After modification from external class:", obj.readOnlyProperty);
        } catch (e: any) {
            console.log("External class cannot modify readOnlyProperty:", e.message);
        }
    }
}

console.log("=== Testing read-only property behavior ===");

// Test 1: Disable warnings
console.log("\n--- Test 1: Warnings disabled ---");
setReadOnlyPropertyWarning(false);
const test1 = new TestClass();
test1.testAccess();
test1.testModification();

const external1 = new ExternalClass();
external1.accessProperty(test1);
external1.modifyProperty(test1);

// Test 2: Enable warnings
console.log("\n--- Test 2: Warnings enabled ---");
setReadOnlyPropertyWarning(true);
const test2 = new TestClass();
test2.testAccess();
test2.testModification();

const external2 = new ExternalClass();
external2.accessProperty(test2);
external2.modifyProperty(test2);

console.log("\n=== Test completed ===");
