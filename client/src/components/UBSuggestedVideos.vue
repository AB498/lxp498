<script setup>
// import videos from "../assets/mockData/suggestedVideos.json"
// let videos = (await (await fetch('../assets/mockData/suggestedVideos.json')).json())
import { ref, onMounted } from 'vue'

const videos = ref([]);

onMounted(async () => {
  videos.value = await (await fetch(window.glb.baseUrl + "/api/uploadbase/getSuggestedVideos")).json();
  console.log(videos.value);
});

import pic from "@/assets/logo.svg";
import VideoCardVertical from './VideoCardVertical.vue';

</script>

<template>
  <div v-for="(video, index) in videos" :key="index" class="basis-1/4 sm:overflow-auto  p-4 ">
    <VideoCardVertical @click="$router.push('/uploadbase/watch/' + video.id)" :video="video" />
  </div>
</template>