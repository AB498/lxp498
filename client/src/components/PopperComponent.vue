<script setup>
import { all } from 'axios';
import { onMounted } from 'vue';
import { ref, watch, nextTick } from 'vue';

const show = ref(false);
const popup = ref(null);
const tohover = ref(null);

const mounted = ref(false);
const props = defineProps({
    mode: {
        type: String,
        default: 'hover'
    }
})
let popupVerticalDirection = ref('bottom');
let popupHorizontalDirection = ref('right');

watch([() => show.value, mounted], (val, old) => {
    if (val) {
        if (tohover.value.getBoundingClientRect().top + popup.value.getBoundingClientRect().height > window.innerHeight) {
            popupVerticalDirection.value = 'top';
        }
        else {
            popupVerticalDirection.value = 'bottom';
        }
        if (tohover.value.getBoundingClientRect().left + popup.value.getBoundingClientRect().width > window.innerWidth) {
            popupHorizontalDirection.value = 'left';
        }
        else {
            popupHorizontalDirection.value = 'right';
        }

        if (popupVerticalDirection.value == 'top') {
            popup.value.style.bottom = `${tohover.value.getBoundingClientRect().top}px`;
        }
        else {
            popup.value.style.top = `${tohover.value.getBoundingClientRect().bottom}px`;
        }

        if (popupHorizontalDirection.value == 'left') {
            popup.value.style.right = `${window.innerWidth - tohover.value.getBoundingClientRect().right}px`;
        }
        else {
            popup.value.style.left = `${tohover.value.getBoundingClientRect().left}px`;
        }



        popup.value.style.zIndex = 9999;


    }
})

onMounted(() => {
    mounted.value = true;
    window.document.querySelector('#root-app').appendChild(popup.value)
    popup.value.style.width = 'auto'
    popup.value.style.whiteSpace = 'nowrap'
    popup.value.style.overflow = 'visible'

})
const mouseoverInhover = ref(false);
const mouseoverPopup = ref(false);
const together = ref([false, false])
const matchArrays = (arr1, arr2) => arr1.every((val, index) => val === arr2[index]);

watch(together.value, (val, old) => {
    if (mode.value == 'hover'){
        if (val[0] || val[1]) {
            show.value = true;
        }
        else {
            show.value = false;
        }
    }
})

const mode = ref(props.mode || 'hover');

function togglePopup() {console.log(1);
    let v = !show.value;
    setTimeout(() => {
        
        if (mode.value == 'click') {
            show.value = v;
        }
    },0);
}

</script>
<template>
    <div @mouseover="together[0] = true; " @mouseleave=" together[0] = false" ref="tohover" @click="togglePopup"
        class=" items-center justify-center relative overflow-visible " :class="window.glb?.dark && ' dark'"
>

        <div @mouseover=" together[1] = true" @mouseleave=" together[1] = false"
                v-click-outside="() => {console.log(0); if(mode == 'click') show = false}"
            :class="show ? 'opacity-100' : 'opacity-0 pointer-events-none translate-x-4'"
            class="fixed max-h-[80vh] max-w-[60vw]  w-auto h-auto transition-all  text-sm themed-bg-secondary  border-2  shadow-md rounded  overflow-auto"
            ref="popup">
            <div class="  m-1 overflow-visible relative">
                <slot name="popup"></slot>
            </div>
        </div>
        <slot name="tohover" class="bg-red-400"></slot>
    </div>
</template>