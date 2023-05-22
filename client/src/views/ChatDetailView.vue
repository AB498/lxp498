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
window.glb.syncerObj.openChat = {}
await openConversation(route.params.id);
window.glb.syncerObj.openChat.conversationId = route.params.id;

function fastObjCopy(obj) {
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (obj.constructor === Date) return new Date(obj);
    if (obj.constructor === RegExp) return new RegExp(obj);
    let newObj = new obj.constructor();  //保持继承链
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {   //不遍历其原型链上的属性
            let val = obj[key];
            newObj[key] = typeof val === 'object' ? fastObjCopy(val) : val; // 使用arguments.callee解除与函数名的耦合
        }
    }
    return newObj;
}


</script>

<template>
        <div class="w-full h-full  bg-slate-800 overflow-auto">
            <div class="flex flex-col w-full h-full overflow-auto">
                <div class="text-2xl p-2 ">{{ window.glb.syncerObj.openChat.otherUser?.firstName || 'Username' }}</div>
                <div class="h-full bg-slate-600 flex flex-col  overflow-auto" id="chat-messages"
                    v-if="window.glb.syncerObj.openChat.messages">
                    <div v-for="(message, index) in window.glb.syncerObj.openChat.messages" :key="message.id">
                        <UserMessage :message="message"
                                        :user="cons(window.glb.syncerObj.openChat.participants.find(u => u.id == message.UserId), 'undef')"
                            index="message.id" />
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