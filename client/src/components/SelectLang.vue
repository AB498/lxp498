<script setup>
import langsImp from "../assets/json/langs_out.json";
import { nextTick, ref, watch } from 'vue';
import { onMounted } from 'vue';
const Fuse = window.Fuse;
const { Index } = window.FlexSearch;

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
const langsOrg = ref(langs.value.sort((a, b) => {
    if (a.languagename < b.languagename) return -1;
    if (a.languagename > b.languagename) return 1;
    return 0;
}));
const langSearchText = ref('');
const searchInput = ref(null);
const searchLoading = ref(false);

// fuzzy
const index = new FlexSearch.Index(
    {
        tokenize: "full",
        resolution: 9,
    }
);
for (let i = 0; i < langsOrg.value.length; i++) {
    index.add(i, langsOrg.value[i].languagename
        + ' ' + langsOrg.value[i].languagecode
        + ' ' + langsOrg.value[i].countrycodes.join(' ')
        + ' ' + langsOrg.value[i].countrynames.join(' '));
}

async function searchLang() {

    searchLoading.value = true
    if (langSearchText.value.trim() == '') {
        langs.value = langsOrg.value
        searchLoading.value = false

        return;
    }


    let results = index.search(langSearchText.value)
    console.log(results); // Array of search results

    let fuzzyResultSorted2 = results.map(idx => {
        return langsOrg.value[idx];
    })

    langs.value = fuzzyResultSorted2;

    searchLoading.value = false;


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
watch(() => window.glb.settings.showSelectLangModal, () => {
    nextTick(() => {
        searchInput.value.focus();
    })
})
</script>

<template>
                    <div :class="window.glb.settings.showSelectLangModal && 'opacity-100 pointer-events-auto' || 'opacity-0 pointer-events-none'"
                                        class="absolute z-50 flex flex-col items-center justify-center bg-red-300/25 w-screen h-screen top-0 left-0 overflow-hidden transition-all backdrop-blur-sm">
                                        <!-- v-click-outside="clcOut" -->
                                        <div class="h-5/6 flex flex-col bg-slate-900 overflow-auto rounded sm:w-96 w-[80%]" v-click-outside="clcOut">
                                            <!-- <input type="text" class="w-full h-full p-4 bg-gray-700" placeholder="Search language"
                        v-model="langSearchText" @input="searchLang" ref="searchInput"> -->
                                            <q-input dark filled v-model="langSearchText" @update:model-value="searchLang" ref="searchInput"
                                                class="p-2 w-full sticky top-0 bg-gray-900/75 backdrop-blur-sm" placeholder="Search language"
                                                :loading="searchLoading" />
                                            <div class="flex flex-col space-y-2 p-2">
                                                <div v-for="(lang, index) in langs" :key="index" :ref="(el) => task(el, lang)" @click="toggle(index)"
                                                    class="flex p-2 space-x-2 items-center hov rounded bg-blue-950 effects">
                                                    <input type="checkbox" name="lang" :id="lang.languagecode" :checked="lang.checked" class="w-4 h-4 ">
                                                    <img class="rounded-full w-6 h-6" :src="'https://flagcdn.com/h60/' + lang.countrycodes[0] + '.png'" />
                                                    <div class="flex flex-col items-start justify-center overflow-hidden">
                                                        <div>
                                                            {{ lang.languagename }} ({{ (lang.languagecode).toUpperCase() }})
                                                        </div>
                                                        <div class="flex overflow-auto space-x-1">
                                                            <div v-for="countrycode in lang.countrycodes.slice(1, lang.countrycodes.length)"
                                                                class="w-4 h-4">
                                                                <img class="rounded-full w-full h-full"
                                                                    :src="'https://flagcdn.com/h60/' + countrycode + '.png'" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="grow"></div>
                                            <div class="sticky bottom-0 w-full p-2 bg-red-900 flex items-stretch justify-center ">
                <div class="basis-full flex items-center justify-center" @click="clcOut">Cancel</div>
                <div class="basis-full flex items-center justify-center btn" @click="select">Select</div>
            </div>
        </div>
    </div>
</template>