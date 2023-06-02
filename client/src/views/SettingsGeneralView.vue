<script setup>
import Toggle from '@vueform/toggle'
import { watch, ref, computed } from 'vue'

const fnMarkerLabel = [
    { value: 0, label: '0' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 75, label: '76' },
    { value: 100, label: '100' }
]
const fontSizes = [
    { value: 1, label: 'xxs' },
    { value: 2, label: 'xs' },
    { value: 3, label: 'sm' },
    { value: 4, label: 'md' },
    { value: 5, label: 'lg' },
    { value: 6, label: 'xl' },
    { value: 7, label: 'xxl' },
    { value: 8, label: 'xxxl' },
]


watch(()=> window.glb.settings.fontSize, (val) => {
    console.log('setting font size', val)
    const vueRoot = window.document.body
    vueRoot.classList.remove(...fontSizes.map(e => 'reactive-text-'+e.value))
    vueRoot.classList.add('reactive-text-'+fontSizes[val-1].value)
})

</script>



<template>
    <div class="generalWindow m-6 sm:m-16 p-2 sm:p-6 rounded themed-bg-secondary themed-text-xs">
        <div class="col-item effects">
            <div class="left-grow">Start Muted</div>
            <q-toggle v-model="window.glb.settings.startMuted" class="toggle-red" />
        </div>
        <div class="col-item effects">
            <div class="left-grow">Auto Translate</div>
            <q-toggle v-model="window.glb.settings.translationOn" class="toggle-red" />
        </div>
        <div class="col-item effects " :class="!window.glb.settings.translationOn ? 'disabled' : ''">
            <div class="left-grow ">
                Translation Language
            </div>
            <div class="bg-red-400 center-cross space-x-2 flex p-1 px-2 rounded btn" @click="window.glb.openSelectLang({ multiselect: false, startingPoint: null }, (e) => {
                window.glb.settings.translationLanguage = e.languagecode
            })">
                <div class="">
                    {{ window.glb.settings.translationLanguage }}
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>
        <div class="col-item effects">
            <div>Volume</div>
            <q-slider class="px-6" v-model="window.glb.settings.volume" :color="window.glb.dark ? 'white' : 'black'" markers
                :marker-labels="fnMarkerLabel" :min="0" :step="10" :max="100" />
        </div>
        <div class="col-item effects">
            <div>Font Size</div>
            <q-slider class="px-6 text-xs" v-model="window.glb.settings.fontSize" :color="window.glb.dark ? 'white' : 'black'"
                markers :marker-labels="fontSizes" :min="1" :step="1" :max="8" />
        </div>
    </div>
</template>