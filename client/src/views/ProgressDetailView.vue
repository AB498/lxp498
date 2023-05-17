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

const initialLoad = ref(true)

const quizzes = ref([])//window.glb.tryParseJSON(incPrg.data).quizzes
window.glb._nonPersistant.quizView = {}
watch([() => route.params.id, initialLoad], async () => {
    if (initialLoad.value)
        console.log('lang', lang.value, 'route.params.id', route.params.id, 'route.path', route.path)
    const [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/getProgress",
        { language: lang.value }, {
        headers: { Authorization: "Bearer " + window.glb.jwt }
    }));
    if (err || !res) {
        window.glb.addNotf(window.glb.errorMessages(err))
        return;
    }
    const data = res.data;
    console.log(data)
    quizzes.value = data
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
    <div class="w-full  bg-red-900 center-cross flex flex-col ">

        <div v-for="(quiz, index) in quizzes" :key="quiz.id" class="w-full font-poppins"
            v-if="route.path == '/progress/' + route.params.id">
            {{ ' dnafobaeifsol' }}
            <ProgressQuiz :quiz-inc="quiz" @click="() => { router.push(lang + '/' + quiz.id) }" />
        </div>
        <div v-if="window.glb._nonPersistant.quizView.quizzes">
            <RouterView class="w-full overflow-auto" />
        </div>
    </div>
</template>