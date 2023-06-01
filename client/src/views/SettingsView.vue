<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import SelectLang from '../components/SelectLang.vue';
import { useRouter, useRoute } from 'vue-router';


const router = useRouter()
const route = useRoute()

if (!window.glb.settings.showingWindow)
  window.glb.settings.showingWindow = 0

if (!window.glb.settings.startMuted)
  window.glb.settings.startMuted = false

if (!window.glb.settings.translationOn)
  window.glb.settings.translationOn = false


function routeTo(e) {
  router.push('/settings' + e.path)
  window.glb.settings.currentHeader = e.name
  window.glb.settings.showSettingsList = false
}

const routs = [
  { name: 'General', path: '/general' },
  { name: 'Appearance', path: '/appearance' },
  { name: 'Notifications', path: '/notifications' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Security', path: '/security' },
  { name: 'Help', path: '/help' },
  { name: 'About', path: '/about' },
  { name: 'Legal', path: '/legal' },
  { name: 'Sign Out', path: '/signout' },
]

</script>
<template>
  <div class="w-full h-full ">
    <div class="flex flex-row h-full w-full relative">

      <div
        class="flex flex-col basis-1/4 themed-bg-secondary shadow border-r-2 absolute sm:static top-0 left-0 w-full h-full z-10"
        :class="'transition-all duration-500 ' + (window.glb.settings.showSettingsList ? '-translate-x-0 ' : '-translate-x-full sm:-translate-x-0') + ''">
        <div class="w-full p-2 flex effects center-cross space-x-2 text-xl sm:hidden"
          @click="window.glb.settings.showSettingsList = !window.glb.settings.showSettingsList;">
          <q-icon name="chevron_left" class="text-xl float-right cursor-pointer"></q-icon>
          <div>Back</div>
        </div>

        <div v-for="rout in routs" class="general col-item  themed-bg-tertiary themed-text-primary"
          :class="rout.name == window.glb.settings.currentHeader ? 'themed-bg-highlight' : 'effects'"
          @click="routeTo(rout)">{{ rout.name }}</div>
      </div>
      <div class="flex flex-col h-full w-full border sm:basis-3/4 z-0">
        <div class="full flex flex-col ">
          <div class="w-full p-2 flex effects center-cross space-x-2 themed-bg-secondary shadow"
            @click="window.glb.settings.showSettingsList = !window.glb.settings.showSettingsList">
            <q-icon name="chevron_left" class="text-xl float-right cursor-pointer"></q-icon>
            <div class="text-xl">{{ window.glb.settings.currentHeader }}</div>
          </div>
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>
