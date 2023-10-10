import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //TODO 判断vnode是不是一个element
  //是element那么就应该处理element
  //如何去区分是element类型还是component类型？
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    //去处理组件
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
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

  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const {proxy} = instance;
 
  const subTree = instance.render().call(proxy);

  //vnode——>patch
  patch(subTree, container);
}
