import { createRenderer } from "../runtime-core";

export function createElement(type){
    return document.createElement(type);
}

export function hostPatchProp(el, key, prevVal, nextVal){
    const isOn = (key:string)=> /^on[A-Z]/.test(key)
    if(isOn(key)){
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event,nextVal)
    }else{
        if(nextVal === undefined || nextVal === null){
            el.removeAttribute(key, nextVal)
        }else{
            el.setAttribute(key, nextVal);
        }
    }
}

export function hostInsert(el, parent){
    parent.append(el);
}

const renderer:any = createRenderer({
    createElement,
    hostPatchProp,
    hostInsert
})

export function createApp(...args){
    return renderer.createApp(...args)
}

export * from "../runtime-core"