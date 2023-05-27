<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import { computed } from 'vue'
import ProgressQuiz from '@/components/ProgressQuiz.vue'
import QuizWord from '@/components/QuizWord.vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';
import Vivus from 'vivus';

const route = useRoute()
const router = useRouter()
const lang = computed(() => route.params.quizId)
const incPrg = window.glb._nonPersistant.quizView.quizzes.find(l => l.id == route.params.quizId)
console.log(window.glb._nonPersistant.quizView.quizzes.map(e => e.id), route.params.quizId)
const i = ref(-1)
const sentence = ref('')
const words = ref([])
const options = ref([])
const quiz = ref(null)
const firstLoad = ref(true)
watch(incPrg, () => {
    console.log('incPrg', incPrg)
})
console.log('qv', incPrg)
watch([i, firstLoad], () => {
    console.log('qv', incPrg)
    quiz.value = incPrg.quizzes[i.value];
    words.value = quiz.value.text.split(' ').map((w, i) => ({ word: w, active: (i == quiz.value['difficulty' + incPrg.difficulty]) }))
    options.value = quiz.value.text.split(' ').map((w, i) => ({ word: w, active: (i == quiz.value['difficulty' + incPrg.difficulty]) }))
    // console.log(quiz.value.text.split(' ')[quiz.value['difficulty' + incPrg.difficulty]], quiz.value.text)

})
i.value = 0;
firstLoad.value = false;


function selectAnswer(index) {
    quiz.value.selected = index;
    console.log(quiz.value.selected)
}
const resultShowing = ref(false);
const correctAnswer = ref(false);
function showResults() {
    if (correctAnswer.value) {
        resultShowing.value = true
        continueCallback.value = () => {
            resultShowing.value = false
            i.value += 1;
        }
    } else {
        //hightlight correct 

        
    }

}

const continueCallback = ref(() => { })
import DoneJSON from '@/assets/done.json'
</script>
<template>
    <div class="full relative  bg-slate-900 center-cross flex flex-col  border-2" v-if="quiz">
        <div class="absolute flex-col backdrop-blur-xl z-10 full bg-red-300/50 center space-y-4" v-if="resultShowing">
            <Vue3Lottie :animationData="DoneJSON" class="w-16 h-16" :loop="false" />
            <div class="text-3xl">Correct!</div>
            <div class="btn text-3xl" @click="continueCallback">Continue</div>
        </div>
        <div class="w-full bg-slate-500 center h-10">
            {{ 'Completed ' + i + '/' + incPrg.quizzes.length }}
        </div>
        <div class="flex flex-wrap center" v-if="words.length > 0">
            <div v-for="(word, index) in words" class="p-2" :key="uuidv4()">
                <QuizWord :word-inc="word" />
            </div>
        </div>

        <div class="flex flex-col" v-if="options.length > 0">
            <div v-for="(option, index) in options.slice(0, 4)" class="m-2 btn effects" :key="uuidv4()"
                :class="quiz.selected == index && 'bg-red-600'" @click="selectAnswer(index)">
                {{ option.word }}
            </div>
        </div>
        <div>
            {{ 'Selected ' + quiz.selected }}
        </div>
        <div class="grow"></div>
        <div class="flex space-x-2 p-2 sticky bottom-0">
            <div class="btn effects" @click="i--">
                Previous
            </div>
            <div class="btn effects" @click="showResults()">
                Next
            </div>
        </div>
    </div>
</template>