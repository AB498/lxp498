
<script setup>
import RadialProgressBar from "vue3-radial-progress";

import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '@/../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig)

const mdBreakpoint =parseInt(fullConfig.theme.screens.md.replace('px',''))
const smBreakpoint =parseInt(fullConfig.theme.screens.sm.replace('px',''))

const props = defineProps({
    quizInc: {
        type: Object,
        required: true
    }
})

const prg = ref(props.quizInc)

const totalSteps = ref(prg.value.quizzes.length)
const completedSteps = ref(0)




</script>



<template>
    <div class="center">
        <div class=" h-full themed-bg-tertiary center flex flex-col m-4 w-full rounded effects px-6 py-4">
            <div class=" text-sm sm:text-2xl">{{ 'Level: ' + prg.difficulty }}</div>
            <div class="flex sm:space-x-8 w-full center">
                <div class="flex  flex-col">
                    <div class="text-sm sm:text-xl ">{{ 'Words learned' }}</div>
                    <div class="text-xs sm:text-sm ">{{ 'Remaining' }}</div>
                </div>
                <RadialProgressBar :diameter="window.glb.screenWidth > smBreakpoint? 150 : 70"
                    :strokeWidth="window.glb.screenWidth > smBreakpoint?10 : 3" 
                    :innerStrokeWidth="window.glb.screenWidth > smBreakpoint? 10 : 3"
                     :completed-steps="prg.words.length" :total-steps="prg.quizzes.length">
                    <div class=" text-sm sm:text-2xl">
                        {{ prg.words.length }} / {{ prg.quizzes.length }}
                    </div>
                </RadialProgressBar>
            </div>


        </div>
    </div>
</template>