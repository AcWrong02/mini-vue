import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //TODO 判断vnode是不是一个element
  //是element那么就应该处理element
  //如何去区分是element类型还是component类型？
  const {shapeFlag} = vnode
  //处理ELEMENT类型
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    //去处理组件
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
   //包含this.$el实现
  const el = (vnode.el = document.createElement(vnode.type));

  const { children,shapeFlag } = vnode;
  //处理文本类型
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 处理数组类型
    mountChlidren(vnode, el);
  }

  //props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}

function mountChlidren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  setupComponent(instance);

  setupRenderEffect(instance,vnode, container);
}

function setupRenderEffect(instance,vnode, container) {
  const {proxy} = instance;
 
  const subTree = instance.render.call(proxy);

  //vnode——>patch
  patch(subTree, container);

  vnode.el = subTree.el;
}
