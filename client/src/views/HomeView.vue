<script setup>
import SuggestedVideos from "@/components/SuggestedVideos.vue";
import { ref } from "vue";
import { onMounted } from "vue";
import YTJSON from "@/assets/youtube.json";

</script>

<template>
  <div class="flex flex-col w-full ">
    <div class="flex center-cross h-12 w-full cursor-pointer px-4 p-2">
      <div class="text-lg whitespace-nowrap">Powered by</div>
      <div class="h-20 aspect-square flex">
        <Vue3Lottie :speed="2" :animationData="YTJSON" class="full flex" :loop="true" />
      </div>
      <div class="grow"></div>
    </div>
    <div class=" flex flex-col sm:flex-row items-start  sm:flex-wrap">
      <SuggestedVideos />
    </div>
  </div>
</template>