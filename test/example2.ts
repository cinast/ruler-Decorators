import { $$init } from "../src/rulerDecorators";
import { watchSet } from "../src/utils";

class test {
    @$$init()
    @watchSet((_, idx, v) => console.log(v[idx]))
    a = new Array(10);
}

let t = new test();
t.a[0] = 9;
t.a[4] = 6;
console.log(t.a);
