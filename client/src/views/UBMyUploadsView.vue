<script setup>
import { ref } from 'vue'
import axios from 'axios';

const fileNames = ref([])
const files = ref([])
const fileData = ref([])
const errorMessage = ref('')

function fileChange(e) {
    fileNames.value = [...e.target.files].map(f => f.name)
    files.value = [...e.target.files]
    fileData.value = [...e.target.files].map(f => {
        return {
            title: f.name,
            name: f.name,
            size: f.size,
            type: f.type,
            lastModified: f.lastModified,
            lastModifiedDate: f.lastModifiedDate,
        }
    })
}
const hideTimeout = ref(null);

async function uploadVideo(idx) {
    const formData = new FormData();
    formData.append('files', files.value[idx]);


    formData.append('jsonData', JSON.stringify([fileData.value[idx]]));
    // files.value.forEach(file => {
    // });

    if (await window.glb.safeAuthedReq('/api/uploadbase/uploadVideos', formData))
        removeFile(idx)

}

function removeFile(idx) {
    fileNames.value.splice(idx, 1)
    files.value.splice(idx, 1)
    fileData.value.splice(idx, 1)
}

</script>


<template>
    <div class="w-full h-full bg-cyan-900 flex-col center-cross p-6 overflow-auto">
        <div :class="errorMessage != '' ? 'h-16 ' : 'h-0 opacity-0'"
            class="w-full flex flex-col items-center justify-center transition-all">
            <div class="flex w-full items-center justify-center space-x-2">
                <i class="fa text-yellow-400 fa-exclamation-triangle"></i>
                <div v-text="errorMessage" class="py-2  "></div>
                <!-- devider -->
            </div>
            <div class="w-3/4 h-0.5 bg-red-600"></div>
        </div>
        <div class="flex flex-col items-stretch center w-96 bg-cyan-900 rounded shadow-xl border-2 border-blue-600">
            <div class="w-full p-2 center bg-red-400">New Upload</div>
            <div class="w-full p-1 center bg-red-600/50">
                {{ fileNames.length + ' files Selected' }}

            </div>
            <v-divider :thickness="4"></v-divider>
            <div class="flex flex-col px-8 space-y-2 py-2" v-for="(fileName, index) in fileNames"
                v-if="fileNames.length > 0" :key="index">
                <div class="flex dark center rounded shadow h-10">
                    <div
                        class="bg-slate-600 text-ellipsis overflow-auto line-clamp-1 h-full px-2 flex center rounded-l shrink-0">
                        File
                    </div>
                    <div class="overflow-x-auto truncate  h-full flex center">
                        {{ fileName }}
                    </div>
                    <div class="grow"></div>
                    <a href="" @click.prevent="removeFile(index)"
                        class="fas fa-times text-red-400 bg-slate-600 center  h-full p-2 rounded-r effects-gray">
                    </a>
                </div>
                <!-- <video :src="files[index]"></video> -->
                            <q-input dark color="red" label="Video Title" v-model="fileData[index].title" hide-details></q-input>
                            <q-input dark color="red" label="Description" hide-details></q-input>
                <label :for="'pic-upload' + index"
                    class="fas p-3 fa-upload bg-blue-600 m-2 rounded shadow active:shadow-xl self-center"
                    v-if="fileNames.length == 0">
                    <input :id="'pic-upload' + index" type="file" v-on:change="picChange($event, index)" class="hidden"
                        name="files" />
                    Select Thumbnail
                </label>
                <a href="" @click.prevent="() => uploadVideo(index)"
                    class="flex fas fa-up bg-blue-800 p-3 rounded effects-blue shadow self-center">
                    Submit
                </a>
            </div>
            <label for="file-upload" class="fas p-3 fa-upload bg-blue-600 m-2 rounded shadow active:shadow-xl self-center"
                v-if="fileNames.length == 0">
                <input id="file-upload" type="file" v-on:change="fileChange" class="hidden" multiple name="files" />
                Select File(s)
            </label>
        </div>
    </div>
</template>