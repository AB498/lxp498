<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import { computed } from 'vue'
import UserMessage from '@/components/UserMessage.vue'
import { reactive } from 'vue'

const router = useRouter()
const route = useRoute()
const initialLoad = ref(true)
const converstionId = ref(route.params.id)
const messages = ref([])
const chatSendText = ref('')
const textAreaDisabled = ref(false)
const numLines = ref(1)

const sendMessage = () => {
    if (chatSendText.value.length > 0) {
        window.glb.syncerObj.openChat.addMessage = chatSendText.value
        chatSendText.value = ''
    }
}

watch(() => window.glb.syncerObj?.openChat?.messages, (newVal, oldVal) => {
    messages.value = newVal
    // console.log(newVal?.length, oldVal?.length)
    if (newVal?.length > oldVal?.length)
        nextTick(() => {
            const chatMessages = document.getElementById('chat-messages')
            if (!chatMessages) return
            chatMessages.scrollTop = chatMessages.scrollHeight
        })
})

const updateNumLines = () => {
    numLines.value = chatSendText.value.split('\n').length
}

watch(chatSendText, updateNumLines)

const clamp = (number, min, max) =>
    Math.max(min, Math.min(number, max));

async function openConversation(id) {
    let res = await window.glb.safeAuthedReq('/api/openConversation', { id: id })
    if (res) {
        window.glb.syncerObj.openChat.participants = res.Users;
        window.glb.syncerObj.openChat.otherUser = res.Users.find(u => u.id != window.glb.user.id);
    } else {
        window.glb.addNotf('error', 'Error creating chat')
    }
}
watch([() => route.params.id, initialLoad], async (newVal, oldVal) => {
    if (newVal != oldVal) {
        window.glb.syncerObj.openChat = { conversationId: null }
        await openConversation(route.params.id);
        window.glb.syncerObj.openChat.conversationId = route.params.id;

    }
})

initialLoad.value = false

</script>

<template>
        <div class="w-full h-full  bg-slate-800 overflow-auto"
                    v-loading-bar="{ loading: !window.glb.syncerObj.openChat?.messages }">
                <div class="flex flex-col w-full h-full overflow-auto" v-if="window.glb.syncerObj.openChat?.conversationId">
                <div class="flex center-cross">
                    <div class="text-2xl p-1 m-1 px-2 hover-ripple hover:cursor-pointer hover:bg-gray-600 rounded-lg ">{{
                        window.glb.syncerObj.openChat.otherUser?.firstName || 'Username' }}
                    </div>
                    <div class="grow"></div>
                    <q-icon name="more_vert" class="p-2 text-xl hover:bg-gray-600 hover-ripple rounded  mx-2" />
                    <!-- <span class="material-symbols-outlined"> more_vert </span> -->

                </div>
                <div class="h-full w-full bg-teal-900 flex flex-col  overflow-auto " id="chat-messages"
                    v-if="window.glb.syncerObj.openChat.messages">
                    <div v-for="(message, index) in window.glb.syncerObj.openChat.messages" :key="message.id" class="">
                        <UserMessage :message="message"
                            :user="window.glb.syncerObj.openChat.participants.find(u => u.id == message.UserId)"
                            index="message.id" />
                        <div class="px-8  w-full">
                            <div class="h-[1px] bg-gray-200/50"></div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center">
                    <textarea :style="{ height: clamp((1 * numLines) + 2, 0, 6) + 'rem' }"
                        class="center p-2 m-2 w-full bg-gray-700" type="text" v-model="chatSendText"
                        @keydown.enter.exact.prevent="sendMessage()" :readonly="textAreaDisabled" />
                    <button class="p-2 m-2 ml-0 btn" @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>