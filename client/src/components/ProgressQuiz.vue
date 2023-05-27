
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

const quiz = ref(props.quizInc)

const totalSteps = ref(quiz.value.quizzes.length)
const completedSteps = ref(0)

</script>



<template>
    <div class="bg-red-900 center" >
        <div class=" h-full bg-blue-600 center flex flex-col m-4 w-full rounded effects px-6 py-4">
            <div class=" text-white text-2xl">{{ 'Level: ' + quiz.difficulty }}</div>
            <div class="flex space-x-8 w-full center">
                <div class="flex  flex-col">
                    <div class="text-xl text-white">{{ 'Words learned' }}</div>
                    <div class="text-sm text-white">{{ 'Remaining' }}</div>
                </div>
                <RadialProgressBar :diameter="150" :completed-steps="completedSteps" :total-steps="totalSteps" te>
                    <div class="text-2xl">
                        {{ completedSteps }} / {{ totalSteps }}
                    </div>
                </RadialProgressBar>
            </div>


        </div>
    </div>
</template>