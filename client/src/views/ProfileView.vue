<script setup>
import glb from "@/composables/glb";
import { useRouter, useRoute } from "vue-router";
import { ref, watch, onUnmounted, reactive, onMounted, nextTick } from "vue";
import axios from "axios";
import langsImp from "../assets/json/langs_out.json";
import SelectLang from "src/components/SelectLang.vue";

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  await window.glb.reloadUser();
  uploadedVideos.value = await window.glb.safeAuthedReq(
    "/api/uploadbase/getVideoSelf"
  );
});

let langs = ref(
  Object.entries(langsImp)
    .map(([key, value]) => {
      return {
        languagecode: value["languagecode"],
        languagename: value["languagename"],
        countrynames: value["countrynames"],
        countrycodes: value["countrycodes"],
        isocode: value["isocode"],
      };
    })
    .sort((a, b) => {
      if (a.languagename < b.languagename) return -1;
      if (a.languagename > b.languagename) return 1;
      return 0;
    })
);

const langsToggle = reactive(
  Object.fromEntries(
    Object.entries(langs.value).map((obj) => {
      return [obj.languagename, true];
    })
  )
);

const editMode = ref(false);

const firstName = ref("");
const lastName = ref("");
const username = ref("");
const password = ref("");
const email = ref("");

async function saveEdits() {
  editMode.value = false;

  const formData = new FormData();
  formData.append("pfpFile", pfpFile.value);

  let body = {
    firstName: window.glb.user.firstName,
    lastName: window.glb.user.lastName,
    username: window.glb.user.username,
    email: window.glb.user.email,
    learningLanguages: [...(window.glb.user.learningLanguages || [])],
    password: password.value,
    nativeLanguages: [...(window.glb.user.nativeLanguages || [])],
    country: window.glb.user.country,
  };

  for (let key in body) {
    formData.append(key, body[key]);
  }

  const [err, res] = await window.glb.safeAsync(
    axios.post(glb.baseUrl + "/api/updateSelf", formData, {
      headers: {
        Authorization: "Bearer " + window.glb.jwt,
      },
    })
  );
  if (err || !res) {
    window.glb.addNotf(err);
    return;
  }
  await window.glb.reloadUser();
}
const tab = ref("mails");

watch(
  () => window.glb.user.pfpUrl,
  (newVal, oldVal) => {}
);

const uploadedVideos = ref([]);

import pic from "@/assets/logo.svg";

const pfpFile = ref(null);
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <div class="flex w-full h-full sm:flex-row flex-col border overflow-auto">
      <div
        class="shrink-0 relative w-full flex-col sm:w-[400px] sm:overflow-auto flex sm: border-r-2 left-part shadow-xl"
      >
        <div class="flex flex-col w-full sticky top-0 backdrop-blur-md z-10">
          <div class="relative w-32 h-32 self-center">
            <div
              class="absolute full opacity-50 hover:opacity-100 bg-blue-400 backdrop-blur-sm bg-opacity-5 center"
              v-if="editMode"
            >
              <div
                class="p-2 btn bg-red-500 z-10"
                @click="
                  window.glb.getFileInput((event) => {
                    const selectedFiles = event.target.files;
                    selectedFiles;
                    pfpFile = selectedFiles[0];
                  })
                "
              >
                Pick File
              </div>
            </div>
            <img
              :src="
                pfpFile && editMode
                  ? window.URL.createObjectURL(pfpFile)
                  : window.glb.baseUrl +
                      window.glb.user.pfpUrl +
                      '?' +
                      new Date().getTime() || pic
              "
              class="full"
            />
          </div>
          <div
            class="w-full flex justify-center items-center px-4 themed-bg-secondary shadow-md"
          >
            <div class="">User Info</div>
            <div class="grow"></div>
            <div
              v-ripple
              class="editProfileButton btn m-1 p-1 hover-ripple px-3"
              @click="editMode = true"
              v-if="!editMode"
            >
              Edit
            </div>
            <div
              v-ripple
              class="editProfileButton btn m-1 p-1 hover-ripple px-3"
              @click="editMode = false"
              v-if="editMode"
            >
              Cancel
            </div>
            <div
              v-ripple
              class="editProfileButton btn m-1 p-1 hover-ripple px-3"
              @click="
                editMode = false;
                saveEdits();
              "
              v-if="editMode"
            >
              Save
            </div>
          </div>
        </div>
        <div class="p-2"></div>
        <div class="px-4">
          <!-- name -->
          <div class="flex flex-col text-md">
            <div class="name text-2xl" @click="" v-if="!editMode">
              {{ window.glb.user.firstName + " " + window.glb.user.lastName }}
            </div>
            <div v-else>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">Fisrt Name</div>
                </template>
                <template v-slot:control>
                  <input
                    class="w-full h-full bg-transparent"
                    v-model="window.glb.user.firstName"
                  />
                </template>
              </q-field>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">Last Name</div>
                </template>
                <template v-slot:control>
                  <input
                    class="w-full h-full bg-transparent"
                    v-model="window.glb.user.lastName"
                  />
                </template>
              </q-field>
            </div>
            <!-- username -->
            <div class="window.glb.username" v-if="!editMode">
              @{{ window.glb.user.username || "Unavailable" }}
            </div>
            <div v-else>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">Username</div>
                </template>
                <template v-slot:control>
                  <input
                    class="w-full h-full bg-transparent"
                    v-model="window.glb.user.username"
                  />
                </template>
              </q-field>
              <q-field :dark="window.glb?.dark" filled outlined>
                <template v-slot:prepend>
                  <div class="text-sm">Password</div>
                </template>
                <template v-slot:control>
                  <input
                    class="w-full h-full bg-transparent"
                    v-model="password"
                  />
                </template>
              </q-field>
            </div>
          </div>

          <!-- score -->
          <div class="flex flex-col text-md">
            <div class="score">
              {{ "Rank: " + (window.glb.user.rank || "Novice") }}
            </div>
            <div class="uid">
              Identifier: {{ window.glb.user.id || "Unavailable" }}
            </div>
            <br />
            <q-field filled :dark="window.glb?.dark" stack-label label="Bio">
              <template v-slot:control>
                <input
                  class="w-full h-full bg-transparent"
                  :readonly="!editMode"
                  :value="window.glb.user.bio || 'No Bio ...'"
                />
              </template>
            </q-field>
          </div>

          <br />

          <!-- email -->
          <q-field :dark="window.glb?.dark" filled outlined>
            <template v-slot:prepend>
              <div class="text-sm">Email</div>
            </template>
            <template v-slot:control>
              <input
                class="w-full h-full bg-transparent"
                :readonly="!editMode"
                v-model="window.glb.user.email"
              />
            </template>
          </q-field>
          <q-field :dark="window.glb?.dark" filled outlined>
            <template v-slot:prepend>
              <div class="text-sm">Country</div>
            </template>
            <template v-slot:control>
              <input
                class="w-full h-full bg-transparent"
                :readonly="!editMode"
                v-model="window.glb.user.country"
              />
            </template>
          </q-field>
          <q-field :dark="window.glb?.dark" filled outlined>
            <template v-slot:prepend>
              <div class="text-sm">Joined</div>
            </template>
            <template v-slot:control>
              <input
                class="w-full h-full bg-transparent"
                readonly
                :disabled="editMode"
                :value="
                  window.glb.getFormattedDate(
                    new Date(window.glb.user.createdAt)
                  )
                "
              />
            </template>
          </q-field>
          <!-- id -->
          <!-- langsknown -->
          <div class="known-languages py-2 flex flex-col">
            <div class="rounded-t-md themed-bg-tertiary p-2 flex center">
              <div class="">Languages you know</div>
              <div class="grow"></div>
              <div
                class="btn"
                v-if="editMode"
                @click="
                  window.glb.openSelectLang(
                    {
                      multiselect: true,
                      startingPoint: window.glb.user.nativeLanguages,
                    },
                    (e) => {
                      window.glb.user.nativeLanguages = e;
                    }
                  )
                "
              >
                Edit
              </div>
            </div>
            <div
              class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2"
              v-if="window.glb.user.nativeLanguages?.length > 0"
            >
              <div v-for="lang in window.glb.user.nativeLanguages">
                <q-chip
                  :removable="editMode"
                  @remove="
                    window.glb.removeByProp(
                      window.glb.user.nativeLanguages,
                      (e) => e.languagename == lang.languagename
                    )
                  "
                >
                  <q-avatar>
                    <img
                      class="rounded-full p-1"
                      :src="
                        'https://flagcdn.com/h60/' +
                        lang.countrycodes[0] +
                        '.png'
                      "
                    />
                  </q-avatar>
                  {{ lang.languagename }}</q-chip
                >
              </div>
            </div>
            <div
              class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2"
              v-else
            >
              Nothing Selected
            </div>
          </div>
          <div class="learning-languages py-2 flex flex-col">
            <div
              class="rounded-t-md themed-bg-tertiary p-2 flex center border-b-2"
            >
              <div class="">Languages you're learning</div>
              <div class="grow"></div>
              <div
                class="btn"
                v-if="editMode"
                @click="
                  window.glb.openSelectLang(
                    {
                      multiselect: true,
                      startingPoint: window.glb.user.learningLanguages,
                    },
                    (e) => {
                      window.glb.user.learningLanguages = e;
                    }
                  )
                "
              >
                Edit
              </div>
            </div>
            <div
              class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2"
              v-if="window.glb.user.learningLanguages?.length > 0"
            >
              <div v-for="lang in window.glb.user.learningLanguages">
                <q-chip
                  :removable="editMode"
                  @remove="
                    window.glb.removeByProp(
                      window.glb.user.learningLanguages,
                      (e) => e.languagename == lang.languagename
                    )
                  "
                >
                  <q-avatar>
                    <img
                      class="rounded-full p-1"
                      :src="
                        'https://flagcdn.com/h60/' +
                        lang.countrycodes[0] +
                        '.png'
                      "
                    />
                  </q-avatar>
                  {{ lang.languagename }}</q-chip
                >
              </div>
            </div>
            <div
              class="flex w-full flex-wrap themed-bg-secondary shadow-md p-2"
              v-else
            >
              Nothing Selected
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center">
        <div class="card sm:w-96 m-6 themed-bg-secondary">
          <div class="card-header themed-bg-tertiary">Uploads</div>

          <div class="card-body rounded-b min-h-[5rem]" v-if="uploadedVideos">
            <table class="w-full table-fixed" v-if="uploadedVideos.length > 0">
              <tr v-for="upd in uploadedVideos" class="">
                <td class="break-words text-xs text-center">
                  {{ window.glb.getFormattedDate(new Date(upd.createdAt)) }}
                </td>
                <td class="break-words text-xs text-center">{{ upd.title }}</td>
                <td class="break-words text-xs text-center">
                  {{ (upd.views || 0) + " Views" }}
                </td>
              </tr>
            </table>
            <div class="center full" v-else>
              <div class="text-center text-gray-400">No Uploads</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
