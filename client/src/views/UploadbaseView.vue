<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import Toggle from '@vueform/toggle'
import { useRouter } from 'vue-router'

const router = useRouter()

</script>
<template> 

  <div class="w-full h-full   ">
    <div class="flex w-full h-full relative">
      <div class="basis-11/12 h-full w-full  overflow-auto">
        <RouterView class="overflow-auto w-full" />
      </div>
      <div class=" basis-1/12 h-full items-stretch p-2 themed-bg-secondary shadow-left border-l-2 flex flex-col center-cross space-y-2 py-2">
        <i @click="router.push('/uploadbase/')" class="btn center text-xl rounded p-2 fas fa-home"></i>
        <i @click="router.push('/uploadbase/myuploads')" class="btn center text-xl rounded p-2 fa fa-user"></i>
        <i @click="router.push('/uploadbase/settings')" class="btn center text-xl rounded p-2 fa fa-cog"></i>
        <i @click="router.push('/uploadbase/history')" class="btn center text-xl rounded p-2 fa fa-history"></i>
      </div>
    </div>
  </div>
</template>
