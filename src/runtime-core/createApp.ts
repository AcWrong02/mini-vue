import { render } from "./renderer";
import { createVnode } from "./vnode";

export function createApp(rootComponent){
    return {
        mount(rootContainer){
            //先转化成虚拟节点
            //component——>vnode
            //后续所有的逻辑根据虚拟节点来进行处理
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer)
        }
    }
}
