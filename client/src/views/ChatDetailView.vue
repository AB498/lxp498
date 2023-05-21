<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import { computed } from 'vue'
import UserMessage from '@/components/UserMessage.vue'

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
        window.glb.syncerObj.openChat.sendMessage(chatSendText.value)
        chatSendText.value = ''
    }
}

const updateNumLines = () => {
    numLines.value = chatSendText.value.split('\n').length
}

watch(chatSendText, updateNumLines)


const clamp = (number, min, max) =>
    Math.max(min, Math.min(number, max));



</script>

<template>
        <div class="w-full h-full  bg-slate-800 overflow-auto">
            <div class="flex flex-col w-full h-full overflow-auto">
                <div class="text-2xl p-2 ">{{ converstionId || 'Username' }}</div>
    {{ window.glb.syncerObj.openChat.messages }}
                    <div class="h-full bg-slate-600 flex flex-col  overflow-auto" id="chat-messages" v-if="window.glb.syncerObj.openChat">
                    <div v-for="(message, index) in window.glb.syncerObj.openChat.messages" :key="message.id">
                        {{ message }}
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