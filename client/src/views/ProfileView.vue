<script setup>
import glb from "@/composables/glb";
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  window.glb.reloadUser();
})

const editMode = ref(false)

const firstName = ref("");
const lastName = ref("");
const username = ref("");
const password = ref("");
const email = ref("");

async function saveEdits() {
  editMode.value = false;
  const [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/updateSelf", {
    firstName: firstName.value,
    lastName: lastName.value,
    username: username.value,
    password: password.value,
    email: email.value,
  },
    {
      headers: {
        Authorization: "Bearer " + window.glb.jwt,
      }
    }
  ));
  if (err || !res) {
    window.glb.addNotf(window.glb.errorMessages(err));
    return;
  }
  await window.glb.reloadUser();

}
</script>

<template>
    <div class="flex flex-col w-full h-full">
      <div class="flex w-full h-full">
        <div class="basis-2/6 h-full flex flex-col overflow-auto">
          <img src="@/assets/logo.svg" class="w-96 h-32 bg-blue-400/25 self-center" />
          <div class="bg-cyan-800 w-full flex justify-center items-center px-4 ">
            <div class=""> User Info</div>
            <div class="grow"> </div>
                <div v-ripple class="editProfileButton btn m-1 p-1 hover-ripple" @click="editMode = true" v-if="!editMode">
                  Edit</div>
                <div v-ripple class="editProfileButton btn m-1 p-1 hover-ripple" @click="saveEdits" v-if="editMode">
                  Save</div>

              </div>
              <div class="p-2"></div>
              <div class="px-4" v-if="!editMode">
                <!-- name -->
                <div class="name" @click="window.console.log(window.glb)">
                  {{ (window.glb.user.firstName + ' ' + window.glb.user.lastName) }}
                </div>
                <!-- username -->
                <div class="window.glb.username">Username: {{ window.glb.user.username || 'Unavailable' }}</div>
                <!-- score -->
                <div class="score font-mono">{{ 'Score: ' + (window.glb.user.score || 'Unavailable') }}</div>
                <!-- email -->
                <div class="email">Email: {{ window.glb.user.email || 'Unavailable' }}</div>
                <!-- id -->
                <div class="uid">Identifier: {{ window.glb.user.ownId || 'Unavailable' }}</div>
                <v-divider></v-divider>
                <!-- langsknown -->
                <div class="known-languages">
                  <div class="language">English</div>
                  <div class="language">French</div>
                  <div class="language">Spanish</div>
                </div>


              </div>
              <div v-else class="flex flex-col center-cross">
                <div class="w-64 flex space-x-1">
                  <q-input color="blue" bg-color="" dark filled v-model="firstName" label="Firstname"
                    class=" w-1/2 without-ring border-b-white" hint="Optional">
                  </q-input>
                  <q-input color="blue" bg-color="" dark filled v-model="lastName" label="Lastname"
                    class=" w-1/2 without-ring border-b-white" hint="Optional">
                  </q-input>
                </div>
                <!-- username -->
                <q-input color="blue" bg-color="" dark filled v-model="username" label="Username"
                  class="w-64 without-ring border-b-white" hint="Optional">
                </q-input>
                <!-- email -->
                <q-input color="blue" bg-color="" dark filled v-model="email" label="Email"
                  class="w-64 without-ring border-b-white" hint="* Required">
                </q-input>
                <!-- pass -->
                <q-input color="blue" bg-color="" dark filled v-model="password" label="Password"
                  class="w-64 without-ring border-b-white" hint="Optional">
                </q-input>
                <v-text-field label="Last Name"></v-text-field>
                <!-- score -->
          <v-text-field label="Email"></v-text-field>
          <!-- id -->
          <v-divider></v-divider>
          <!-- langsknown -->
          <div class="known-languages">
            <v-text-field label="Search Languages"></v-text-field>
            <div class="flex w-full flex-wrap">
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
              <div class="px-1 m-1 rounded-md bg-blue-800">ddsffa</div>
            </div>

          </div>
        </div>
      </div>

      <div class="basis-4/6 h-full flex flex-col items-center bg-cyan-950 ">

        <div class="card w-96 mt-6">
          <div class="card-header">
            My Uploads
          </div>
          <div class="card-body rounded-b min-h-[5rem]">
            Nothing found
          </div>
        </div>
        <div class="card w-96 m-6">
          <div class="card-header">
            Contributions
          </div>
          <div class="card-body rounded-b min-h-[5rem]">
            Nothing found
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 