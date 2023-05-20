<script setup>
import { JsonView } from 'vue-json-viewer';


const apiEndpoints = window.vue.ref(await(await fetch('http://lanxplore.xyz/admin/apis')).json())

async function sendRequest(endpoint) {

    endpoint.res = (await fetch('http://lanxplore.xyz/test' + endpoint.url, {
        method: endpoint.method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: endpoint.body ? endpoint.body : null
    }));
    try {
        endpoint.res = (await endpoint.res.json())
    } catch (e) {
        endpoint.res = await res.text()
    }
}


</script>


<template>
    <div class="w-full h-full bg-red-400">
        <div v-for="endpoint in apiEndpoints">
            <div class="flex flex-col bg-fuchsia-950">
                <div class="flex w-full  items-center space-x-2 p-2">

                    <div class="bg-slate-700 p-1 rounded" v-text="endpoint.method"></div>
                    <div class="bg-slate-700 p-1 rounded" v-text="'/test' + endpoint.url"></div>
                    <div x-text="body"></div>
                    <div class="grow"></div>
                    <div class="btn" @click="sendRequest(endpoint)">Send</div>

                    </div>
                        <textarea class="result bg-slate-500 p-2 border border-l-4 border-lime-500" v-model="endpoint.body"></textarea>
                            <JsonView :src="endpoint.res" class="result bg-slate-500 p-2 border border-l-4 border-lime-500"></JsonView>
                </div>
            </div>
        </div>
    </div>
</template>