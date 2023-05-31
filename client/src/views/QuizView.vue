<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import { computed } from 'vue'
import ProgressQuiz from '@/components/ProgressQuiz.vue'
import QuizWord from '@/components/QuizWord.vue'
import PowerWord from '@/components/PowerWord.vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';
import Vivus from 'vivus';
import anime from 'animejs/lib/anime.es.js';

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

let kvp = ref(window.glb._nonPersistant.quizView.language.languagecode + '-' + (window.glb.settings.targetLang || 'en'))

if (!window.glb._nonPersistant.wordTranslationStream[kvp.value])
    window.glb._nonPersistant.wordTranslationStream[kvp.value] = {}

watch([i, firstLoad], () => {
    quiz.value = incPrg.quizzes[i.value];
    words.value = incPrg.quizzes[i.value].words

    words.value[quiz.value['difficulty' + incPrg.difficulty ]].active = true
    words.value[quiz.value['difficulty' + incPrg.difficulty]].hideTranslation = true
    words.value.find((w, i) => {
        if (typeof w == 'undefined')
        cnsole.log('undefined', i)
        return typeof w == 'undefined'
    })

    options.value = [words.value[quiz.value['difficulty' + incPrg.difficulty]]]
    for (let i = 0; i < 3; i++) {
        let randquiz = incPrg.quizzes[window.glb.randInt(0, incPrg.quizzes.length - 1)];
        options.value.push(randquiz.words[window.glb.randInt(0, randquiz.words.length - 1) ])
    }
    options.value=options.value.map((o, i)=>({word: o, correct: i==0}))
    options.value = window.glb.shuffle(options.value)
    quiz.value.selected = {};

})



let promises = []
onMounted(async () => {

    quiz.value = incPrg.quizzes[i.value];
    incPrg.quizzes.forEach((e) => {

        let wds = e.text.split(' ').map(s => ({ word: s }))
        e.words = wds;
        e.words.forEach(async w => {
            w.id = window.glb.uuidv4()
            promises.push(window.glb.putTranslation(kvp.value, w))
        })

    })

    await Promise.all(promises)

    i.value = 0;
    firstLoad.value = false;

})

function selectAnswer(option) {
    quiz.value.selected = option;
}
const resultShowing = ref(false);
const correctAnswer = ref(false);
function showResults() {
console.log(incPrg.quizzes.length, i.value)
    if (options.value.find(o => o.green)) {
        if (i.value+1 >= incPrg.quizzes.length) {
            console.log('go back')
            router.go(-1)
            return
        }
        i.value += 1;
        return
     }
    if (quiz.value.selected?.correct) {
        resultShowing.value = true
        if (!incPrg.words.includes(quiz.value.selected.word.word))
            incPrg.words.push(quiz.value.selected.word.word)
        continueCallback.value = () => {
            resultShowing.value = false
            if (i.value +1 >= incPrg.quizzes.length) {
                router.go(-1)

                return
            }
            i.value += 1;
        }
    } else {
        //hightlight correct 
        options.value.forEach(o => {
            if (o.correct) {
                o.green = true
                o.word.hideTranslation = false
            }
        })
        nextTick(() =>
        {
 

            anime({
                targets: '.answer-reveal',
                translateX: ['-.25rem', '.25rem', '0rem'],
                duration: 50,
                direction: 'alternate',
                loop: 4,
                easing: 'easeOutBack',
            });
        })
    }

    window.glb.safeAuthedReq('/api/submitLearnedWords', {
        words: incPrg.words,
        language: window.glb._nonPersistant.quizView.language.languagecode,
        difficulty: incPrg.difficulty
    })
}

const continueCallback = ref(() => { })
import DoneJSON from '@/assets/done.json'




</script>
<template>
    <div class="full relative  bg-transparent center-cross flex flex-col overflow-auto " v-if="quiz">
        <div class="absolute p-4 flex-col backdrop-blur-xl z-10 full bg-red-300/50 center space-y-4" v-if="resultShowing">
            <Vue3Lottie :speed="2" :animationData="DoneJSON" class="w-16 h-16" :loop="false" />
            <div class="text-3xl">Correct!</div>
            <div class="btn text-3xl" @click="continueCallback">Continue</div>
        </div>
        <div class="sticky top-0 w-full themed-bg-tertiary shadow center h-10">
            {{ 'Completed ' + i + '/' + incPrg.quizzes.length }}
        </div>
        <br>

        <div class="flex flex-wrap center" v-if="words.length > 0">
            <div v-for="(word, index) in words" class="p-2" :key="uuidv4()">
                <PowerWord :word-inc="word" />
            </div>
        </div>

        <br>
        <div class="flex flex-col" v-if="options.length > 0">
            <div v-for="(option, index) in options.slice(0, 4)" class="min-w-[200px] center m-2 p-2 border-2 shadow rounded-full " :key="uuidv4()"
                :class="option.green?'answer-reveal bg-green-400' :(quiz.selected == option  ?'bg-blue-300':' themed-bg-secondary' )" @click="selectAnswer(option)">
                {{ option.word?.translatedWord || 'undefined' }}
            </div>
        </div>
        <!-- <div>
            {{ 'Selected ' + quiz.selected?.correct }}
        </div> -->
        <div class="grow"></div>
        <div class="flex space-x-2 p-2 ">
            <div class="btn effects" @click="i!=0 && i--">
                Previous
            </div>
            <div class="btn effects" @click="showResults()">
                Next
            </div>
        </div>
    </div>
</template>