const isObject = (val) => {
    return val !== null && typeof val === "object";
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    //1.初始化props
    // initProps()
    //2.初始化slots
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        //注意，setup可以返回function，也可以返回Object，因此需要做不同的处理
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    //注意，setup可以返回function，也可以返回Object，因此需要做不同的处理
    //TODO:function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if(Component.render){
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    //TODO 判断vnode是不是一个element
    //是element那么就应该处理element
    //如何去区分是element类型还是component类型？
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        //去处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
    const subTree = instance.render();
    //vnode——>patch
    patch(subTree, container);
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //先转化成虚拟节点
            //component——>vnode
            //后续所有的逻辑根据虚拟节点来进行处理
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
