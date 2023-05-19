<script setup>
import langsImp from "../assets/json/langs_out.json";
import { nextTick, ref } from 'vue';
const Fuse = window.Fuse;

let langs = ref(Object.entries(langsImp).map(([key, value]) => {
    return {
        languagecode: value['languagecode'],
        languagename: value['languagename'],
        countrynames: value['countrynames'],
        countrycodes: value['countrycodes'],
        isocode: value['isocode'],
    };
}).sort((a, b) => {
    if (a.languagename < b.languagename) return -1;
    if (a.languagename > b.languagename) return 1;
    return 0;
}))
const langsOrg = ref(langs.value);
const langSearchText = ref('');
function searchLang() {

    if (langSearchText.value.trim() == '') {
        langs.value = langsOrg.value.sort((a, b) => {
            if (a.languagename < b.languagename) return -1;
            if (a.languagename > b.languagename) return 1;
            return 0;
        });
        return;
    }

    const options = {
        includeScore: true,
        keys: ['languagename', 'languagecode', 'countrycodes', 'countrynames'],
    }

    const fuse = new Fuse(Object.entries(langsOrg.value).map(obj => obj[1]), options);

    // Change the pattern
    const pattern = langSearchText.value;

    let fuzzyResult = (fuse.search(pattern))

    let fuzzyResultSorted = fuzzyResult.sort((a, b) => {
        if (a.score < b.score) return -1;
        if (a.score > b.score) return 1;
        return 0;
    })

    let fuzzyResultSorted2 = fuzzyResultSorted.map(obj => obj.item)

    langs.value = fuzzyResultSorted2;


}
async function select() {
    window.glb.settings.showSelectLangModal = false;
    let selected = -1;
    for (let i = 0; i < langs.value.length; i++) {
        if (langs.value[i].checked) {
            selected = i;
            break;
        }
    }
    if (selected == -1) return;
    window.glb.settings.targetTranslationLang = langs.value[selected].languagecode;
    window.glb.selectedLang = langs.value[selected].languagecode;
    window.glb.selectLangCallback(langs.value[selected].languagecode);
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

function clcOut() {
    if (window.glb.settings.showSelectLangModal) window.glb.settings.showSelectLangModal = false;
}
</script>

<template>
    <div :class="window.glb.settings.showSelectLangModal && 'opacity-100 pointer-events-auto' || 'opacity-0 pointer-events-none'"
        class="absolute z-50 flex flex-col items-center justify-center bg-red-300/25 w-screen h-screen top-0 left-0 overflow-hidden transition-all">
        <!-- v-click-outside="clcOut" -->
        <div class="h-5/6 bg-slate-900 overflow-auto rounded sm:w-96 w-[80%]" v-click-outside="clcOut">
            <div class="w-full h-12 p-2 sticky top-0   bg-slate-900">
                <input type="text" class="w-full h-full  bg-gray-700" placeholder="Search language" v-model="langSearchText"
                    @input="searchLang">
            </div>
            <div v-for="(lang, index) in langs" :key="index" :ref="(el) => task(el, lang)" @click="toggle(index)"
                class="flex p-2 space-x-2 items-center hov rounded bg-blue-950 m-2 effects">
                <input type="checkbox" name="lang" :id="lang.languagecode" :checked="lang.checked" class="w-4 h-4">
                <img class="rounded-full w-6 h-6" :src="'https://flagcdn.com/h60/' + lang.countrycodes[0] + '.png'" />
                <div class="flex flex-col items-start justify-center overflow-hidden">
                    <div>
                        {{ lang.languagename }} ({{ (lang.languagecode).toUpperCase() }})
                    </div>
                    <div class="flex overflow-auto space-x-1">
                        <div v-for="countrycode in lang.countrycodes.slice(1, lang.countrycodes.length)" class="w-4 h-4">
                            <img class="rounded-full w-full h-full"
                                :src="'https://flagcdn.com/h60/' + countrycode + '.png'" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full sticky bottom-0 p-2 bg-red-900 flex items-stretch justify-center">
                <div class="basis-full flex items-center justify-center" @click="clcOut">Cancel</div>
                <div class="basis-full flex items-center justify-center btn" @click="select">Select</div>
            </div>
        </div>
    </div>
</template>