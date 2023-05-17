<script setup>
import { defineProps, ref } from 'vue'

const props = defineProps({
    message: {
        type: Object,
        required: true
    }
})

const mes = ref(props.message)

const srcStr = ref('')
const showActions = ref(false)

async function deleteMessage() {
    console.log('deleteMessage', mes.value)
    let res = await fetch(window.glb.baseUrl + '/api/conversations/' + window.glb.activatedChat.id + '/messages/' + mes.value.id + '/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + window.glb.user.jwt
        },
    })
    let data = await res.json()
    if (!res.ok) return window.glb.addNotf(data.error || data.message || "Failed to delete", "brown", 'error')
    window.glb.addNotf('Message deleted', null,)
    console.log('data', data)
    // window.glb.activatedChat.messages = window.glb.activatedChat.messages.filter((m) => m.id != mes.value.id)
}

</script>

<template>
                        <div class="w-full h-34   flex center space-x-2" v-if="mes && mes.sender" @mouseover="showActions = true"
                            @mouseout="showActions = false">
                            <img class="w-6 h-6" :src="mes.sender.avatar || '/temp.svg'" />
                            <div class="flex flex-col w-full h-full">
                                <div class="text-xs">
                                            {{ mes.sender.username || 'No Name' }} {{ window.glb.getFormattedTime(new Date(mes.createdAt)) }} {{ mes.id
                                            }}
                                        </div>
                                        <div class="text-sm">
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

