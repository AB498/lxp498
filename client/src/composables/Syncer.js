
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from 'vue'
import Toggle from '@vueform/toggle'
import { io } from "socket.io-client";
import { reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON'


const makeSyncer = (url) => {
    const socketOptions = computed(() => ());
    var syncerObj = createProxy({});
    let localChange = true;
    let socket = null;
    let socketState = reactive({
        connected: false
    })
    let testInterval;

    function init(url) {
        socket = io(url, {});
        socket.connect();

        socket.on("connect", () => {
            socketState.connected = true;


            rjwatch(syncerObj, null, (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
                if (localChange)
                    socket.emit("updateObj", { path: p, value: v });
                console.log(`${p || 'root'}->${k} changed from ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
            }); //onchange

            socket.on('updateObj', ({ path, value }) => {
                localChange = false;
                rjmod(syncerObj, path, value);
                localChange = true;
            }); //onreceive


            testInterval = setInterval(() => {
                syncerObj.b = Math.random() * 1000 + 1 | 0;
                // syncerObj.uuid = uuidv4();
            }, 1000);
            // syncerObj.a=43;
        });

        socket.on("disconnect", () => {
            console.log("disconnected");
            socketState.connected = false
        });

    }

    return { syncerObj, socketState, socket, init }
}

export { makeSyncer }
