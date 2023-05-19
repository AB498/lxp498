<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import axios from 'axios'
import SelectLang from '../components/SelectLang.vue'

import langImp from "@/assets/json/langs_out.json";

console.log('langImp', langImp)
const langPrgs = ref([]);


langPrgs.value = window.glb.user.stats.languages;
console.log(langPrgs.value)

async function addProgressCallback(selectedLang) {

    let [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/createProgress", {
        language: selectedLang
    }, {
        headers: {
            Authorization: "Bearer " + window.glb.jwt,
        }
    }));

    if (err || !res) {
        window.glb.addNotf(window.glb.errorMessages(err))
        return;
    }

    await window.glb.reloadUser();
    langPrgs.value = window.glb.user.stats.languages;

    // router.push("/progress/" + window.glb.selectedLang)

}

</script>


<template>
    <div class="w-full h-full flex overflow-auto">
        <div class="w-full h-full flex overflow-auto">
            <SelectLang />

            <div class="flex flex-col h-full basis-1/12 bg-slate-600 center-cross py-4 space-y-2 ">
                <div v-for="( [key, langPrg], index ) in Object.entries(langPrgs)" :key="cons(langPrg.language)">

                    <RouterLink :to="'/progress/' + langPrg.language">
                        <div class="    flex flex-col space-x-2 center-cross">
                            <img :src="'https://flagcdn.com/256x192/' + Object.values(langImp).find(l => l.iso6393 == langPrg.language).countrycodes[0] + '.png'"
                                class="w-10 h-10" />
                            <div class="text-2xl text-white">{{ langPrg.language }}</div>
                        </div>
                    </RouterLink>
                </div>
                <i class="fa fa-plus-circle fa-2x text-red-500 effects outline outline-1 outline-blue-400 rounded-full"
                    @click="window.setTimeout(() => { window.glb.selectLang(addProgressCallback) }, 0)"></i>
            </div>
            <div class="flex flex-col h-full basis-11/12 bg-slate-800 overflow-auto">
                <RouterView class="overflow-auto"></RouterView>
            </div>
        </div>
    </div>
</template>