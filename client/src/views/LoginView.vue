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
const errorMessage = ref("");

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
  window.glb.lxsocket.socketObj.connect();

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
  window.glb.lxsocket.socketObj.connect();
}
const hideTimeout = ref(null);

async function loginWithGoogle() {

  const clientId = 'YOUR_CLIENT_ID';
  const redirectUri = 'http://34.142.131.205:8080/oauth2callback';
  const scopes = ['profile', 'email'];

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join('%20')}`;

  window.location.href = authUrl;
}

</script>

<template>
    <div class="flex flex-col w-full h-full ">
    <div class="flex flex-col w-full h-full bg-cyan-900">
      <div
        class="flex flex-col justify-center items-center login border w-96 self-center rounded m-6 transition pb-8 space-y-4 bg-gray-900"
        @mouseover="">
        <div class="bg-violet-900/50  w-full flex items-center justify-around rounded">
          <div
            :class="!window.glb.showSignUp && 'bg-indigo-700 border-b-2 border-red-500 shadow-white' || 'text-gray-500'"
            class=" p-4 w-full center-main rounded-t" @click="window.glb.showSignUp = false">
            Login
          </div>
          <div :class="window.glb.showSignUp && 'bg-indigo-700 border-b-2 border-red-500 shadow-white' || 'text-gray-500'"
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

        <form id="loginForm" method="post" @submit.prevent="" class="space-y-4 m-2" v-if="!window.glb.showSignUp">
          <div class="flex-row login-error bg-secondary border-b-3 border-red-600"></div>
          <v-text-field type="email" label="Email" v-model="email" hide-details class="w-64"></v-text-field>
          <v-text-field type="password" label="Password" v-model="password" hide-details class="w-64"></v-text-field>
          <label class="form-check-label space-x-2 center-cross hover-ripple p-2 rounded" v-ripple>
            <input class="w-4 h-4" type="checkbox" name="remember" v-model="rememberMe">
            <span class="text-white ">Remember me</span>
          </label>
          <a type="submit" class="btn hover-ripple" @click="login" v-ripple>Submit</a>
          <p class="text-white">Not registered yet? <a class="link text-white" @click="window.glb.showSignUp = true"> Sign
              Up </a> </p>
        </form>
        <form v-else id="loginForm" method="post" @submit.prevent="" class="space-y-4 m-2">
          <div class=" flex-row login-error bg-secondary border-b-3 border-red-600">
          </div>
          <v-text-field type="email" label="Email" v-model="email" hide-details class="w-64"></v-text-field>
          <v-text-field type="password" label="Password" v-model="password" hide-details class="w-64"></v-text-field>
          <label class="form-check-label space-x-2 center-cross hover-ripple p-2 rounded" v-ripple>
            <input class="w-4 h-4" type="checkbox" name="remember" v-model="rememberMe">
            <span class="text-white ">Remember me</span>
          </label>
          <a type="submit" class="btn hover-ripple" @click="signUp" v-ripple>Submit</a>
          <p class="text-white">Have an account? <a class="link text-white" @click="window.glb.showSignUp = false"> Login
            </a> </p>
        </form>

        <button class="btn border border-red-600 hover-ripple" @click="loginWithGoogle" v-ripple>Google</button>

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