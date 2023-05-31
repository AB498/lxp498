<script setup>
import SuggestedVideos from "@/components/SuggestedVideos.vue";
import { ref } from "vue";
import { onMounted } from "vue";

</script>

<template>
    <div class="flex  w-full ">
      <div class=" flex flex-col sm:flex-row items-start  sm:flex-wrap">
        <SuggestedVideos />
      </div>
    </div>
</template>