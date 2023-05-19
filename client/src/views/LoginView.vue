<script setup>
import glb from "@/composables/glb";
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const rememberMe = ref(true);

window.glb.showSignUp = window.glb.showSignUp || false;
const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const username = ref("");

const errorMessage = ref("");
const isPwd = ref(true);
async function signUp() {
  const [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/registerUser", {
    email: email.value,
    password: password.value,
  }));
  if (err || !res) {
    errorMessage.value = window.glb.errorMessages(err);
    if (hideTimeout.value)
      clearTimeout(hideTimeout.value);
    hideTimeout.value = setTimeout(() => errorMessage.value = "", 3000);
    window.glb.addNotf(err)
    return;
  }

  const user = res.data;
  console.log(user)
  window.glb.loggedIn = true;
  window.glb.user = user.user;
  window.glb.jwt = user.jwt;
  router.push("/")

}
async function login() {
  const [err, res] = await window.glb.safeAsync(axios.post(glb.baseUrl + "/api/loginUser", {
    email: email.value,
    password: password.value,
  }));
  if (err || !res) {
    errorMessage.value = window.glb.errorMessages(err);
    if (hideTimeout.value)
      clearTimeout(hideTimeout.value);
    hideTimeout.value = setTimeout(() => errorMessage.value = "", 3000);
    return;
  }
  const user = res.data;
  console.log(user)

  window.glb.loggedIn = true;
  window.glb.user = user.user;
  window.glb.jwt = user.jwt;
  router.push("/")
}
const hideTimeout = ref(null);

async function loginWithGoogle() {

  const clientId = '479533631965-jbl68e4tc4pfk9iesjr04kcq7tt3po0q.apps.googleusercontent.com';
  const redirectUri = window.glb.baseUrl + '/oauth2callback';
  const scopes = ['profile', 'email'];
  const access_type = 'offline';
  const include_granted_scopes = 'true'

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&prompt=consent&scope=${scopes.join('%20')}&access_type=${access_type}&include_granted_scopes=${include_granted_scopes}`;

  window.location.href = authUrl;
}


</script>

<template>
    <div class="flex flex-col w-full h-full  ">
      <div class="flex flex-col  w-full h-full bg-cyan-900 overflow-auto">
          <div
            class="flex flex-col justify-center items-center login border w-96 self-center rounded m-6 transition pb-8 space-y-4 bg-gray-900"
            @mouseover="">
            <div class="bg-violet-900/50  w-full flex flex-nowrap items-center justify-around rounded">
              <div
                :class="!window.glb.showSignUp && 'bg-indigo-700 border-b-2 border-red-500 shadow-white' || 'text-gray-500'"
                class=" p-4 w-full center-main rounded-t" @click="window.glb.showSignUp = false">
                Login
              </div>
              <div
                :class="window.glb.showSignUp && 'bg-indigo-700 border-b-2 border-red-500 shadow-white' || 'text-gray-500'"
                class=" p-4 w-full center-main rounded-t " @click="window.glb.showSignUp = true">
                Sign Up
              </div>
            </div>
            <div :class="errorMessage != '' ? 'h-16 ' : 'h-0 opacity-0'"
              class="w-full flex flex-col items-center justify-center transition-all">

              <div class="flex w-full items-center justify-center space-x-2">
                <i class="fa text-yellow-400 fa-exclamation-triangle"></i>
                <div v-text="errorMessage" class="py-2  "></div>
                <!-- devider -->
              </div>
              <div class="w-3/4 h-0.5 bg-red-600"></div>
            </div>
            <form id="signupForm" method="post" @submit.prevent=""
              class="space-y-4 flex  flex-col items-start m-2 without-ring" v-if="!window.glb.showSignUp">
              <div class="flex-row login-error bg-secondary border-b-3 border-red-600"></div>
              <q-input color="blue" bg-color="" dark filled v-model="email" label="Email"
                class="w-64 without-ring border-b-white" hint="* Required">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input color="blue" bg-color="" dark filled v-model="password" :type="isPwd ? 'password' : 'text'"
                label="Password" class="w-64 without-ring border-b-white" hint="Optional">
                <template v-slot:prepend>
                  <q-icon name="key" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                </template>
              </q-input>
              <q-checkbox label="Remember me" v-model="rememberMe" dark />
              <a type="submit" class="btn hover-ripple" @click="login" v-ripple>Submit</a>
              <p class="text-white">Not registered yet? <a class="link text-white" @click="window.glb.showSignUp = true">
                  Sign
                  Up </a> </p>
            </form>
            <form v-else class="space-y-4 flex  flex-col items-start m-2 without-ring" id="loginForm" method="post"
              @submit.prevent="">
              <div class=" flex-row login-error bg-secondary border-b-3 border-red-600">
              </div>

              <div class="w-64 flex space-x-1">
                <q-input color="blue" bg-color="" dark filled v-model="firstName" label="Firstname"
                  class=" w-1/2 without-ring border-b-white" hint="Optional">
                </q-input>
                <q-input color="blue" bg-color="" dark filled v-model="lastName" label="Lastname"
                  class=" w-1/2 without-ring border-b-white" hint="Optional">
                </q-input>
              </div>
              <q-input color="blue" bg-color="" dark filled v-model="username" label="Username"
                class="w-64 without-ring border-b-white" hint="Optional">
                <template v-slot:prepend>
                  <q-icon name="@" />
                </template>
              </q-input>
              <q-input color="blue" bg-color="" dark filled v-model="email" label="Email"
                class="w-64 without-ring border-b-white" hint="* Required">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input color="blue" bg-color="" dark filled v-model="password" :type="isPwd ? 'password' : 'text'"
                label="Password" class="w-64 without-ring border-b-white" hint="Optional">
                <template v-slot:prepend>
                  <q-icon name="key" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                </template>
              </q-input>
              <q-checkbox label="Remember me" v-model="rememberMe" dark />
              <a type="submit" class="btn hover-ripple" @click="signUp" v-ripple>Submit</a>
              <p class="text-white">Have an account? <a class="link text-white" @click="window.glb.showSignUp = false">
                  Login
                </a> </p>
            </form>

            <div class="flex flex-col items-start ">
              <div class="">
                Other Ways To Login
              </div>
              <button class="btn hover-ripple" @click="loginWithGoogle" v-ripple>Sign In With
                Google</button>
            </div>

          </div>

        </div>
  </div>
</template> 

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
  height: 100px;
}

.v-enter-from,
.v-leave-to {
  height: 0px;
  opacity: 0;
}
</style>