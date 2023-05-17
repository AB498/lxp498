
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
    <div class="w-full  bg-red-900 center">
        <div class=" h-full bg-blue-600 center flex flex-col m-4 w-3/4 rounded effects px-6 py-4 text-sm">
            <div class=" text-white">{{ 'Level: ' + quiz.difficulty }}</div>
            <div class="flex space-x-16 w-full center">
                <div class="flex  flex-col">
                    <div class=" text-white">{{ quiz.id }}</div>
                    <div class=" text-white">{{ 'Words learned' }}</div>
                    <div class=" text-white">{{ 'Remaining' }}</div>
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