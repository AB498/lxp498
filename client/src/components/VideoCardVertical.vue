<script setup>

const props = defineProps({
    video: Object,
    index: Number,
})
import pic from "@/assets/logo.svg";

</script>

<template>
    <div class=" flex flex-col w-full relative hover:-translate-y-1 shadow-md transition h-full rounded-xl">
        <div class="border relative rounded-t-xl">
            <img :src="video.thumbnailUrl ? video.thumbnailUrl : pic" alt="" class="w-16 rounded-t-xl">
            <div class="vidinfo absolute bottom-0  themed-text-primary bg-opacity-80 text-xs"
            :class="!window.glb.dark ? 'bg-slate-200' : 'bg-slate-950'"
            >
                {{ 'Published: ' + window.glb.getFormattedDateTime(new Date(video.publishedAt || video.createdAt )) }}
            </div>
        </div>
        <div
            class="absolute h-full w-full hover:opacity-100 opacity-0  text-lg font-bold flex justify-center items-center rounded-xl ">
            <div
                class="w-full h-full bg-gradient-to-b from-indigo-500/75 to-emerald-700/25 break-words flex justify-center items-center space-x-2 text-yellow-400 hover-ripple-fast rounded-xl">
                <i class="fa fa-play-circle"></i>
                <div>Play</div>
            </div>
        </div>
        <div class="p-4 w-full overflow-auto">
            <div class="w-full text-xs  " v-text="video.title || 'No Title'"></div>
            <div class="w-full text-xs themed-text-secondary  break-words" v-text="video.description || 'No Description'">
            </div>
        </div>
    </div>
</template>