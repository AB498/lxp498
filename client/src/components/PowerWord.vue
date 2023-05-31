<script setup>
import { onMounted, ref, watch } from 'vue';
const props = defineProps({
    wordInc: Object
})
const word = ref(props.wordInc);

// word.value.active = false;
// word.value.el = null;

// word.value.id = (window.glb.uuidv4());


let kvp = ref(word.value.sourceLang + '-' + (word.value.targetLang||'en'))
if (!window.glb._nonPersistant.wordTranslationStream[kvp.value])
    window.glb._nonPersistant.wordTranslationStream[kvp.value] = {}
// word.value.translated = ref(false)
onMounted(() => {
    // if (word.value.translatedWord) return;
    // window.glb._nonPersistant.wordTranslationStream[kvp.value][word.value.id] = word;
})


</script>

<template>
    <div :class="word.active ? 'bg-blue-600' : 'themed-bg-secondary'"
        class="h-full px-1 rounded border-b-2 flex flex-col sm:min-w-[50px] text-md sm:text-lg">
        <div class="mainWord shrink-0 center h-1/2">
            {{ word.word }}
        </div>
        <div class="mainWord shrink-0 themed-text-secondary center h-1/2 text-xs sm:text-md">
            {{ word.hideTranslation && '...' || word.translatedWord   }} 
        </div>
    </div>
</template>