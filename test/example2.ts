import { $$init } from "../src/rulerDecorators";
import { watchSet } from "../src/rulesLibrary";

class test {
    @$$init()
    @watchSet((a, idx, v) => console.log("a[] =" + String(v)))
    a = new Array(10);
    @$$init()
    @watchSet((_, key, v) => console.log("b{}{}"))
    b = {
        A: 0,
        B: "%%",
        C: () => {},
    };
}

let t = new test();
t.a[0] = 9;
t.a[4] = 6;
t.b.A = 9;
console.log(t.a);
console.log(t.b);
