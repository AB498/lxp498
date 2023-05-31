<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import axios from 'axios'
import SelectLang from '../components/SelectLang.vue'


const route = useRoute()
const router = useRouter()
import langImp from "@/assets/json/langs_out.json";

console.log('langImp', langImp)
const langPrgs = ref([]);


onMounted(async () => {

    await window.glb.reloadUser();
    langPrgs.value = window.glb.user.stats?.languages;
})
async function addProgressCallback(selectedLang) {
    console.log(selectedLang.languagecode)
    let [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/createProgress", {
        language: selectedLang.languagecode
    }, {
        headers: {
            Authorization: "Bearer " + window.glb.jwt,
        }
    }));

    if (err || !res) {
        console.log((err))
        return;
    }

    await window.glb.reloadUser();
    langPrgs.value = window.glb.user.stats.languages;

    // router.push("/progress/" + window.glb.selectedLang)

}
const tab = ref('mails')

</script>


<template>
    <div class="   flex overflow-auto">
        <div class="w-full h-full flex ">

            <div class="flex flex-col h-full basis-1/12  ">
                <q-tabs vertical v-model="tab" dense align="left" class="themed-bg-secondary  shadow-2 w-full "
                    :breakpoint="0">
                    <div v-for="( [key, langPrg], index ) in Object.entries(langPrgs)" :key="(langPrg.language)">
                        <q-tab :name="langPrg.language" @click="router.push('/progress/' + langPrg.language)">
                            <div class=" flex flex-col space-x-2 center-cross">
                                <img :src="'https://flagcdn.com/256x192/' + Object.values(langImp).find(l => l.iso6393 == langPrg.language).countrycodes[0] + '.png'"
                                    class="w-6 h-6" />
                                <div class="text-sm ">{{ langPrg.language }}</div>
                            </div>
                        </q-tab>
                    </div>
                    <div class="w-full center p-2">

                        <q-icon name="add"
                            class="text-3xl self-center effects outline outline-3 outline-blue-400 rounded-full"
                            @click="window.glb.openSelectLang(null, addProgressCallback)"></q-icon>
                    </div>
                </q-tabs>

            </div>
            <div class="center full basis-11/12" v-if="route.path == '/progress'">
                <div class="flex flex-col p-3 sm:p-16 themed-bg-tertiary rounded-xl center-cross">
                    <div class="text-2xl">Select a language</div>
                    <div class="text-xl">to see your progress</div>
                </div>
            </div>
            <div v-else class="flex flex-col full basis-11/12  ">
                <RouterView class=" full"></RouterView>
            </div>
        </div>
    </div>
</template>