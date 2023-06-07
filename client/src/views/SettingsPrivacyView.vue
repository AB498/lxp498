<script setup>

import Toggle from '@vueform/toggle'

import { ref, onUnmounted, onMounted, nextTick, watch } from 'vue'

watch(() => window.glb.settings.globalChatVisibility, (val) => {
    window.glb.syncerObj.userSettings=  { globalChatVisibility: val?'public':'onlyme' }
})


</script>




<template>
    <div class="generalWindow m-6 sm:m-16 p-2 sm:p-6 rounded themed-bg-secondary">
        <div class="col-item effects">
            <div class="left-grow">Send optional error data</div>
            <q-toggle :classes="window.glb.toggleStyle" v-model="window.glb.settings.sendErrorData" class="toggle-red" />
        </div>
        <div class="col-item effects space-x-2">
            <div class="flex flex-col left-grow">
                <div class="">Show online status to global chatroom</div>
                <div class="text-sm themed-text-gray">Enables you to find other online users</div>
            </div>
            <q-toggle :classes="window.glb.toggleStyle" v-model="window.glb.settings.globalChatVisibility" class="toggle-red" />
        </div>
        <div class="col-item effects space-x-2">
            <div class="flex flex-col left-grow">
                <div class="">Phone number visibility</div>
                <div class="text-sm themed-text-gray">{{ !window.glb.settings.phoneNumberVisibility ? '(Only me)' :
                    '(Public)' }}</div>
            </div>
            <q-toggle :classes="window.glb.toggleStyle" v-model="window.glb.settings.phoneNumberVisibility"
                class="toggle-red" />
        </div>
        <div class="col-item effects space-x-2">
            <div class="flex flex-col left-grow">
                <div class="">Email visibility</div>
                <div class="text-sm themed-text-gray">{{ !window.glb.settings.emailVisibility ? '(Only me)' :
                    '(Public)' }}</div>
            </div>
            <q-toggle :classes="window.glb.toggleStyle" v-model="window.glb.settings.emailVisibility" class="toggle-red" />
        </div>
    </div>
</template>