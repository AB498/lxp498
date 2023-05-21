<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from 'vue'
import Toggle from '@vueform/toggle'
import { io } from "socket.io-client";
import { reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
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
let testInterval;

initializeSocket()
function initializeSocket(){
    // Create and connect the socket
    syncerSocket = io(socketURL, socketOptions.value);
    syncerSocket.connect();
    
    syncerSocket.on("connect", () => {
        socketState.connected=true;
        var syncerObj = createProxy({});
        
    rjwatch(syncerObj, 'uuid', (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
        // console.log(`${p || 'root'}->${k} changed from ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
        syncerSocket.emit("updateObj", { path: p, value: v });
            }); //onchange
        rjwatch(syncerObj, null, (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
            if(k=='uuid')return;
            console.log(`${p || 'root'}->${k} changed from ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
            }); //onchange

        syncerSocket.on('updateObj', ({ path, value }) => {
        // console.log(path, value);
        rjmod(syncerObj, path, value,true);
        console.log(syncerObj);
        }); //onreceive
        
        
     testInterval = setInterval(() => {
        syncerObj.b = Math.random() * 1000 + 1 | 0;
        syncerObj.uuid = uuidv4();
    }, 1000);
        // syncerObj.a=43;
    });
    
    syncerSocket.on("disconnect", () => {
        console.log("disconnected");
        socketState.connected=false
    });
  
}
onUnmounted(()=>{
    syncerSocket.disconnect()
    clearInterval(testInterval)
})


</script>

<template>

<div class="full">
    

</div>


</template>