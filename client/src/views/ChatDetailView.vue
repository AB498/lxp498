<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { defineProps } from 'vue'
import { computed } from 'vue'
import UserMessage from '@/components/UserMessage.vue'

// const props = defineProps({
//     id: {
//         type: String,
//         required: true
//     }
// })

const router = useRouter()
const route = useRoute()
const initialLoad = ref(true)
const converstionId = ref(route.params.id)
const messages = ref([])
const unwatch = ref(null);
watch([() => route.params.id, initialLoad], async ([newVal, initialLoad], oldVal) => {
    console.log('changed')
    messages.value = []
    window.glb.activatedChat.messages = []
    window.glb.activatedChat.id = converstionId.value
    converstionId.value = newVal
    let res = await fetch(window.glb.baseUrl + '/api/conversations/' + converstionId.value + '/messages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    let data = await res.json()
    console.log('data', data)
    messages.value = data
    window.glb.activatedChat.messages = data
    nextTick(() => {
        let el = document.getElementById('chat-messages')
        el.scrollTop = el.scrollHeight
    })
    if (unwatch.value) unwatch.value();

    unwatch.value = watch(window.glb.activatedChat, (newVal, oldVal) => {
        console.log('activatedChat changed', window.glb.activatedChat.messages[window.glb.activatedChat.messages.length - 1])
        messages.value = window.glb.activatedChat.messages
        nextTick(() => {
            let el = document.getElementById('chat-messages')
            el.scrollTop = el.scrollHeight
        })
    });
})

messages.value = []
initialLoad.value = false;

onMounted(async () => {
})

const chatSendText = ref('')

const numLines = computed(() => {
    return chatSendText.value.split(/\r\n|\r|\n/).length
})
const clamp = (number, min, max) =>
    Math.max(min, Math.min(number, max));

async function sendMessage() {

    if (chatSendText.value == '') return
    if (textAreaDisabled.value) return
    textAreaDisabled.value = true
    console.log('sendMessage')
    let res = fetch(window.glb.baseUrl + '/api/conversations/' + converstionId.value + '/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + window.glb.user.jwt
        },
        body: JSON.stringify({
            text: chatSendText.value
        })
    })
    chatSendText.value = ''
    textAreaDisabled.value = false
    let data = await (await res).json()
    console.log('data', data)
    // messages.value.push(data)
}


const textAreaDisabled = ref(false)

</script>

<template>
        <div class="w-full h-full  bg-slate-800 overflow-auto">
            <div class="flex flex-col w-full h-full overflow-auto">
                <div class="text-2xl p-2 ">{{ converstionId || 'Username' }}</div>

                <div class="h-full bg-slate-600 flex flex-col  overflow-auto" id="chat-messages">
                                <div v-for="(message, index) in messages" :key="message.id">
                                    <UserMessage class="text-2xl p-2" :message="message"></UserMessage>
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