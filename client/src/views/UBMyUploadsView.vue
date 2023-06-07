<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios';

const fileNames = ref([])
const files = ref([])
const fileData = ref([])
const errorMessage = ref('')


const hideTimeout = ref(null);

async function uploadVideo(idx) {
    const formData = new FormData();
    formData.append('file', files.value[idx]);

    formData.append('thumbnail', new window.Blob([snapshot(fileData.value[idx].thumb)], { type: 'image/jpeg' }), 'thumb.jpg');

    let { thumb, ...rest } = fileData.value[idx];

    for (let key in rest) {
        formData.append(key, rest[key]);
    }

    if (await window.glb.safeAuthedReq('/api/uploadbase/uploadVideos', formData, {
        onUploadProgress: progressEvent => console.log(progressEvent.loaded)
    }))
        removeFile(idx)

}

function removeFile(idx) {

    files.value = Object.values(files.value).filter((f, i) => i != idx)
    fileData.value = Object.values(fileData.value).filter((f, i) => i != idx)
}
onMounted(async () => {
    uploadedVideos.value = await window.glb.safeAuthedReq('/api/uploadbase/getVideoSelf');
})

const uploadedVideos = ref([])
import pic from '@/assets/logo.svg'

var snapshot = function (video) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var imgDataUrl = canvas.toDataURL('image/jpeg');

    // Check if running in Node.js or browser
    if (typeof Buffer !== 'undefined') {
        // Running in Node.js
        var buffer = Buffer.from(imgDataUrl.split(',')[1], 'base64');
        return buffer;
    } else {
        // Running in browser
        var binaryString = atob(imgDataUrl.split(',')[1]);
        var length = binaryString.length;
        var bytes = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
};

function isVideoValid(filename) {
    var videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
    var fileExtension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return videoExtensions.includes(fileExtension);
}
</script>


<template>
    <div class="w-full h-full flex-col center-cross p-6 overflow-auto space-y-6">
        <div :class="errorMessage != '' ? 'h-16 ' : 'h-0 opacity-0'"
            class="w-full flex flex-col items-center justify-center transition-all">
            <div class="flex w-full items-center justify-center space-x-2">
                <i class="fa text-yellow-400 fa-exclamation-triangle"></i>
                <div v-text="errorMessage" class="py-2  "></div>
                <!-- devider -->
            </div>
            <div class="w-3/4 h-0.5 bg-red-600"></div>
        </div>
        <div class="flex flex-col items-stretch center w-full sm:w-96  rounded shadow border-2 themed-bg-secondary">
            <div class="w-full p-2 center themed-bg-tertiary shadow-md border-b-2">New Upload</div>
            <div class="w-full p-1 center themed-bg-tertiary shadow-md border-b-2">
                {{ files?.length + ' files Selected' }}
            </div>
            <div class="flex flex-col px-8 space-y-2 py-2 " v-for="(file, index) in files" v-if="files?.length > 0"
                :key="index">
                <div class="flex center rounded shadow h-10 themed-bg-tertiary">
                    <div class="shrink-0 text-ellipsis overflow-auto line-clamp-1 h-full px-2 flex center rounded-l ">
                        File
                    </div>
                    <div class="overflow-x-auto truncate themed-bg-secondary w-full h-full flex center">
                        {{ file.name }}
                    </div>
                    <div class="grow"></div>
                    <a href="" @click.prevent="removeFile(index)"
                        class="fas fa-times  center  h-full p-2 rounded-r effects-gray">
                    </a>
                </div>
                <!-- <video :src="files[index]"></video> -->
                <q-input :dark="window.glb.dark" color="sky" label="Video Title" v-model="fileData[index].title"
                    hide-details></q-input>
                <q-input :dark="window.glb.dark" color="sky" label="Description" hide-details></q-input>
                <div class="flex flex-col rounded-lg themed-bg-tertiary p-2">

                    <div class="text-lg p-2">Select Thumbnail</div>
                    <div class="relative w-full aspect-video ">
                        <video :ref="(el) => {
                            fileData[index] && (fileData[index].thumb = el)
                            nextTick(() => {
                                el && el.addEventListener('loadedmetadata', () => {
                                    el.currentTime = Math.random() * el.duration;
                                })
                            })
                        }" muted controls :src="(file) ? window.URL.createObjectURL(file) : pic" class="full"
                            :class="isVideoValid(file.name) ? 'opacity-100' : 'opacity-0'" />
                        <div class="absolute inset-0 flex center" v-if="!isVideoValid(file.name)">
                            <div class="flex flex-col center">
                                <i class="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                                <div class="text-red-500">Invalid Video Format</div>
                            </div>
                        </div>
                    </div>
                </div>

                <a href="" @click.prevent="() => uploadVideo(index)"
                    class="flex fas fa-up shadow-md  p-3 rounded effects-blue themed-bg-tertiary self-center">
                    Submit
                </a>
            </div>
            <div for="file-upload" class="p-2 sm:p-6 sm:px-10 flex space-y-2 sm:space-y-6 flex-col center bg-blue-600 m-4 rounded shadow active:shadow-xl self-center"
                v-if="files?.length == 0">
                <q-icon class="themed-text-primary text-4xl sm:text-8xl" name="cloud_upload"></q-icon>
                <div class="p-2 btn bg-red-500 z-10" @click="window.glb.getFileInput((event) => {
                    const selectedFiles = event.target.files;
                    files = selectedFiles;
                    fileData = [...files].map(f => {
                        return {
                            title: f.name,
                            name: f.name,
                            size: f.size,
                            type: f.type,
                            lastModified: f.lastModified,
                            lastModifiedDate: f.lastModifiedDate,
                        }
                    })
                })">Pick File(s)</div>
            </div>
        </div>
        <div class="card w-full sm:w-96 themed-bg-secondary">
            <div class="card-header themed-bg-tertiary">
                Uploads
            </div>
            <div class="card-body rounded-b min-h-[5rem]" v-if="uploadedVideos">
                <table class=" w-full table-fixed " v-if="uploadedVideos.length > 0">
                    <tr v-for="upd in uploadedVideos" class="">
                        <td class="break-words text-xs text-center">{{ window.glb.getFormattedDate(new Date(upd.createdAt))
                        }}</td>
                        <td class="break-words text-xs text-center">{{ upd.title }}</td>
                        <td class="break-words text-xs text-center">{{ (upd.views || 0) + ' Views' }}</td>
                    </tr>
                </table>
                <div class="center full" v-else>
                    <div class="text-center text-gray-400">No Uploads</div>
                </div>
            </div>
        </div>
    </div>
</template>