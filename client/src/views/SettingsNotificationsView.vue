<script setup>
import ComingSoon from '@/assets/coming-soon.json'

</script>



<template>
        <div class="full relative">
            <div class="absolute z-10 backdrop-blur-[2px]  full bg-red-300/50 center p-6 sm:p-32">
                <Vue3Lottie :speed="1" :animationData="ComingSoon" class="w-16 h-16" :loop="true" />
            </div>
            <div class="generalWindow m-6 sm:m-16 p-2 sm:p-6 rounded themed-bg-secondary">
                <div class="col-item effects">
                    <div class="left-grow">Start Muted</div>
                    <q-toggle v-model="window.glb.settings.startMuted" class="toggle-red" />
                </div>
                <div class="col-item effects">
                    <div class="left-grow">Auto Translate</div>
                    <q-toggle v-model="window.glb.settings.translationOn" class="toggle-red" />
                </div>
            </div>
        </div>
</template>``