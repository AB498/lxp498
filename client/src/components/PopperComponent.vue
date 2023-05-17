<script setup>
import { ref, watch } from 'vue';

const show = ref(false);
const popup = ref(null);
const tohover = ref(null);

watch(() => show.value, (val, old) => {
    if (val) {
        popup.value.style.top = tohover.value.offsetTop + tohover.value.offsetHeight + "px";
        // adjust if out of screen 
        if (popup.value.offsetLeft + popup.value.offsetWidth > window.innerWidth) {
            popup.value.style.left = window.innerWidth - popup.value.offsetWidth + "px";
        }
        else {
            popup.value.style.left = tohover.value.offsetLeft + "px";
        }
        // adjust if out of screen
        if (popup.value.offsetTop + popup.value.offsetHeight > window.innerHeight) {
            popup.value.style.top = tohover.value.offsetTop - popup.value.offsetHeight + "px";
        }
        else {
            popup.value.style.top = tohover.value.offsetTop + tohover.value.offsetHeight + "px";
        }
        // adjust if out of screen
        if (popup.value.offsetLeft < 0) {
            popup.value.style.left = 0 + "px";
        }
        else {
            popup.value.style.left = tohover.value.offsetLeft + "px";
        }
        // adjust if out of screen  
        if (popup.value.offsetTop < 0) {
            popup.value.style.top = tohover.value.offsetTop + tohover.value.offsetHeight + "px";
        }
        else {
            popup.value.style.top = tohover.value.offsetTop + tohover.value.offsetHeight + "px";
        }


    }
})
const mouseoverInhover = ref(false);
const mouseoverPopup = ref(false);
const together = ref([true, false])
const matchArrays = (arr1, arr2) => arr1.every((val, index) => val === arr2[index]);

watch(together.value, (val, old) => {
    if (val[0] || val[1]) {
        show.value = true;
    }
    else {
        show.value = false;
    }
})


</script>
<template>
    <div @mouseover="together[0] = true;" @mouseout=" together[0] = false" ref="tohover"
        class="flex items-center justify-center">
        <slot name="tohover" class="bg-red-400"></slot>
        <div @mouseover=" together[1] = true" @mouseout=" together[1] = false"
            :class="show ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-4'"
            class="absolute overflow-auto max-h-[80vh] max-w-[80vw] transition text-sm font-mono text-white  bg-blue-500 shadow-md rounded p-1  "
            ref="popup">
            <slot name="popup"></slot>
        </div>
    </div>
</template>