import { h,renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(){
    return {};
  },

  render(){
    const foo = h("p", {}, "foo");

    const age = 18;

    //实现具名插槽
    // return h("div", {}, [renderSlots(this.$slots, "header"), foo, renderSlots(this.$slots, "footer")]);

    //实现作用域插槽
    return h("div", {}, [renderSlots(this.$slots, "header",{age}), foo, renderSlots(this.$slots, "footer")]);
  }
};
