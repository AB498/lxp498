<script setup>
import PopperComponent from "@/components/PopperComponent.vue";
import glb from "@/composables/glb";
import PowerWord from '@/components/PowerWord.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import SuggestedVideos from "@/components/SuggestedVideos.vue";
import LoadingSpin from "../components/LoadingSpin.vue";


if (!window.glb.videoInfo)
  window.glb.videoInfo = {}

let initialLoad = ref(true);

const router = useRouter()
const route = useRoute()
const player = ref(null)
const ytPlayerReady = ref(false)
const playerState = ref(null)
const playerReadyCallbacks = ref([() => {
  ytPlayerReady.value = true;
}])


window.glb.syncerObj.openYTVideo = {}

watch([() => route.params.slug, initialLoad], async () => {
  if (!player.value)
    player.value = await getOrMakePlayer()
  await waitPlayerReady()
  setTimeout(() => {
    player.value.loadVideoById(route.params.slug, 0, 0)
  }, 10);
  window.glb.syncerObj.openYTVideo.id = route.params.slug

})

async function waitPlayerReady() {
  return new Promise((resolve, reject) => {
    if (ytPlayerReady.value) resolve()
    else {
      playerReadyCallbacks.value.push(resolve)
    }
  })
}

async function getOrMakePlayer() {
  return new Promise((resolve, reject) => {
    // ytPlayerReady.value = false;
    let playId = 'ytPlayerElement'
    // window.document.getElementById('ytPlayerElement').id = playId
    if (!window.YT) {
      let tag = document.createElement('script');
      tag.id = 'iframe-demo';
      tag.src = 'https://www.youtube.com/iframe_api';
      let firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        // if (window.presv) window.YT = window.presv;
        let player = new window.YT.Player(playId, {
          videoId: 'M7lc1UVf-VE', playerVars: { controls: 0, showinfo: 0, disablekb: 1, autoplay: 1, mute: 1, },
          events: { onReady: () => playerReadyCallbacks.value.forEach(cb => cb()), onStateChange: (e) => stateChange(e) },
        });
        resolve(player)
      }
    }
    else {
      let player = new window.YT.Player(playId, {
        videoId: 'M7lc1UVf-VE', playerVars: { controls: 0, showinfo: 0, disablekb: 1, autoplay: 1, mute: 1, },
        events: { onReady: () => playerReadyCallbacks.value.forEach(cb => cb()), onStateChange: (e) => stateChange(e) },
      });
      resolve(player)
    }
  })
}

const borderColor = ref('border-gray-600');

function stateChange(e) {
  playerState.value = e.data;
  switch (e.data) {
    case window.YT.PlayerState.ENDED:
      borderColor.value = 'border-red-600';
      break;
    case window.YT.PlayerState.PLAYING:
      borderColor.value = 'border-green-600';
      console.log('playing')
      break;
    case window.YT.PlayerState.PAUSED:
      borderColor.value = 'border-yellow-600';
      break;
    case window.YT.PlayerState.BUFFERING:
      borderColor.value = 'border-blue-600';
      break;
    case window.YT.PlayerState.CUED:
      borderColor.value = 'border-purple-600';
      break;
    default:
      borderColor.value = 'border-gray-600';
      break;
  }
}
function loadVideoById(id, start, end) {
  player.value.loadVideoById({
    'videoId': id,
    'startSeconds': start,
    'endSeconds': end
  })
}
initialLoad.value = false;

</script>
<template>
  <div class="flex items-center justify-center h-full">
    <div class="flex bg-gray-900 text-white flex-wrap h-full w-full">
      <div class="video-and-suggestions flex flex-col sm:basis-4/6 overflow-auto h-full">

        <div class=" sm:h-96 h-80 w-full flex flex-col pointer-none sticky top-0 items-center z-10 shrink-0">
          <!-- video -->
          <iframe id="ytPlayerElement" class="w-full h-full border-4 bg-zinc-900" :src="'https://www.youtube.com/embed/'
            + '' + '?enablejsapi=1&mute=1&autoplay=1&controls=0&showinfo=0&disablekb=1'" :class="borderColor"></iframe>

          <div class="yt-video-player-slider-holder w-full -translate-y-2  relative transition shrink-0">
            <div class=" yt-video-player-slider-bg bg-gray-700 w-full bg-gray-800/50 h-2 absolute">
            </div>
            <div class=" yt-video-player-slider-bg bg-gray-700 w-full opacity-0 h-2 absolute z-10" x-ref="totalBar"
              x-init="$watch('draggingSlider', draggingSlider => console.log(draggingSlider))">
            </div>
            <div class=" yt-video-player-slider bg-gray-700 h-2 absolute ">
              <!--mousedown -->
              <div
                class=" yt-video-player-slider-cursor rounded-full h-2 bg-red-600 w-4 hover:scale-150 scale-125 right-0 absolute translate-x-1/2">
              </div>
            </div>
          </div>
          <div class="w-full h-20 subtitles  bg-zinc-900 text-gray-300  shrink-0           ">
            <div class="flex items-center justify-center flex-wrap overflow-auto w-full h-full scroll-smooth "
              id="subWordsHolderId"
              v-if="window.glb.videoInfo.subtitlesAvailable == 1 && glb.isIterable(words) && words.length > 0">
              <div v-for="(word, index) in words" :key="index" :ref="(el) => { word.el = el }" class="p-1 pb-0 h-10">
                <PowerWord :word-inc="word">
                </PowerWord>
              </div>
            </div>
            <div v-else-if="window.glb.videoInfo.subtitlesAvailable == -1"
              class=" w-full h-full flex items-center justify-center">
              <div class="btn" @click="requestSubGen">Generate Subtitles
                <i class="fa fa-bolt"></i>
              </div>
            </div>
            <div v-else-if="window.glb.videoInfo.subtitlesAvailable == 0"
              class=" w-full h-full flex items-center justify-center">
              <div class=" flex items-center px-2 space-x-2">
                <div>
                  Subtitles Generation in Progress
                </div>
                <LoadingSpin />
              </div>
            </div>
            <div v-else-if="window.glb.videoInfo.subtitlesAvailable == -2"
              class=" w-full h-full flex items-center justify-center">
              <PopperComponent>
                <template #tohover>
                  <div class="flex space-x-2 items-center justify-center ">

                    <div class="btn" @click="requestSubGen">Generate Subtitles
                      <i class="fa fa-bolt"></i>
                    </div>
                    <i class="fa fa-warning text-yellow-400"></i>
                  </div>
                </template>
                <template #popup>
                  <div class="">
                    Error Occured Previosly Generating Subtitles
                  </div>
                </template>
              </PopperComponent>
            </div>

            <div v-else class="flex center w-full h-full">
              <LoadingSpin />

            </div>
          </div>

          <div class=" controls h-10 bg-indigo-900 flex items-stretch justify-center px-2 shrink-0 self-stretch">
            <i class="fa flex items-center px-2 hover:bg-blue-600 hover:outline fa-play"></i>
            <i class="fa   items-center px-2 hover:bg-blue-600 hover:outline fa-pause hidden"></i>
            <i class="fa flex items-center px-2 hover:bg-blue-600 hover:outline fa-backward"></i>
            <i class="fa flex items-center px-2 hover:bg-blue-600 hover:outline fa-forward"></i>
            <i class="fa flex items-center px-2 hover:bg-blue-600 hover:outline fa-volume-up" @click="toggleMute"></i>
            <div class="grow">

              {{ '' }}
            </div>
            <div class="flex flex-col items-center px-2 hover:bg-blue-600 hover:outline" @click="voteLanguage($event)">
              <div class="flex text-xs">CC</div>
              <div class="flex text-sm">{{ window.glb.videoInfo.votedLang || 'unknown' }}</div>
            </div>
            <i class="flex items-center px-2 hover:bg-blue-600 hover:outline fa fa-comment"></i>
            <i class="flex items-center px-2 hover:bg-blue-600 hover:outline fa fa-closed-captioning"
              @click="toggleBuiltInCaption"></i>
            <i class="flex items-center px-2 hover:bg-blue-600 hover:outline fa fa-gear"></i>
          </div>
        </div>
          <div class="info" v-if="window.glb.syncerObj.openYTVideo.videoInfo">

          <div class="">{{ window.glb.syncerObj.openYTVideo.videoInfo.title }}</div>
          <div class="">{{ window.glb.syncerObj.openYTVideo.videoInfo.info.publishedAt }}</div>
          <div class="hidden">{{ window.glb.syncerObj.openYTVideo.videoInfo.description }}</div>
                  <div class="">{{ window.glb.syncerObj.openYTVideo.videoInfo.info }}</div>

        </div>

        <div class="suggested-videos bg-gray-900 text-white sm:flex-wrap sm:flex ">
          <SuggestedVideos />
        </div>
      </div>

    </div>
    <!-- <script src="/src/js/youtube-iframe-setup.js"></script>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                <script src="/src/parts/yt.js"></script> -->
    <div class="comments flex-col bg-gray-900 text-white sm:basis-1/6 grow overflow-auto h-full sm:flex hidden"></div>
  </div>
</template>
