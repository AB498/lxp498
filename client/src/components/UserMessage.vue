<script setup>
import feather from 'feather-icons'
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
            <div class="w-full p-3 flex center space-x-2 hover:bg-slate-600 relative" v-if="mes && mes.UserId"
                @mouseover="showActions = true" @mouseout="showActions = false">
                <img class="w-8 h-8 self-start rounded-full" :src="userInc.pfpUrl || '/logo.svg'" />
                <div class="flex flex-col w-full h-full">
                    <div class="text-xs text-gray-300">
                        {{ (user.firstName + ' ' + user.lastName) }} {{ window.glb.getFormattedTime(new Date(mes.createdAt)) }}
                    </div>
                    <div class="text-md whitespace-pre-wrap">
                        {{ mes.text }}
                    </div>


                </div>
                <!-- cross button -->
                <div class="flex absolute top-2 right-2 flex-row-reverse" :class="showActions ? 'visible' : 'invisible'">
                    <button class="bg-blue-600 shadow p-2 m-1 rounded hover-ripple-fast flex center-cross fas fa-pen"
                        @click="editMessage"> </button>
                    <button class="bg-blue-600 shadow p-2 m-1 rounded hover-ripple-fast flex center-cross fas fa-trash"
                        @click="deleteMessage"> </button>
                    <button class="bg-blue-600 shadow p-2 m-1 rounded hover-ripple-fast flex center-cross fa-solid fa-langauge"
                            @click="deleteMessage"> </button>
    {{ feather.icons.circle.toSvg({ class: 'foo bar' })
    }}

                </div>
        </div>
</template>

