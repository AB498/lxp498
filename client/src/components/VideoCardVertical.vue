<script setup>

const props = defineProps({
    video: Object,
    index: Number,
})
import pic from "@/assets/logo.svg";

</script>

<template>
        <div class="flex flex-col  w-full relative hover:-translate-y-1 shadow-md transition">
            <img :src="video.thumbnailUrl ? video.thumbnailUrl : pic" alt="" class="w-full">
            <div
                class="absolute h-full w-full hover:opacity-100 opacity-0  text-lg font-bold flex justify-center items-center  ">
                <div
                    class="w-full h-full bg-gradient-to-b from-indigo-500/75 to-emerald-700/25 break-words flex justify-center items-center space-x-2 text-yellow-400 hover-ripple-fast">
                <i class="fa fa-play-circle"></i>
                <div>Play</div>
            </div>
        </div>
        <div class="p-4">
            <div class="text-xs line-clamp-3 " v-text="video.title || 'No Title'"></div>
            <div class="text-xs line-clamp-2 text-gray-400 break-words" v-text="video.description || 'No Description'">
            </div>
        </div>
    </div>
</template>