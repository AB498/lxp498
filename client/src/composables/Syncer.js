
import { ref, watch, onUnmounted, onMounted, nextTick, computed } from 'vue'
import Toggle from '@vueform/toggle'
import { io } from "socket.io-client";
import { reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON'


const makeSyncer = (url) => {
    var syncerObj = createProxy({});
    let localChange = true;
    let server2Socket = null;
    let socketState = reactive({
        connected: false
    })
    let testInterval;

    function init(url) {
        server2Socket = io(url);
        server2Socket.connect();

        server2Socket.on("connect", () => {
            socketState.connected = true;


            rjwatch(syncerObj, null, (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
                if (localChange)
                    server2Socket.emit("updateObj", { path: p, value: v });
                console.log(`${localChange}  ${p || 'root'}->${k} changed from ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
            }); //onchange

            server2Socket.on('updateObj', ({ path, value }) => {
                localChange = false;
                rjmod(syncerObj, path, value);
                localChange = true;
            }); //onreceive
        });

        server2Socket.on("disconnect", (e) => {
            console.log("disconnected", e);
            socketState.connected = false
        });

    }
    function destroy() {
        clearInterval(testInterval);
        server2Socket.disconnect();
    }

    return { syncerObj, socketState, server2Socket, init, destroy }
}

export { makeSyncer }
