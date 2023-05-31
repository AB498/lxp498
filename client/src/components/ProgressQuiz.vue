
<script setup>
import RadialProgressBar from "vue3-radial-progress";

import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'

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
    <div class="center" >
        <div class=" h-full themed-bg-tertiary center flex flex-col m-4 w-full rounded effects px-6 py-4">
            <div class="  text-2xl">{{ 'Level: ' + prg.difficulty }}</div>
            <div class="flex space-x-8 w-full center">
                <div class="flex  flex-col">
                    <div class="text-xl ">{{ 'Words learned' }}</div>
                    <div class="text-sm ">{{ 'Remaining' }}</div>
                </div>
                <RadialProgressBar :diameter="150" :completed-steps="prg.words.length" :total-steps="prg.quizzes.length" >
                    <div class="text-2xl">
                        {{ prg.words.length }} / {{ prg.quizzes.length }}
                    </div>
                </RadialProgressBar>
            </div>


        </div>
    </div>
</template>