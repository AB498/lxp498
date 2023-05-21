<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import Toggle from '@vueform/toggle'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'

const route = useRoute()
const router = useRouter()


watch(() => window.glb.lxsocket.onlineUsers, (newVal, oldVal) => {
  // console.log('onlineUsers changed', newVal, oldVal)
})

window.glb.chats = ref(await window.glb.safeAuthedReq('/api/getAllUsers'))
window.glb.syncerObj.openChat = {}

async function openConversation(user) {
  let res = await window.glb.safeAuthedReq('/api/createChat', { otherUserId: user.id })
  if (res) {
    window.glb.syncerObj.openChat.user = res.Users.find(u => u.id == user.id);
    router.push('/chat/' + res.id)
  } else {
    window.glb.addNotf('error', 'Error creating chat')
  }
  // router.push('/chat/' + user.id)
}



</script>
<template>
  <div class="w-full h-full  bg-slate-800 ">
    <div class="flex w-full h-full">
      <div class="basis-1/4 h-full bg-cyan-900">
          <div class="text-2xl p-2" v-loading-bar="{ loading: !window.glb.chats }" v-ripple>Online</div>
          <div class="" v-if="window.glb.chats">
            <div v-for="(user, index) in window.glb.chats" :key="index">
              <div class="btn hover-ripple-fast"
                        @click="openConversation(user)">
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
