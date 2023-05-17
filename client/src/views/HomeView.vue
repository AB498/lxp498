<script setup>
import SuggestedVideos from "@/components/SuggestedVideos.vue";
import { ref } from "vue";
import { onMounted } from "vue";

</script>

<template>
  <div class="flex flex-col sm:flex-row  sm:flex-wrap w-full h-full bg-cyan-950">

    <SuggestedVideos />
  </div>
</template>