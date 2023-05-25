<script setup>

const props = defineProps({
    comment: Object,
    index: Number,
})
import pic from "@/assets/logo.svg";

</script>

<template>
        <div class="flex w-full relative hover:-translate-y-1 shadow-md transition p-2 space-x-2 ">
            <img :src="comment.authorImage || pic" alt="" class="h-8 rounded-full">
            <div class="flex flex-col w-full bg-cyan-950 rounded-md p-2 hover:bg-cyan-900 transition">
                <div class="name text-xs text-gray-400 "> {{ comment.authorName }} </div>
                <div class="text-md break-words line-clamp-6" v-text="comment.content || 'No Description'"
                    @click="$event.target.classList.toggle('line-clamp-6')">
            </div>
        </div>

    </div>
</template>