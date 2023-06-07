<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import Toggle from '@vueform/toggle'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'

const route = useRoute()
const router = useRouter()

window.glb.chats = ref(await window.glb.safeAuthedReq('/api/getAllUsers'))
window.glb.conversations = ref(await window.glb.safeAuthedReq('/api/getSelfConversations'))

async function openConversation(user) {
  let res = await window.glb.safeAuthedReq('/api/createChat', { otherUserId: user.id })
  if (res) {
    chatBoardOpen.value = false
    router.push('/chat/' + res.id)
  } else {
    window.glb.addNotf('error', 'Error creating chat')
  }
}

const chatBoardOpen = ref(false)

</script>
<template>
  <div class="w-full h-full">
    <div class="flex w-full h-full relative">
      <div
        class="transition-all sm:basis-1/4 z-10 h-full themed-bg-secondary absolute w-full sm:w-1/4 sm:translate-x-0 sm:static overflow-hidden sm:overflow-auto"
        :class="chatBoardOpen && 'translate-x-0' || '-translate-x-full'">
        <div class="flex center-cross px-2">
          <q-icon name="arrow_left" class=" effects cursor-pointer text-2xl" @click="chatBoardOpen = !chatBoardOpen" />
          <div class="text-2xl p-2" v-loading-bar="{ loading: !window.glb.chats }" v-ripple>Global</div>
        </div>
        <div class="" v-if="window.glb.chats">
          <div v-for="(user, index) in window.glb.chats" :key="index">
            <div class=" p-2 m-1 rounded hover-ripple-fast hover:bg-sky-600 flex center-cross " v-ripple
              :class="window.glb.syncerObj.openChat?.otherUser?.id == user.id ? 'bg-blue-400' : 'themed-bg-tertiary'"
              @click="openConversation(user)">
              <img :src="user.pfpUrl" class="w-8 h-8 rounded-full inline-block mr-2">
              <div class="flex flex-col center-main">
                <div class="name">{{ user.firstName + ' ' + user.lastName }}
                  <i v-if="user.isOnline" class="text-xs px-2 fas fa-circle text-green-500 relative">
                    <i class="text-xs px-2 fas fa-circle text-yellow-500 animate-ping absolute top-0 left-0"></i>
                  </i>
                  <i v-else class='bx bx-wifi-off '></i>
                </div>
                <div class="username text-xs">{{ '@' + (user.username || 'nousername') }}</div>
              </div>


            </div>
          </div>
        </div>
        <div class="flex center-cross px-2">
          <q-icon name="arrow_left" class=" effects cursor-pointer text-2xl" @click="chatBoardOpen = !chatBoardOpen" />
          <div class="text-2xl p-2" v-loading-bar="{ loading: !window.glb.chats }" v-ripple>Recents</div>
        </div>
        <div class="" v-if="window.glb.conversations">
          <div v-for="(conv, index) in window.glb.conversations" :key="index">
            <div v-for="user in [conv.Users.find(u => u.id != window.glb.user.id)]"
              class=" p-2 m-1 rounded hover-ripple-fast hover:bg-sky-600 flex center-cross " v-ripple
              :class="window.glb.syncerObj.openChat?.otherUser?.id == user.id ? 'bg-blue-400' : 'themed-bg-tertiary'"
              @click="openConversation(user)">
              <img :src="user.pfpUrl" class="w-8 h-8 rounded-full inline-block mr-2">
              <div class="flex flex-col center-main">
                <div class="name"> {{ user.firstName }}
                  <i v-if="user.isOnline" class="text-xs px-2 fas fa-circle text-green-500 relative">
                    <i class="text-xs px-2 fas fa-circle text-yellow-500 animate-ping absolute top-0 left-0"></i> </i>
                    <i v-else class='bx bx-wifi-off '></i>
                </div>
                <div class="username text-xs">{{ '@' + (user.username || 'nousername') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="basis-full sm:basis-3/4 h-full flex flex-col overflow-auto relative">
        <div class="h-12 themed-bg-secondary shadow center-cross w-full flex px-3 sticky top-0 ">
          <q-icon name="dashboard" class=" effects cursor-pointer text-2xl" @click="chatBoardOpen = !chatBoardOpen" />
          <div class=" p-2 text-xl center ">
            {{ window.glb.syncerObj.openChat?.otherUser?.firstName || 'No chats open' }}
          </div>
          <div class="grow"></div>
          <q-icon name="more_vert" class="effects cursor-pointer text-2xl " />
        </div>
        <RouterView></RouterView>

      </div>
    </div>
  </div>
</template>

