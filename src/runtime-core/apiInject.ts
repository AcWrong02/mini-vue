import { getCurrentInstance } from "./component";

export function provide(key, value) {
  //存
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { providers } = currentInstance;
    const parentProviders = currentInstance.parent.providers;

    //这边不能重复的去初始化，否则会有问题
    if(providers === parentProviders){
      providers = (currentInstance.providers = Object.create(parentProviders));
    }

    providers[key] = value;
  }
}

export function inject(key) {
  //取
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProviders = currentInstance.parent.providers;
    return parentProviders[key];
  }
}
