import { isEqual } from "lodash-es";
function assert_eq(a, b) {
    let t = isEqual(a, b);
    if (!t) {
        throw new Error(`Not equal:\n left:\n${a}\n right:\n${b}`);
    }
    return true;
}
