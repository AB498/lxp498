<script setup>
import SuggestedVideos from "@/components/SuggestedVideos.vue";
import { ref } from "vue";
import { onMounted } from "vue";

</script>

<template>
          <div class="flex  w-full bg-cyan-950  items-stretch">
      <div class=" flex flex-col sm:flex-row  sm:flex-wrap">

        <SuggestedVideos />
      </div>
      </div>
</template>