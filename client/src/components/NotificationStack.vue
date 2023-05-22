<script setup>
import { ref } from 'vue'
import { watch } from 'vue';

const hovering = ref(false);
const hoveredEl = ref(-1);


watch(hovering, (newVal, oldVal) => {
    if (newVal) {
        // all after hoveredEl
        for (let i = hoveredEl.value; i < window.glb.notifications.length; i++) {
            window.glb.notifications[i].tmout.pause();
        }
    } else {
        for (let i = 0; i < window.glb.notifications.length; i++) {
            window.glb.notifications[i].tmout.run();
        }
    }

})




</script>

<template>
    <div class="absolute w-screen h-screen flex flex-col items-center justify-end text-white z-50 pointer-events-none"
        @click="">
        <div v-for="(item, index) in window.glb.notifications " :key="item.id"
            class="min-h-[3rem] max-w-[30rem] min-w-[20rem] p-3 rounded border-2  pointer-events-auto m-1 overflow-auto "
                    :style="{ backgroundColor: !hovering ? item.color : '#333' }" @mouseover="hovering = true; hoveredEl = index; cons(hoveredEl)"
                @mouseleave=" hovering = false; hoveredEl = -1">
                <div class="flex items-stretch justify-center px-2">

                    <div class="flex flex-col  justify-center">
                        <div class="font-bold line-clamp-2">
                            {{ item.text }}
                        </div>
                        <div class="text-sm line-clamp-3">
                            {{ item.content }}
                        </div>
                    </div>
                    <i class="fas fa-times ml-2 cursor-pointer p-2" @click=" window.glb.removeNotf(item.id)"></i>
            </div>
        </div>

    </div>
</template>


<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>