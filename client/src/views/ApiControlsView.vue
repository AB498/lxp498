<script setup>
import { JsonView } from 'vue-json-viewer';
import JsonEditorVue from 'json-editor-vue'
import axios from 'axios';
import InlineInput from 'vue-inline-input';


const apiEndpoints = window.vue.ref(await (await fetch('http://lanxplore.xyz/admin/apis')).json())
apiEndpoints.value.forEach(element => {
});
if (!window.glb.apiEndpoints)
    window.glb.apiEndpoints = [];

apiEndpoints.value.forEach(element => {
    element.body = window.glb.apiEndpoints.find(x => x.url == element.url)?.body
    element.res = window.glb.apiEndpoints.find(x => x.url == element.url)?.res
    element.params = window.glb.apiEndpoints.find(x => x.url == element.url)?.params
    element.params = element.url.match(/(?<=\/:)[a-zA-Z0-9]+/g)
});
window.glb.apiEndpoints = apiEndpoints.value

async function sendRequest(endpoint) {
    if (endpoint.method.toUpperCase() == 'GET')
        endpoint.res = await axios.get('http://lanxplore.xyz/test' + endpoint.url, { params: endpoint.params })
    else
        endpoint.res = await axios.post('http://lanxplore.xyz/test' + endpoint.url, window.glb.tryParseJSON(endpoint.body))
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
                        <div v-for="param in endpoint.params">
                            <q-input v-model="endpoint.params[param]" outlined dense dark class="bg-slate-700 p-1 rounded"
                                :label="param"></q-input>
                        </div>
                        <div class="grow"></div>
                        <i class="material-icons text-2xl text-lime-500" @click="endpoint.show = !endpoint.show"
                            v-text="endpoint.show ? 'expand_less' : 'expand_more'"></i>
                        <div class="btn" @click="sendRequest(endpoint)">Send</div>

                    </div>
                                <div class="flex flex-col w-full items-stretch space-x-2 p-2 transition-all" :class="endpoint.show ? 'h-auto' : 'h-0 opacity-0 pointer-events-none'"> 
                        <textarea class="result bg-slate-500 p-2 border border-l-4 border-lime-500"
                            v-model="endpoint.body"></textarea>
                            <JsonEditorVue v-model="endpoint.body" v-bind="{/* local config */ }" />

                        <JsonViewer :value="endpoint.res" class="bg-zinc-800" theme="my-awesome-json-theme">
                        </JsonViewer>
                    </div>
                </div>
            </div>
    </div>
</template>