<script setup>
import JsonEditorVue from 'json-editor-vue'
import axios from 'axios';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'


const apiEndpoints = window.vue.ref(await (await fetch('http://lanxplore.xyz/admin/apis')).json())
apiEndpoints.value.forEach(element => {
});
if (!window.glb.apiEndpoints)
    window.glb.apiEndpoints = [];

apiEndpoints.value.forEach(element => {
    element.body = window.glb.apiEndpoints.find(x => x.url == element.url)?.body || '{}'
    element.res = window.glb.apiEndpoints.find(x => x.url == element.url)?.res
    element.show = window.glb.apiEndpoints.find(x => x.url == element.url)?.show
    element.params = window.glb.apiEndpoints.find(x => x.url == element.url)?.params
    element.params = element.url.match(/(?<=\/:)[a-zA-Z0-9]+/g)?.map(x => ({ [x]: '' })).reduce((a, b) => ({ ...a, ...b }), {})
    console.log(element.params)
});
window.glb.apiEndpoints = apiEndpoints.value

async function sendRequest(endpoint) {
    endpoint.loading = true
    try {
        console.log(endpoint.url.replace(/\/:[a-zA-Z0-9]+/g, (x) => '/' + endpoint.params[x.slice(2)]))

        if (endpoint.method.toUpperCase() == 'GET')
            endpoint.res = await axios.get('http://lanxplore.xyz/test' + endpoint.url.replace(/\/:[a-zA-Z0-9]+/g, (x) => '/' + endpoint.params[x.slice(2)]))
        else
            endpoint.res = await axios.post('http://lanxplore.xyz/test' + endpoint.url, window.glb.tryParseJSON(endpoint.body))
        console.log(endpoint.res)
        window.glb.apiEndpoints.find(x => x.url == endpoint.url).res = endpoint.res
        window.glb.apiEndpoints.find(x => x.url == endpoint.url).body = endpoint.body
        window.glb.apiEndpoints = window.glb.apiEndpoints
    } catch (e) {
        console.log(e)
        endpoint.res = e

    } finally {
        endpoint.loading = false
    }

}


</script>


<template>
    <div class="w-full h-full bg-red-400 overflow-auto">
        <div class="w-full h-full bg-red-400 overflow-auto">
            <div v-for="endpoint in apiEndpoints">
                <div class="flex flex-col bg-fuchsia-950">
                    <div class="flex w-full  items-center space-x-2 p-2 hover-ripple-fast"
                        v-loading-bar="{ loading: endpoint.loading }"
                        :class="endpoint.res ? (endpoint.res.status == 200 ? 'bg-green-700' : 'bg-red-700') : 'bg-slate-700'">

                        <div class="p-1 rounded" v-text="endpoint.method"
                            :class="endpoint.method == 'GET' ? 'bg-orange-400' : 'bg-blue-500'"></div>
                        <div class="bg-slate-700 p-1 rounded" v-text="'/test' + endpoint.url"></div>
                            <div v-for="param in endpoint.params" v-if="endpoint.params">
                                    <q-input v-model="params[param]" outlined dense class="bg-slate-700 text-white" />
                        </div>
                        <div class="grow"></div>
                        <i class="material-icons text-2xl text-lime-500 hover:bg-lime-500 hover:text-slate-900 cursor-pointer rounded-full w-8 h-8"
                            @click="endpoint.show = !endpoint.show; window.glb.apiEndpoints.find(x => x.url == endpoint.url).show = endpoint.show"
                            v-text="endpoint.show ? 'expand_less' : 'expand_more'"></i>
                        <div class="btn" @click="sendRequest(endpoint); endpoint.show = true">Send</div>

                    </div>
                    <div class="flex flex-col w-full items-stretch  transition-all p-2"
                        :class="endpoint.show ? 'h-auto' : 'h-0 opacity-0 pointer-events-none'">
                        <!-- <textarea class="result bg-slate-500 p-2 border border-l-4 border-lime-500"
                            v-model="endpoint.body"></textarea> -->
                        <JsonEditorVue class="jse-theme-dark" v-model="endpoint.body" value="'hello'"
                            v-bind="{/* local config */ }" />

                        <JsonViewer :value="endpoint.res || {}" class="bg-zinc-800" theme="my-awesome-json-theme">
                        </JsonViewer>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>