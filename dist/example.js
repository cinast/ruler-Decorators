"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const rulerDecorators_1 = require("./rulerDecorators");
class cls {
    constructor(start, end) {
        this.secret = [-1, 0, 1, 2, 3, 4, 5, 6];
        this.num = -1;
        debugger;
        this.code = this.secret.slice(start, end);
    }
}
__decorate([
    rulerDecorators_1.rulerDecorators.onlyTheClassCanWrite(cls),
    rulerDecorators_1.rulerDecorators.onlyTheClassCanRead(cls),
    __metadata("design:type", Object)
], cls.prototype, "secret", void 0);
__decorate([
    rulerDecorators_1.rulerDecorators.onlyTheClassCanWrite(cls),
    __metadata("design:type", Array)
], cls.prototype, "code", void 0);
__decorate([
    rulerDecorators_1.rulerDecorators.minimum(0),
    __metadata("design:type", Object)
], cls.prototype, "num", void 0);
let sub = class sub extends cls {
    constructor() {
        super(...arguments);
        this.secret = [-1, 0, 1];
        this.code = [];
    }
};
__decorate([
    (0, rulerDecorators_1.$debugger)(false, "18"),
    __metadata("design:type", Object)
], sub.prototype, "secret", void 0);
__decorate([
    (0, rulerDecorators_1.$debugger)(true, "20"),
    rulerDecorators_1.rulerDecorators.onlyTheClassCanWrite(cls),
    (0, rulerDecorators_1.$debugger)(true, "22"),
    __metadata("design:type", Array)
], sub.prototype, "code", void 0);
sub = __decorate([
    (0, rulerDecorators_1.$debugger)(true, "16")
], sub);
let c = new cls(0, 4);
let s = new sub(0, 1);
console.log(c);
console.log(s);
