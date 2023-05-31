<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import { computed } from 'vue'
import ProgressQuiz from '@/components/ProgressQuiz.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const lang = computed(() => route.params.id)
const incPrg = window.glb.user.Progresses.find(l => l.language == route.params.id)
import langsImp from "../assets/json/langs_out.json";
let langs = ref(Object.entries(langsImp).map(([key, value]) => {
    return {
        languagecode: value['languagecode'],
        languagename: value['languagename'],
        countrynames: value['countrynames'],
        countrycodes: value['countrycodes'],
        isocode: value['isocode'],
        iso6391: value['iso6391'],
        iso6393: value['iso6393'],
    };
}))

const initialLoad = ref(true)
const progresses = ref([])//window.glb.tryParseJSON(incPrg.data).quizzes
window.glb._nonPersistant.quizView = {}
watch([() => route.params.id, initialLoad], async () => {
    if (initialLoad.value)
        console.log('lang', lang.value, 'route.params.id', route.params.id, 'route.path', route.path)
    const [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/getProgress",
        { language: langs.value.find(l => l.iso6393 == lang.value)?.iso6391 || null }, {
        headers: { Authorization: "Bearer " + window.glb.jwt }
    }));
    if (err || !res) {
        window.glb.addNotf(window.glb.errorMessages(err))
        return;
    }
    const data = res.data;
    console.log(data)
    progresses.value = data
    console.log("pval",progresses.value[0])
    window.glb._nonPersistant.quizView.language = langs.value.find(l => l.iso6393 == lang.value)
    window.glb._nonPersistant.quizView.quizzes = data
})

initialLoad.value = false;

onMounted(async () => {
})

const unwatch = ref(null);



onMounted(() => {

})




</script>




<template>
    <div class="full flex flex-col " v-if="window.glb._nonPersistant.quizView.language">

        <div class="sticky z-10 top-0 p-3 themed-bg-secondary shadow text-xl  flex center-cross">
            <div class="s center p-2 text-xl hover:bg-gray-600 hover-ripple rounded  mx-2 " @click="router.go(-1)">
                <q-icon name="arrow_back" class=""></q-icon>
            </div>
            <div class=" " @click="">
                {{ window.glb._nonPersistant.quizView.language.languagename }}
            </div>
        </div>
        <div class="full overflow-auto center-cross flex flex-wrap">

            <div v-for="(quiz, index) in progresses" :key="quiz.id" class="basis-full md:basis-1/2 "
                v-if="route.path == '/progress/' + route.params.id">
                <ProgressQuiz :quiz-inc="quiz" @click="() => { router.push(lang + '/' + quiz.id) }" class="" />
            </div>

            <div v-if="window.glb._nonPersistant.quizView.quizzes.find(l => l.id == route.params.quizId)" class="full " >
                <RouterView class="full " />
            </div>
        </div>
    </div>
</template>