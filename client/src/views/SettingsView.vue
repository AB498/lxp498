<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import Toggle from '@vueform/toggle'
import SelectLang from '../components/SelectLang.vue';


if (!window.glb.settings.showingWindow)
  window.glb.settings.showingWindow = 0

if (!window.glb.settings.startMuted)
  window.glb.settings.startMuted = false

if (!window.glb.settings.translationOn)
  window.glb.settings.translationOn = false


let toggleStyle = {
  container: 'inline-block rounded-full outline-none focus:ring focus:ring-green-500 focus:ring-opacity-30',
  toggle: 'flex w-12 h-5 rounded-full relative cursor-pointer transition items-center box-content border-2 text-xs leading-none',
  toggleOn: 'bg-red-700 border-green-500 justify-start ',
  toggleOff: 'bg-gray-400 border-gray-100 justify-end ',
  toggleOnDisabled: 'bg-gray-300 border-gray-200 justify-start  cursor-not-allowed',
  toggleOffDisabled: 'bg-gray-200 border-gray-200 justify-end  cursor-not-allowed',
  handle: 'inline-block bg-white w-5 h-5 top-0 rounded-full absolute transition-all',
  handleOn: 'left-full transform -translate-x-full',
  handleOff: 'left-0',
  handleOnDisabled: 'bg-gray-100 left-full transform -translate-x-full',
  handleOffDisabled: 'bg-gray-100 left-0',
  label: 'text-center w-8 border-box whitespace-nowrap select-none',
}

</script>
<template>
  <div class="w-full h-full ">
    <div class="flex flex-row h-full w-full">

      <div class="flex flex-col basis-1/4 themed-bg-secondary shadow border-r-2 h-full ">
        <div class="general col-item btn">General</div>
        <div class="general col-item btn">Account</div>
        <div class="general col-item btn">Privacy</div>
      </div>
      <div class="flex flex-col basis-3/4 h-full ">
        <div class="generalWindow m-10 p-6 rounded " v-if="window.glb.settings.showingWindow == 0">
          <div class="col-item effects">General</div>
          <div class="col-item effects">
            <div class="left-grow">Start Muted</div>
            <Toggle :classes="toggleStyle" v-model="window.glb.settings.startMuted" class="toggle-red" />
          </div>
          <div class="col-item effects">
            <div class="left-grow">Auto Translate</div>
            <Toggle :classes="toggleStyle" v-model="window.glb.settings.translationOn" class="toggle-red" />
          </div>
          <SelectLang />
          <div class="col-item effects">
            <div class="left-grow">
              Select Translation Language
            </div>
            <div class="bg-red-400 p-1 px-2 rounded btn"
              @click="window.setTimeout(() => { window.glb.settings.showSelectLangModal = true }, 0)">
              <i class="fas fa-chevron-down"></i> {{ window.glb.settings.targetTranslationLang }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
