> 粗略的笔记版

本篇笔记的关键知识点有以下几个：

1. effect的功能以及触发时机？
2. reactive的功能以及是如何做依赖收集和触发依赖的？
# effect的功能

1. 首次调用的时候自动执行传入的函数
```typescript
it('should run the passed function once (wrapped by a effect)', () => {
    const fnSpy = jest.fn(() => {})
    effect(fnSpy)
    expect(fnSpy).toHaveBeenCalledTimes(1)
  })
```
给effect传入一个函数，该函数会被执行一次

2. 结合reactive时，当reactive的值发生改变时，effect会自动执行一次
```typescript
it('should observe basic properties', () => {
    let dummy
    const counter = reactive({ num: 0 })
    effect(() => (dummy = counter.num))

    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
  })
```
> 总结来说，effect的执行时机有两个：首次调用和响应式的值发生变化（当然第二种情况下我们可以通过stop方法来使其不触发）。

# reactive基本功能
reactive最基本的功能是定义一个响应式对象，在该响应式对象的值发生改变的时候，依赖于该响应式对象的变量的值也应该发生变化。
根据下面两种情况实现reactive的基本功能：

1. 在上面说effect的功能的时候，我们提到：

effect结合reactive时，当reactive的值发生改变时，effect会自动执行一次：
```javascript
// effect.spec.ts
it('should observe basic properties', () => {
    let dummy
    const counter = reactive({ num: 0 })
    effect(() => (dummy = counter.num))

    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
  })
```

2. 同时，这个响应式对象和最原本的对象是不一样的：
```typescript
// reactive.spec.ts
test('Object', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
  })
```

我们在reactive中通过Proxy来代理对象，我们在这边把返回的对象称为dummy，当读取dummy对象的属性的时候，就会触发dummy对象的get操作，我们会在get拦截器中进行依赖的收集，在设置dummy属性的值的时候，我们会触发dummy对象的set操作，我们会在set拦截器中进行一个依赖的触发。
那么这个依赖是什么呢？
——**这个依赖是指依赖于响应式对象的变量的副作用函数。**比如，在上面的情况一中，` effect(() => (dummy = counter.num))`就是dummy依赖于响应式对象counter的副作用函数。
> 关于副作用函数的概念的理解，在《Vue.js设计与实现》书中有介绍。

到这里我们已经知道了需要收集的依赖到底是什么，我们现在需要设置一个数据结果来使依赖收集、触发能更加清晰和高效。Vue3中是这样子来设计这个数据结构的：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/35794558/1698678693841-452a2a5c-cd80-44a7-899e-9655ab7977fa.png#averageHue=%232bb71b&clientId=ud443ac92-d394-4&from=paste&height=602&id=ua099f65c&originHeight=638&originWidth=933&originalType=binary&ratio=1.059999942779541&rotation=0&showTitle=false&size=131939&status=done&style=none&taskId=ua0dd65b5-e5ae-4322-a728-c783acece2c&title=&width=880.1887267592481)
我们创建了全局的 targetMap ，它的键是 target，值是 depsMap；这个 depsMap 的键是 target 的 key，值是 dep 集合，dep 集合中存储的是依赖的副作用函数 effect。

现在我们来看看如何收集effect函数和触发effect函数的：
```javascript
// reactivity/reactive.ts
function reactive(target){
  return new Proxy(target, {
    get(target,key){
      const res = Reflect.get(target, key);
      // 依赖收集
      track(target,key);
      return res;
    },
    set(target, key, value){
      const res = Reflect.set(target, key, value)
      //依赖触发
      trigger(target, key)
      return res
    }
  })
}


// reactivity/effect.ts
let activeEffect;

class ReactiveEffect{
  private _fn;
  constructor(fn){
    this._fn = fn;
  }
  run(){
    activeEffect = this;
    this._fn();
  }
}

const targetMap = new Map();

export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffect(dep);
}

export function triggerEffect(dep) {
  for (const effect of dep) {
    effect.run()
  }
}

export function effect(fn){
  const _effect = new ReactiveEffect(fn);
  _effect.run()
}
```
我们定义了一个全局变量activeEffect和一个类ReactiveEffect。**因为我们需要收集每一个正在执行的effect副作用函数，因此我们通过activeEffect来表示当前正在执行的effect函数是哪个。**
在执行effect函数的时候会接受一个函数fn，再创建一个ReactiveEffect对象_effect，
_effect目前包含的属性只有传给effect函数的变量fn，除此之外还有一个run方法，它是用来实现执行传给effect的函数。
由于effect被调用的时候，传入的函数会被调用一次。所以我们就会调用_effect的run方法来执行传给effect的函数fn。
在调用run方法的时候，我们会先将activeEffect的值变为当前正在执行的effect函数，但由于我们使用ReactiveEffect对于进行和封装和扩展，所以实际上我们是将activeEffect变为当前正在执行的effect函数内部新创建出来的_effect对象。
最后执行传给effect的fn函数，在这里面会涉及到依赖的收集：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/35794558/1698680540960-ff3286ba-486c-4d77-8c5b-c9fddfa20ccf.png#averageHue=%23041c2e&clientId=ud443ac92-d394-4&from=paste&height=408&id=u1b8524af&originHeight=433&originWidth=510&originalType=binary&ratio=1.059999942779541&rotation=0&showTitle=false&size=46336&status=done&style=none&taskId=u88b36829-a921-43ae-a361-d45ab41b879&title=&width=481.132101443962)
当我们改变响应式对象的值的时候，就会触发依赖：
触发依赖的时候，我们只需要取出相应的依赖函数列表（很多个之前依赖收集时存储的_effect对象）,然后遍历这个列表，执行每个_effect对象的run方法就可以再次执行传给effect的函数。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/35794558/1698680641512-6a3a974c-d562-445f-b761-744ac026d6e7.png#averageHue=%23031a2c&clientId=ud443ac92-d394-4&from=paste&height=246&id=u598bab57&originHeight=261&originWidth=545&originalType=binary&ratio=1.059999942779541&rotation=0&showTitle=false&size=21433&status=done&style=none&taskId=u4e26db81-6d3a-4c9b-bc0d-9d90bd996dc&title=&width=514.1509711509005)

