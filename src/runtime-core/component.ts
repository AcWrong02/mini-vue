export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState:{},
    }
    return component
}

export function setupComponent(instance) {


    //1.初始化props
    // initProps()

    //2.初始化slots
    // initSlots()

    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
    const Component = instance.type;

    instance.proxy = new Proxy({},{
        get(target,key){
            const {setupState} = instance;
            if(key in setupState){
                return setupState[key];
            }
        }
    })

    const { setup } = Component;

    if (setup) {
        //注意，setup可以返回function，也可以返回Object，因此需要做不同的处理
        const setupResult = setup();

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

