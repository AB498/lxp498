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


</script>

<template>
        <div class="w-full h-full  bg-slate-800 overflow-auto">
            <div class="flex flex-col w-full h-full overflow-auto">
                <div class="text-2xl p-2 ">{{ converstionId || 'Username' }}</div>

                <div class="h-full bg-slate-600 flex flex-col  overflow-auto" id="chat-messages">
                                    <div v-for="(message, index) in window.glb.syncerObj.openChat.messages" :key="message.id">
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