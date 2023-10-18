import { h } from "../../lib/guide-mini-vue.esm.js";

window.self = null;
export const Foo = {
  setup(props){
    console.log(props);
  },
  render(){
    return h("div", {},"foo--" + this.count)
  }
};
