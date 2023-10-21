import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment,Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //TODO 判断vnode是不是一个element
  //是element那么就应该处理element
  //如何去区分是element类型还是component类型？
  const {type, shapeFlag} = vnode


  //Fragment——>只渲染children
  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode,container);
      break;
    default:
      //处理ELEMENT类型
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //去处理组件
        processComponent(vnode, container);
      }
      break;
  }
}

function processText(vnode:any, container:any){
  const {children} = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode: any, container: any) {
  mountChlidren(vnode, container);
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

