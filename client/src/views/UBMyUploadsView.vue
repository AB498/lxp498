<script setup>
import { ref, onMounted } from 'vue'
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
onMounted(async () => {
    uploadedVideos.value = await window.glb.safeAuthedReq('/api/uploadbase/getVideoSelf');
})

const uploadedVideos = ref([])

</script>


<template>
    <div class="w-full h-full flex-col center-cross p-6 overflow-auto">
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
                {{ fileNames?.length + ' files Selected' }}
            </div>
                <div class="flex flex-col px-8 space-y-2 py-2 " v-for="(fileName, index) in fileNames"
                v-if="fileNames?.length > 0" :key="index">
                <div class="flex center rounded shadow h-10 themed-bg-tertiary">
                    <div
                        class="shrink-0 text-ellipsis overflow-auto line-clamp-1 h-full px-2 flex center rounded-l ">
                        File
                    </div>
                    <div class="overflow-x-auto truncate themed-bg-secondary w-full h-full flex center">
                        {{ fileName }}
                    </div>
                    <div class="grow"></div>
                    <a href="" @click.prevent="removeFile(index)"
                        class="fas fa-times  center  h-full p-2 rounded-r effects-gray">
                    </a>
                </div>
                <!-- <video :src="files[index]"></video> -->
                <q-input :dark="window.glb.dark" color="sky" label="Video Title" v-model="fileData[index].title" hide-details></q-input>
                <q-input :dark="window.glb.dark" color="sky" label="Description" hide-details></q-input>
                <label :for="'pic-upload' + index"
                    class="fas p-3 fa-upload bg-blue-600 m-2 rounded shadow active:shadow-xl self-center"
                    v-if="fileNames?.length == 0">
                    <input :id="'pic-upload' + index" type="file" v-on:change="picChange($event, index)" class="hidden"
                        name="files" />
                    Select Thumbnail
                </label>
                <a href="" @click.prevent="() => uploadVideo(index)"
                    class="flex fas fa-up shadow-md  p-3 rounded effects-blue themed-bg-tertiary self-center">
                    Submit
                </a>
            </div>
            <label for="file-upload" class="fas p-3 fa-upload bg-blue-600 m-2 rounded shadow active:shadow-xl self-center"
                v-if="fileNames?.length == 0">
                <input id="file-upload" type="file" v-on:change="fileChange" class="hidden" multiple name="files" />
                Select File(s)
            </label>
        </div>
        <div class="card w-full sm:w-96 m-6 themed-bg-secondary">
            <div class="card-header themed-bg-tertiary">
                Uploads
            </div>
            <div class="card-body rounded-b min-h-[5rem]" v-if="uploadedVideos">
                <table class=" w-full table-fixed " v-if="uploadedVideos.length > 0">
                    <tr v-for="upd in uploadedVideos" class="" >
                        <td class="break-words text-xs text-center">{{ window.glb.getFormattedDate(new Date(upd.createdAt)) }}</td>
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