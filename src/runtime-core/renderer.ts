import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";

export function createRenderer(options){
  const { createElement, patchProp, insert } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(n1, n2, container, parentComponent) {
    //TODO 判断vnode是不是一个element
    //是element那么就应该处理element
    //如何去区分是element类型还是component类型？
    const {type, shapeFlag} = n2


    //Fragment——>只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        //处理ELEMENT类型
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //去处理组件
          processComponent(n1, n2, container,parentComponent);
        }
        break;
    }
  }

  function processText(n1, n2:any, container:any){
    console.log("processText~~");
    const {children} = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChlidren(n2, container, parentComponent);
  }

  function processElement(n1, n2, container, parentComponent) {
    if(!n1){
      mountElement(n2, container,parentComponent);
    }else{
      patchElement(n1, n2, container);
    }
  }

  //更新Element逻辑
  function patchElement(n1, n2, container){
    console.log("patchElement");
    console.log("n1:",n1);
    console.log("n2:",n2);

    //TODO：处理props
    //TODO：处理children
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    //包含this.$el实现
    const el = (vnode.el = createElement(vnode.type));

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
      // const isOn = (key:string)=> /^on[A-Z]/.test(key)
      // if(isOn(key)){
      //   const event = key.slice(2).toLowerCase()
      //   el.addEventListener(event,val)
      // }else{
      //   el.setAttribute(key, val);
      // }
      patchProp(el, key, val);
    }
    // container.append(el);
    insert(el, container);
  }

  function mountChlidren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function processComponent(n1, n2, container,parentComponent) {
    mountComponent(n2, container,parentComponent);
  }

  function mountComponent(vnode, container,parentComponent) {
    const instance = createComponentInstance(vnode,parentComponent);

    setupComponent(instance);

    setupRenderEffect(instance, vnode, container, parentComponent);
  }

  function setupRenderEffect(instance,vnode, container, parentComponent) {
    const {proxy} = instance;
  
    effect(()=>{
        // const subTree = (instance.subTree = instance.render.call(proxy));

        // //vnode——>patch
        // patch(null, subTree, container, instance);

        // vnode.el = subTree.el;
      if(!instance.isMounted){
        console.log("init");
        const subTree = (instance.subTree = instance.render.call(proxy));

        //vnode——>patch
        patch(null, subTree, container, instance);

        vnode.el = subTree.el;

        instance.isMounted = true;
      }else{
        console.log("update");
        const subTree = instance.render.call(proxy);

        const prevSubTree = instance.subTree;

        instance.subTree = subTree;

        // console.log("current:",subTree,"prev:",prevSubTree);

        //vnode——>patch
        patch(prevSubTree, subTree, container, instance);
      }
    })

  }
  return {
    createApp:createAppAPI(render)
  }

}