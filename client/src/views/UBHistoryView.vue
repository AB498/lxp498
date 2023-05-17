<script setup>
import VideoCardHorizontal from '../components/VideoCardHorizontal.vue';



let res = window.vue.ref();

window.vue.onMounted(async () => {
    res.value = await window.glb.safeAuthedReq('/api/uploadbase/getHistory');
});


</script>


<template>
    <div class="w-full h-full bg-cyan-900 overflow-auto break-words p-8 space-y-4">
        <div v-for="(video, index) in res">
            <VideoCardHorizontal @click="$router.push('/uploadbase/watch/' + video.id)" :video="video.UBVideo"
                class="w-96 border" />
        </div>
    </div>
</template>