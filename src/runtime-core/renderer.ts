import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";

export function createRenderer(options){
  const { 
    createElement, 
    hostPatchProp, 
    hostInsert,
    hostRemove,
    setElementText:hostSetElementText, 
  } = options;

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
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    // 这边还有点疑问
    const el = (n2.el = n1.el);

    patchProps(el, oldProps, newProps);
    //TODO：处理children
    patchChildren(n1, n2, el);
  }

  function patchChildren(n1, n2, container){
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c2 = n2.children;

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
        // 1. 把老的children清空
        unmountChildren(n1.children);
        // 2. 设置新的text
        hostSetElementText(container, c2)
      }
    }
  }

  function unmountChildren(children){
    for(let i = 0; i < children.length; i++){
      const el = children[i].el;
      // remove
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps){
    //优化点：只有在props发生变化的时候才需要进行对比
    if(oldProps !== newProps){
      //情况一和情况二：值改变和值变成undefined
      for(const key in newProps){
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if(prevProp !== newProps){
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      //情况三：属性被删除
      //fix:做进一步的细节优化
      if(oldProps !== EMPTY_OBJ){
        for(const key in oldProps){
          if(!(key in newProps)){
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }

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
      hostPatchProp(el, key, null, val);
    }
    // container.append(el);
    hostInsert(el, container);
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