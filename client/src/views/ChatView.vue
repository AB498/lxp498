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

async function openConversation(user) {
  let res = await window.glb.safeAuthedReq('/api/createChat', { otherUserId: user.id })
  if (res) {
    router.push('/chat/' + res.id)
  } else {
    window.glb.addNotf('error', 'Error creating chat')
  }
}



</script>
<template>
  <div class="w-full h-full  bg-slate-800 ">
    <div class="flex w-full h-full">
        <div class="basis-1/4 h-full bg-cyan-950">
          <div class="text-2xl p-2" v-loading-bar="{ loading: !window.glb.chats }" v-ripple>Online</div>
          <div class="" v-if="window.glb.chats">
            <div v-for="(user, index) in window.glb.chats" :key="index">
              <div class="bg-slate-600 p-2 m-1 rounded hover-ripple-fast flex center-cross" @click="openConversation(user)">
                <img :src="user.pfpUrl" class="w-8 h-8 rounded-full inline-block mr-2">
                <div class="flex flex-col">
                  <div class="name">{{ user.firstName + ' ' + user.lastName }}</div>
                        <div class="username text-xs">{{ user.username || '@nousername' }}</div>
                </div>


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
