import { rulerDecorators, $debugger } from "./rulerDecorators";

class test {}

class cls {
    @rulerDecorators.onlyTheClassCanWrite(cls)
    secret = [-1, 0, 1, 2, 3, 4, 5, 6];
    @rulerDecorators.onlyTheClassCanWrite(cls)
    code: number[];
    constructor(start: number | undefined, end: number | undefined) {
        console.log(this.secret);
        this.code = this.secret.slice(start, end);
    }
    @rulerDecorators.minimum(0)
    num = -1;
}

@$debugger(true, "16")
class sub extends cls {
    @$debugger(false, "18")
    secret = [-1, 0, 1];
    @$debugger(true, "20")
    @rulerDecorators.onlyTheClassCanWrite(cls)
    @$debugger(true, "22")
    code: number[] = [];
}

let c = new cls(0, 4);
console.log(899890898989);
let s = new sub(0, 1);
console.log(c);
console.log(s);
