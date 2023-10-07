import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  private _rawValue: any;
  public dep;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    //如果value是对象，需要将其用reactive包裹,同时对比的时候也需要注意
    /**
     * eg. const count = ref({count:1})
     */
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    // 单纯 const a = ref(1)不需要收集依赖
    trackRefValue(this);
    // trackEffects(this.dep);
    return this._value;
  }
  set value(newValue) {
    if (!hasChanged(newValue, this._rawValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffect(this.dep);
  }
}

export function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

export function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  //看看是不是一个ref对象——>ref.value
  return isRef(ref) ? ref.value : ref;
}

// 使得ref可以不用使用.value取值，主要用在template中
/**
 * 是ref对象的话就直接返回ref.value的值，不是的话就直接返回ref
 * @param objectWithRefs
 */
export function proxyRefs(objectWithRefs) {
  //   isReactive(objectWithRefs)
  //     ? objectWithRefs
  //     : new Proxy(objectWithRefs, shallowUnwrapHandlers);
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
