<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from 'vue'
import Toggle from '@vueform/toggle'
import { io } from "socket.io-client";
import { reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON'
import { makeSyncer } from '@/composables/Syncer'

// const  { createProxy, rjwatch, rjmod } = obj

const URL = "http://localhost:3000";

let syncer = makeSyncer(URL)
syncer.init()


onUnmounted(() => {
    socket.disconnect()
    clearInterval(testInterval)
})


</script>

<template>
        <div class="full">


        </div>
</template>