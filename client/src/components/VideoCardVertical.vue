<script setup>

const props = defineProps({
    video: Object,
    index: Number,
})
import pic from "@/assets/noimage.svg";

</script>

<template>
    <div class=" flex flex-col w-full relative hover:-translate-y-1 shadow-md transition rounded-xl">
        <div class="border relative rounded-t-xl">
            <img :src="video.thumbnailUrl ? video.thumbnailUrl : pic" alt="" class="aspect-video object-contain w-full rounded-t-xl">
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
        <div class="p-4 break-words">
            <div class="text-xs line-clamp-3 " >{{ video.title || 'No Title' }}</div>
            <div class="text-xs themed-text-secondary line-clamp-2 break-words">
                {{ video.description || 'No Description' }}
            </div>
        </div>
    </div>
</template>