import { isReactive, isReadonly, shallowReadonly } from "../reactive";

describe("reactivity/shallowReadonly", () => {
  it("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
    expect(isReactive(props.n)).toBe(false);
  });
});
