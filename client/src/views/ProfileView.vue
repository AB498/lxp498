<script setup>
import glb from "@/composables/glb";
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, reactive, onMounted, nextTick } from 'vue'
import axios from 'axios'
import langsImp from "../assets/json/langs_out.json";
import SelectLang from "src/components/SelectLang.vue";

const router = useRouter()
const route = useRoute()

onMounted(async () => {
 await window.glb.reloadUser();
  uploadedVideos.value = await window.glb.safeAuthedReq('/api/uploadbase/getVideoSelf');
})

let langs = ref(Object.entries(langsImp).map(([key, value]) => {
  return {
    languagecode: value['languagecode'],
    languagename: value['languagename'],
    countrynames: value['countrynames'],
    countrycodes: value['countrycodes'],
    isocode: value['isocode'],
  };
}).sort((a, b) => {
  if (a.languagename < b.languagename) return -1;
  if (a.languagename > b.languagename) return 1;
  return 0;
}))

const langsToggle = reactive(Object.fromEntries(Object.entries(langs.value).map((obj) => {
  return [obj.languagename, true]
})))

const editMode = ref(false)

const firstName = ref("");
const lastName = ref("");
const username = ref("");
const password = ref("");
const email = ref("");

async function saveEdits() {
  editMode.value = false;
  console.log(window.glb.tryStringify())
  const [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/updateSelf", {
    firstName: window.glb.user.firstName,
    lastName: window.glb.user.lastName,
    username: window.glb.user.username,
    email: window.glb.user.email,
    learningLanguages: ([...(window.glb.user.learningLanguages || [])]),
    password: password.value,
    nativeLanguages: ([...(window.glb.user.nativeLanguages || [])]),
    country: window.glb.user.country
  },
    {
      headers: {
        Authorization: "Bearer " + window.glb.jwt,
      }
    }
  ));
  if (err || !res) {
    window.glb.addNotf((err));
    return;
  }
  await window.glb.reloadUser();

}
const tab = ref('mails')


const uploadedVideos = ref([])

import pic from '@/assets/logo.svg'

</script>

<template>
  <div class="flex flex-col w-full h-full">
    <div class="flex w-full h-full">
      <div class=" relative w-[400px] h-full flex flex-col overflow-auto border-r-2 left-part shadow-xl">
        <div class="flex flex-col w-full sticky top-0 backdrop-blur-md z-10">
          <img :src="window.glb.user.pfpUrl || pic " class="w-32 h-32  self-center" />
          <div class=" w-full flex justify-center items-center px-4 themed-bg-secondary shadow-md">
            <div class=""> User Info</div>
            <div class="grow"> </div>
            <div v-ripple class="editProfileButton btn m-1 p-1 hover-ripple px-3" @click="editMode = true"
              v-if="!editMode">
              Edit</div>
            <div v-ripple class="editProfileButton btn m-1 p-1 hover-ripple px-3" @click="editMode = false"
              v-if="editMode">
              Cancel
            </div>
            <div v-ripple class="editProfileButton btn m-1 p-1 hover-ripple px-3" @click="editMode = false; saveEdits()"
              v-if="editMode">
              Save
            </div>

          </div>
        </div>
        <div class="p-2"></div>
        <div class="px-4 ">
          <!-- name -->
          <div class="flex flex-col text-md ">
            <div class="name text-2xl" @click="window.console.log(window.glb)" v-if="!editMode">
              {{ (window.glb.user.firstName + ' ' + window.glb.user.lastName) }}
            </div>
            <div v-else>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">
                    Fisrt Name
                  </div>
                </template> <template v-slot:control>
                  <input class="w-full h-full bg-transparent" v-model="window.glb.user.firstName">
                </template>
              </q-field>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">
                    Last Name
                  </div>
                </template> <template v-slot:control>
                  <input class="w-full h-full bg-transparent" v-model="window.glb.user.lastName">
                </template>
              </q-field>

            </div>
            <!-- username -->
            <div class="window.glb.username" v-if="!editMode">@{{ window.glb.user.username || 'Unavailable' }}</div>
            <div v-else>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">
                    Username
                  </div>
                </template> <template v-slot:control>
                  <input class="w-full h-full bg-transparent" v-model="window.glb.user.username">
                </template>
              </q-field>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">
                    Password
                  </div>
                </template> <template v-slot:control>
                  <input class="w-full h-full bg-transparent" v-model="password">
                </template>
              </q-field>

            </div>
          </div>

          <!-- score -->
          <div class="flex flex-col text-md ">

            <div class="score ">{{ 'Rank: ' + (window.glb.user.rank || 'Novice') }}</div>
            <div class="uid">Identifier: {{ window.glb.user.id || 'Unavailable' }}</div>
            <br>
            <q-field filled :dark="window.glb?.dark" stack-label label="Bio">
              <template v-slot:control>
                <input class="w-full h-full bg-transparent" :readonly="!editMode"
                  :value="window.glb.user.bio || 'No Bio ...'">
              </template>
            </q-field>
          </div>

          <br>




          <!-- email -->
          <q-field :dark="window.glb?.dark" filled outlined>
            <template v-slot:prepend>
              <div class="text-sm">
                Email
              </div>
            </template> <template v-slot:control>
              <input class="w-full h-full bg-transparent" :readonly="!editMode" v-model="window.glb.user.email">
            </template>
          </q-field>
          <q-field :dark="window.glb?.dark" filled outlined>
            <template v-slot:prepend>
              <div class="text-sm">
                Country
              </div>
            </template> <template v-slot:control>
              <input class="w-full h-full bg-transparent" :readonly="!editMode" v-model="window.glb.user.country">
            </template>
          </q-field>
          <q-field :dark="window.glb?.dark" filled outlined>
            <template v-slot:prepend>
              <div class="text-sm">
                Joined
              </div>
            </template> <template v-slot:control>
              <input class="w-full h-full bg-transparent" readonly :disabled="editMode"
                :value="window.glb.getFormattedDate(new Date(window.glb.user.createdAt))">
            </template>
          </q-field>
          <!-- id -->
          <!-- langsknown -->
          <div class="known-languages py-2  flex flex-col">
            <div class="rounded-t-md themed-bg-tertiary p-2 flex center">
              <div class="">Languages you know</div>
              <div class="grow"></div>
              <div class="btn" v-if="editMode" @click="window.glb.openSelectLang({ multiselect: true, startingPoint: window.glb.user.nativeLanguages }, (e) => {
                console.log(e)
                window.glb.user.nativeLanguages = e
              })">Edit</div>
            </div>
            <div class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2"
              v-if="window.glb.user.nativeLanguages?.length > 0">
              <div v-for="lang in window.glb.user.nativeLanguages">
                <q-chip :removable="editMode"
                  @remove="window.glb.removeByProp(window.glb.user.nativeLanguages, e => e.languagename == lang.languagename)">
                  <q-avatar>
                    <img class="rounded-full p-1" :src="'https://flagcdn.com/h60/' + lang.countrycodes[0] + '.png'" />
                  </q-avatar>
                  {{ lang.languagename }}</q-chip>
              </div>
            </div>
            <div class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2" v-else>
              Nothing Selected
            </div>
          </div>
          <div class="learning-languages py-2  flex flex-col">
            <div class="rounded-t-md themed-bg-tertiary p-2 flex center border-b-2">
              <div class="">Languages you're learning</div>
              <div class="grow"></div>
              <div class="btn" v-if="editMode" @click="window.glb.openSelectLang({ multiselect: true, startingPoint: window.glb.user.learningLanguages }, (e) => {
                console.log(e)
                window.glb.user.learningLanguages = e
              })">Edit</div>
            </div>
            <div class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2"
              v-if="window.glb.user.learningLanguages?.length > 0">
              <div v-for="lang in window.glb.user.learningLanguages">
                <q-chip :removable="editMode"
                  @remove="window.glb.removeByProp(window.glb.user.learningLanguages, e => e.languagename == lang.languagename)">
                  <q-avatar>
                    <img class="rounded-full p-1" :src="'https://flagcdn.com/h60/' + lang.countrycodes[0] + '.png'" />
                  </q-avatar>
                  {{ lang.languagename }}</q-chip>
              </div>
            </div>
            <div class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2" v-else>
              Nothing Selected
            </div>
          </div>
        </div>

      </div>

      <div class="basis-9/12 h-full flex flex-col items-center  ">

        <div class="card w-96 m-6 themed-bg-secondary">
          <div class="card-header themed-bg-tertiary">
            Uploads
          </div>
          <div class="card-body rounded-b min-h-[5rem]">
            <table class=" w-full table-fixed ">

              <tr v-for="upd in uploadedVideos" class="">
                <td class=" text-center">{{ window.glb.getFormattedDate(new Date(upd.createdAt)) }}</td>
                <td class=" text-center">{{ upd.title }}</td>
                <td class=" text-center">{{ (upd.views || 0) + ' Views' }}</td>
              </tr>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template> 