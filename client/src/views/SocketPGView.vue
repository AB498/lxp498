<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from 'vue'
import Toggle from '@vueform/toggle'
import { io } from "socket.io-client";
import { reactive } from 'vue';
import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON.js'

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
initializeSocket()
function initializeSocket(){
    // Create and connect the socket
    syncerSocket = io(socketURL, socketOptions.value);
    syncerSocket.connect();
    
    syncerSocket.on("connect", () => {
        console.log("my id: " + syncerSocket.id);
        socketState.connected=true;
    });
    
    syncerSocket.on("disconnect", () => {
        console.log("disconnected");
        socketState.connected=false
    });
    
    syncerSocket.on("connect_error", (err) => {
        console.log("connect_error", err);
    });
    
    syncerSocket.on("connect_timeout", (err) => {
        console.log("connect_timeout", err);
    });
    
    syncerSocket.on("error", (err) => {
        console.log("error", err);
    });
    
    syncerSocket.on("reconnect", (attemptNumber) => {
        console.log("reconnect", attemptNumber);
    });
    
    syncerSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log("reconnect_attempt", attemptNumber);
    });
    
    syncerSocket.on("reconnecting", (attemptNumber) => {
        console.log("reconnecting", attemptNumber);
    });
    
    syncerSocket.on("reconnect_error", (err) => {
        console.log("reconnect_error", err);
    });
    
    syncerSocket.on("reconnect_failed", () => {
        console.log("reconnect_failed");
    });
    
    syncerSocket.on("ping", () => {
        console.log("ping");
    });
    
    syncerSocket.on("pong", (latency) => {
        console.log("pong", latency);
    });
    
    syncerSocket.on("foo", (data) => {
        console.log("foo", data);
        window.glb.lxsocket.fooEvents.push(data);
    });
    
    syncerSocket.on("bar", (data) => {
        console.log("bar", data);
        window.glb.lxsocket.barEvents.push(data);
    });
    
    syncerSocket.on("onlineUsers", (data) => {
        console.log("onlineUsers", data);
        window.glb.lxsocket.onlineUsers = data;
    });
    
    syncerSocket.on("serverSync", (data) => {
        console.log("serverSync", data);
        window.glb._serverSynced = data;
    });
    
    syncerSocket.on("serverSynced", (data) => {
        console.log("serverSynced", data);
        window.glb._serverSynced = data;
    });
}

</script>

<template>

<div class="full">
    

</div>


</template>