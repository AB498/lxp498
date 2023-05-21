<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from 'vue'
import Toggle from '@vueform/toggle'
import { io } from "socket.io-client";
import { reactive } from 'vue';
import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON'
// const  { createProxy, rjwatch, rjmod } = obj

const URL = "http://localhost:3000";
const socketURL = URL;
const socketOptions = computed(() => ({
  extraHeaders: {
    Authorization: `Bearer ${window.glb?.jwt || ''}`
  }
}));
let syncerSocket = null;
let socketState=reactive({
    connected:false
})

let syncerObj= createProxy({
    fooEvents:[],
    barEvents:[],
    onlineUsers:[],
    conversations:[],
})

initializeSocket()
function initializeSocket(){
    // Create and connect the socket
    syncerSocket = io(socketURL, socketOptions.value);
    syncerSocket.connect();
    
    syncerSocket.on("connect", () => {
        socketState.connected=true;
        
        rjwatch(syncerObj, null, (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
        console.log(`${p || 'root'}->${k} changed from ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
        socket.emit("updateObj", { path: p, value: v });
        }); //onchange

        socket.on('updateObj', ({ path, value }) => {
        // console.log(path, value);
        rjmod(syncerObj, path, value);
        console.log(syncerObj);
        }); //onreceive
        
        syncerObj.a=43;
    });
    
    syncerSocket.on("disconnect", () => {
        console.log("disconnected");
        socketState.connected=false
    });
  
}

</script>

<template>

<div class="full">
    

</div>


</template>