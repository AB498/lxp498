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
const langsOrg = ref(JSON.parse(JSON.stringify(langs.value)));
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
    let selected;
    if (!multiselect.value) {
        selected = -1;
        for (let i = 0; i < langs.value.length; i++) {
            if (langs.value[i].checked) {
                selected = langsOrg.value.findIndex(e => e.languagecode == langs.value[i].languagecode);
                console.log(selected)
                break;
            }
        }
    } else {
        selected = langs.value.filter((e) => e.checked)
    }
    if (window.glb.isIterable(selected)) {
        selected = langsOrg.value.filter(l => {
            if (selected.find(e => e.languagecode == l.languagecode))
                return true;
        }).map(e => ({ ...e }))
        onSelectFunction.value(selected);
    }
    else {

        onSelectFunction.value(selected != -1 && langsOrg.value[selected]);
    }
}
function task(el, lang) {
    lang.el = el;
    // console.log(lang)
}
const multiselect = ref(false)
function toggle(i) {
    console.log(langs.value[i])
    langs.value[i].checked = !langs.value[i].checked;
    if (!multiselect.value)
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
let onSelectFunction = ref(() => { });

window.glb.openSelectLang = (opts, cb) => {
    const { multiselect: multiselecti, startingPoint } = opts || {}
    langs.value.forEach(element => {
        let sel = startingPoint?.find(l => l.languagecode == element.languagecode)
        if (sel)
            element.checked = true;
        else
            element.checked = false
    });

    multiselect.value = false;
    if (multiselecti) multiselect.value = multiselecti;
    setTimeout(() => {
        window.glb.settings.showSelectLangModal = true
    }, 0);
    onSelectFunction.value = cb;
}
</script>

<template>
    <div :class="window.glb.settings.showSelectLangModal && 'opacity-100 pointer-events-auto' || 'opacity-0 pointer-events-none'"
        class="absolute z-50 flex flex-col items-center justify-center bg-pink-700/25 w-screen h-screen top-0 left-0 overflow-hidden transition-all backdrop-blur-sm">
        <!-- v-click-outside="clcOut" -->
        <div class="h-5/6 flex flex-col border themed-bg-primary overflow-auto rounded sm:w-96 w-[80%] relative"
            v-click-outside="clcOut">
            <!-- <input type="text" class="w-full h-full p-4 bg-gray-700" placeholder="Search language"
                        v-model="langSearchText" @input="searchLang" ref="searchInput"> -->
            <q-input :dark="window.glb?.dark" filled v-model="langSearchText" @update:model-value="searchLang" ref="searchInput"
                class="p-2 w-full sticky top-0 themed-bg-secondary backdrop-blur-sm z-10" placeholder="Search language "
                :loading="searchLoading" />
            <div class="flex flex-col space-y-3 px-4 ">
                <div v-for="(lang, index) in langs" :key="index" :ref="(el) => task(el, lang)" @click="toggle(index)"
                    class=" flex p-2 items-center rounded  relative cursor-pointer" v-ripple
                    :class="lang.checked && 'bg-blue-700' || 'themed-bg-secondary'">
                    <img class="rounded-full w-6 h-6 mx-3"
                        :src="'https://flagcdn.com/h60/' + lang.countrycodes[0] + '.png'" />
                    <div class="flex flex-col items-start justify-center overflow-hidden ">
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
            <div class="sticky bottom-0 w-full p-2 themed-bg-tertiary flex items-stretch justify-center ">
                <div v-ripple class="hover-ripple basis-full flex items-center justify-center cursor-pointer"
                    @click="clcOut">Cancel</div>
                <div v-ripple class="hover-ripple basis-full flex items-center justify-center btn" @click="select">Select
                </div>
            </div>
        </div>
    </div>
</template>