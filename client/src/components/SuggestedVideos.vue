<script setup>
// import videos from "../assets/mockData/suggestedVideos.json"
// let videos = (await (await fetch('../assets/mockData/suggestedVideos.json')).json())
import { ref, onMounted } from 'vue'
import VideoCardVertical from '@/components/VideoCardVertical.vue';

const videos = ref([]);

onMounted(async () => {
  videos.value = await (await fetch(window.glb.baseUrl + "/api/videos/getSuggestedVideos")).json();
});

</script>

<template>
  <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch ">
      <div v-for="(video, index) in videos" :key="index" class=" basis-1/4 shrink-0 grow-0 p-4 ">
      <VideoCardVertical :video="{
        thumbnailUrl: video.snippet.thumbnails.medium.url,
        title: video.snippet.title, description: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
      }" @click="$router.push('/yt/' + video.id.videoId)" />
  </div>
</div>
</template>