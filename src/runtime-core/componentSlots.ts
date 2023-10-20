export function initSlots(instance, children){
    normalizeObjectSlots(instance.slots, children);
}


function normalizeObjectSlots(slots, children){
    for(const key in children){
        const value = children[key];
        //key
        slots[key] = normalizeSlotValue(value);
    }
}

function normalizeSlotValue(value){
    return Array.isArray(value)? value: [value]
}