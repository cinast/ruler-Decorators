import { $$init, $PropertyProxy, rulerDecorators } from "../src/rulerDecorators";

class test {
    @$$init()
    @$PropertyProxy()
    @rulerDecorators.maximum(100)
    li = 303;
}
const t = new test();
console.log(t.li);
