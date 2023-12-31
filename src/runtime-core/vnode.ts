import { ShapeFlags } from "../shared/ShapeFlags"

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");


export function createVnode(type, props?, children?){
    const vnode = {
        type,
        props,
        children,
        shapeFlag:getShapeFlag(type),
        el:null
    }

    if(typeof children === "string"){
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
    }else if(Array.isArray(children)){
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
    }

    //判断是否是插槽: 组件 + children object
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        if(typeof children === "object"){
            vnode.shapeFlag =  vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
        }
    }

    return vnode
}

export function createTextVnode(text:string){
    return createVnode(Text, {}, text);
}

function getShapeFlag(type){
    return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}