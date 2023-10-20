import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");

    //实现插槽基础功能的例子
    // const foo = h(Foo, {}, [h("p",{},"123"),h("p",{},"456")]);
    // const foo = h(Foo, {}, h("p",{},"123"));

    //实现具名插槽功能的例子
    const foo = h(
      Foo,
      {},
      { header: h("p", {}, "header"), footer: h("p", {}, "footer") }
    );

    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
