import { camelize, toHandlerKey } from "../shared";

export function emit(instance, event, ...args) {
  console.log("emit", event, 123);

  const { props } = instance;

  const hanlerName = toHandlerKey(camelize(event));

  const handler = props[hanlerName];
  handler && handler(...args);
}
