<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import Toggle from '@vueform/toggle'


watch(() => window.glb.lxsocket.onlineUsers, (newVal, oldVal) => {
  // console.log('onlineUsers changed', newVal, oldVal)
})


// async function openConversation() {
//   console.log('openConversation')
//   let res = await fetch(window.glb.baseUrl + '/api/conversations/open', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       otherEmail: window.glb.lxsocket.onlineUsers[0].user.email
//     })
//   })
//   let data = await res.json()
//   console.log('data', data)
// }


</script>
<template>
  <div class="w-full h-full  bg-slate-800 ">
    <div class="flex w-full h-full">
      <div class="basis-1/4 h-full bg-cyan-900">
        <div class="text-2xl p-2" v-loading-bar="{ loading: !window.glb._serverSynced.onlineUsers }">Online</div>
        <div class="" v-if="window.glb._serverSynced.onlineUsers">
          <div v-for="(user, index) in window.glb._serverSynced.onlineUsers" :key="index">
            <div class="btn" @click="" v-ripple>
              {{ user.email }}
            </div>
          </div>
        </div>
      </div>
      <div class="basis-3/4 h-full 0 overflow-auto ">
        <RouterView></RouterView>

      </div>
    </div>
  </div>
</template>
