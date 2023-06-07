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
  console.log(glb.baseUrl + "/api/loginUser")
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

const tab = ref('login')


</script>

<template>
  <div class="flex flex-col w-full h-full  ">
    <div class="flex flex-col p-4 w-full h-full  overflow-auto">
      <div
        class="flex flex-col themed-bg-secondary justify-center items-center login border w-full sm:w-96 self-center rounded transition pb-8 space-y-4 "
        @mouseover="">
        <q-tabs v-model="tab" class="themed-bg-secondary  shadow w-full " :breakpoint="0">
          <q-tab :class="window.glb.showSignUp ? 'themed-bg-tertiary' : 'themed-bg-primary'" :name="'login'" @click="window.glb.showSignUp = true" class="w-full">
            <div 
            class=" p-4 w-full center-main rounded-t" @click="window.glb.showSignUp = true">
            Login
          </div>
        </q-tab>
        <q-tab :class="!window.glb.showSignUp ? 'themed-bg-tertiary' : 'themed-bg-primary'" :name="'signup'" @click="window.glb.showSignUp = false" class="w-full">
          <div 
          class=" p-4 w-full center-main rounded-t" @click="window.glb.showSignUp = false">
            Sign Up
          </div>
        </q-tab>
        </q-tabs>
        <div :class="errorMessage != '' ? 'h-16 ' : 'h-0 opacity-0'"
          class="w-full flex flex-col items-center justify-center transition-all">

          <div class="flex w-full items-center justify-center space-x-2">
            <i class="fa text-yellow-400 fa-exclamation-triangle"></i>
            <div v-text="errorMessage" class="py-2  "></div>
            <!-- devider -->
          </div>
          <div class="w-3/4 h-0.5 bg-red-600"></div>
        </div>


        <q-tab-panels v-model="tab" animated class="themed-bg-secondary">
          
          <q-tab-panel name="login">
            <form id="loginForm" method="post" @submit.prevent=""
              class=" px-2 space-y-4 flex  flex-col items-start m-2 without-ring">
              <div class="flex-row login-error bg-secondary border-b-3 border-red-600"></div>
              <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="email" label="Email"
                class="w-full sm:w-64 without-ring border-b-white" hint="* Required">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="password"
                :type="isPwd ? 'password' : 'text'" label="Password" class="w-full sm:w-64 without-ring border-b-white"
                hint="Optional">
                <template v-slot:prepend>
                  <q-icon name="key" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>
              <q-checkbox label="Remember me" v-model="rememberMe" :dark="window.glb?.dark" />
              <a type="submit" class="btn hover-ripple" @click="login" v-ripple>Submit</a>
              <p class="">Not registered yet? <a class="link " @click="window.glb.showSignUp = true">
                  Sign
                  Up </a> </p>
            </form>
            
          </q-tab-panel>
          <q-tab-panel name="signup">
            <form class="  px-2 space-y-4 flex  flex-col items-start m-2 without-ring" id="signupForm" method="post"
              @submit.prevent="">
              <div class=" flex-row login-error bg-secondary border-b-3 border-red-600">
              </div>
  
              <div class="w-full sm:w-64 flex space-x-1">
                <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="firstName" label="Firstname"
                  class=" w-1/2 without-ring border-b-white" hint="Optional">
                </q-input>
                <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="lastName" label="Lastname"
                  class=" w-1/2 without-ring border-b-white" hint="Optional">
                </q-input>
              </div>
              <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="username" label="Username"
                class="w-full sm:w-64 without-ring border-b-white" hint="Optional">
                <template v-slot:prepend>
                  <q-icon name="@" />
                </template>
              </q-input>
              <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="email" label="Email"
                class="w-full sm:w-64 without-ring border-b-white" hint="* Required">
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input color="blue" bg-color="" :dark="window.glb?.dark" filled v-model="password"
                :type="isPwd ? 'password' : 'text'" label="Password" class="w-full sm:w-64 without-ring border-b-white"
                hint="Optional">
                <template v-slot:prepend>
                  <q-icon name="key" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>
              <q-checkbox label="Remember me" v-model="rememberMe" :dark="window.glb?.dark" />
              <a type="submit" class="btn hover-ripple" @click="signUp" v-ripple>Submit</a>
              <p class="">Have an account? <a class="link " @click="window.glb.showSignUp = false">
                  Login
                </a> </p>
            </form>
          </q-tab-panel>
        </q-tab-panels>
        
        

        <div class="flex flex-col items-start ">
          <div class="">
            Other Ways To Login
          </div>
          <button class="p-2 themed-bg-tertiary  space-x-2 center hover-ripple flex" @click="loginWithGoogle" v-ripple>
            <div>Sign In With</div>
            <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png#g-logo"
              class="h-4" alt="Google G logo">
          </button>
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