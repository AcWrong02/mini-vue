import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicinstance";

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState:{},
        props:{}
    }
    return component
}

export function setupComponent(instance) {


    //1.初始化props
    initProps(instance, instance.vnode.props);

    //2.初始化slots
    // initSlots()

    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
    const Component = instance.type;

    instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers)

    const { setup } = Component;

    if (setup) {
        //注意，setup可以返回function，也可以返回Object，因此需要做不同的处理
        const setupResult = setup(shallowReadonly(instance.props));

        handleSetupResult(instance, setupResult);
    }
}

function handleSetupResult(instance, setupResult: any) {
    //注意，setup可以返回function，也可以返回Object，因此需要做不同的处理
    //TODO:function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
    const Component = instance.type;

    // if(Component.render){
        instance.render = Component.render;
    // }

    
}

