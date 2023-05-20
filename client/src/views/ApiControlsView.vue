<script setup>
import { JsonView } from 'vue-json-viewer';
import JsonEditorVue from 'json-editor-vue'
import axios from 'src/boot/axios';


const apiEndpoints = window.vue.ref(await (await fetch('http://lanxplore.xyz/admin/apis')).json())
if (!window.glb.apiEndpoints)
    window.glb.apiEndpoints = [];

apiEndpoints.value.forEach(element => {
    element.body = window.glb.apiEndpoints.find(x => x.url == element.url)?.body
    element.res = window.glb.apiEndpoints.find(x => x.url == element.url)?.res
});
window.glb.apiEndpoints = apiEndpoints.value

async function sendRequest(endpoint) {
    if (endpoint.method.toUpperCase() == 'GET')
        endpoint.res = await (await fetch('http://lanxplore.xyz/test' + endpoint.url)).json()
    else
        endpoint.res = await (await fetch('http://lanxplore.xyz/test' + endpoint.url, {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: endpoint.body
        })).json()
    console.log(endpoint.res)
    window.glb.apiEndpoints.find(x => x.url == endpoint.url).res = endpoint.res
    window.glb.apiEndpoints.find(x => x.url == endpoint.url).body = endpoint.body
    window.glb.apiEndpoints = window.glb.apiEndpoints

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
                    <textarea class="result bg-slate-500 p-2 border border-l-4 border-lime-500"
                        v-model="endpoint.body"></textarea>
                    <JsonEditorVue v-model="endpoint.body" v-bind="{/* local config */ }" />

                    <JsonViewer :value="endpoint.res" class="bg-zinc-800" theme="my-awesome-json-theme">
                    </JsonViewer>
                </div>
            </div>
    </div>
</template>