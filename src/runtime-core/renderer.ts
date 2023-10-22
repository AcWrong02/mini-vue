import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment,Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  //TODO 判断vnode是不是一个element
  //是element那么就应该处理element
  //如何去区分是element类型还是component类型？
  const {type, shapeFlag} = vnode


  //Fragment——>只渲染children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode,container);
      break;
    default:
      //处理ELEMENT类型
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //去处理组件
        processComponent(vnode, container,parentComponent);
      }
      break;
  }
}

function processText(vnode:any, container:any){
  const {children} = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChlidren(vnode, container, parentComponent);
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container,parentComponent);
}

function mountElement(vnode: any, container: any, parentComponent) {
   //包含this.$el实现
  const el = (vnode.el = document.createElement(vnode.type));

  const { children,shapeFlag } = vnode;
  //处理文本类型
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 处理数组类型
    mountChlidren(vnode, el, parentComponent);
  }

  //props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    //事件处理逻辑——》on+eventname
    const isOn = (key:string)=> /^on[A-Z]/.test(key)
    if(isOn(key)){
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event,val)
    }else{
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}

function mountChlidren(vnode, container, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent);
  });
}

function processComponent(vnode, container,parentComponent) {
  mountComponent(vnode, container,parentComponent);
}

function mountComponent(vnode, container,parentComponent) {
  const instance = createComponentInstance(vnode,parentComponent);

  setupComponent(instance);

  setupRenderEffect(instance,vnode, container, parentComponent);
}

function setupRenderEffect(instance,vnode, container, parentComponent) {
  const {proxy} = instance;
 
  const subTree = instance.render.call(proxy);

  //vnode——>patch
  patch(subTree, container, instance);

  vnode.el = subTree.el;
}

