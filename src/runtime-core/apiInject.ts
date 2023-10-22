import { getCurrentInstance } from "./component";

export function provide(key, value) {
  //存
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const { providers } = currentInstance;
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
