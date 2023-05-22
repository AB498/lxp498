<script setup>
import { defineProps, ref } from 'vue'

const props = defineProps({
    message: {
        type: Object,
        required: true
    },
    user: {
        type: Object,
        required: true
    }
})

const mes = ref(props.message)
const userInc = ref(props.user)

const srcStr = ref('')
const showActions = ref(false)

async function deleteMessage() {
    console.log('delete message', mes.value.id)
    window.glb.syncerObj.openChat.deleteMessage = mes.value.id
}

</script>

<template>
        <div class="w-full p-3 border-b-[1px] border-gray-200 flex center space-x-2" v-if="mes && mes.UserId"
            @mouseover="showActions = true" @mouseout="showActions = false">
                    <img class="w-6 h-6 self-start" :src="userInc.pfpUrl || '/logo.svg'" />
            <div class="flex flex-col w-full h-full">
                        <div class="text-xs text-gray-300">
                            {{ mes.UserId.username || 'No Name' }} {{ window.glb.getFormattedTime(new Date(mes.createdAt)) }}
                </div>
                    <div class="text-md whitespace-pre-wrap">
                    {{ mes.text }}
                </div>


            </div>
            <!-- cross button -->
            <div class="flex justify-end" :class="showActions ? 'visible' : 'invisible'" @click="deleteMessage">
                <button class="btn btn-sm btn-circle btn-ghost">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
</template>

