import { createVnode } from "../vnode";

export function renderSlots(slots){
    return createVnode("div", {}, slots)
}