<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import Toggle from '@vueform/toggle'
import { useRouter } from 'vue-router'

const router = useRouter()
const expanded = ref(true)

</script>
<template>
  <div class="w-full h-full overflow-auto flex">
    <div class="relative flex flex-col sm:flex-row w-full h-full overflow-hidden ">
      <div class="flex order-1 sm:order-none basis-11/12 h-full w-full border overflow-auto">
        <RouterView class="overflow-auto flex w-full h-full" />
      </div>
      <div
        class="center-cross flex sm:flex-col transition-all justify-around sm:justify-normal basis-1/12 w-full sm:w-auto sm:h-full  p-2 themed-bg-secondary shadow border-l-2 center-cross spacex-x-2 sm:space-x-0 sm:space-y-2 py-2">
        <i @click="router.push('/uploadbase/')" class="effects w-6 h-6 center text-xl rounded p-4 fas fa-home"></i>
        <i @click="router.push('/uploadbase/myuploads')" class="effects w-6 h-6 center text-xl rounded p-4 fa fa-user"></i>
        <i @click="router.push('/uploadbase/settings')" class="effects w-6 h-6 center text-xl rounded p-4 fa fa-cog"></i>
        <i @click="router.push('/uploadbase/history')" class="effects w-6 h-6 center text-xl rounded p-4 fa fa-history"></i>
      </div>
    </div>
  </div>
</template>
