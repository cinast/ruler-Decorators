import {
    $$init,
    $conditionalWrite,
    $setter,
    instanceStorage,
    rulerDecorators,
    setterHandlers,
    wrapperCache,
} from "../src/rulerDecorators";

class cls {
    @$$init()
    @$setter<number>((thisArg, attr, v) => (v > 0 ? v : thisArg[attr]))
    @$conditionalWrite<number>([(thisArg, attr, v) => v > 0])
    @rulerDecorators.alwaysPositive
    n = 0;
}
