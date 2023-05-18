<script setup>
import langsImp from "../assets/json/countries_out.json";
import { nextTick, ref } from 'vue';
import { watch } from 'vue';
import { defineProps } from 'vue';
import { useMainStore } from '@/stores/mainStore'
import glb from "@/composables/glb";

const mainStore = useMainStore()



const props = defineProps({
    showModal: Boolean
})
mainStore.showLangModal = false;
let activated = ref(mainStore.showLangModal);
function clcOut() {
    if (activated.value) mainStore.showLangModal = false;
}
watch(() => mainStore.showLangModal, (val, old) => {
    if (val) {
        setTimeout(() => {
            activated.value = true;
        }, 0);
    }
    else {
        activated.value = false;

    }
})
let langs = ref(langsImp);
async function vote() {
    mainStore.showLangModal = false;
    let selected = -1;
    for (let i = 0; i < langs.value.length; i++) {
        if (langs.value[i].checked) {
            selected = i;
            break;
        }
    }
    if (selected == -1) return;
    let res = await fetch(glb.baseUrl + "/api/videos/lang/vote",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + mainStore.getToken
            },
            body: JSON.stringify(
                {
                    "ytId": glb.videoId,
                    "lang": langs.value[selected].languagecode,
                    "voter": glb.user.ownId
                }
            ),
        }
    )
    if (res.status == 200) {
        let data = await res.json();
        console.log(data);
    }
    else {
        console.log(res);
    }

    window.glb.updateRequired = window.glb.uuidv4()
}
function task(el, lang) {
    lang.el = el;
    // console.log(lang)
}

function toggle(i) {
    langs.value[i].checked = !langs.value[i].checked;
    for (let j = 0; j < langs.value.length; j++) {
        if (j != i) langs.value[j].checked = false;
    }
}

</script>

<template>
    <div :class="mainStore.showLangModal && 'opacity-100 pointer-events-auto' || 'opacity-0 pointer-events-none'"
        class="absolute z-50 flex flex-col items-center justify-center bg-red-300/25 w-screen h-screen top-0 left-0 overflow-hidden transition-all">
        <!-- v-click-outside="clcOut" -->
        <div class="h-5/6 bg-slate-900 overflow-auto rounded sm:w-80" v-click-outside="clcOut">
            <div class="w-full h-12 p-2 sticky top-0   bg-slate-900">
                <input type="text" class="w-full h-full  bg-gray-700" placeholder="Search language">
            </div>
            <div v-for="(lang, index) in langs" :key="index" :ref="(el) => task(el, lang)" @click="toggle(index)"
                class="flex p-2 space-x-2 items-center hov rounded bg-blue-950 m-2">
                <input type="checkbox" name="lang" :id="lang.code" :checked="lang.checked" class="w-4 h-4">
                <img class="rounded-full w-6 h-6" :src="'https://flagcdn.com/h60/' + lang.code + '.png'" />
                <div>
                    {{ lang.languagename }} ({{ (lang.code).toUpperCase() }})
                </div>
            </div>
            <div class="w-full sticky bottom-0 p-2 bg-red-900 flex items-stretch justify-center">
                <div class="basis-full flex items-center justify-center" @click="clcOut">Cancel</div>
                <div class="basis-full flex items-center justify-center btn" @click="vote">Vote</div>
            </div>
        </div>
    </div>
</template>