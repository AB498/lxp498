<script setup>
import PopperComponent from "@/components/PopperComponent.vue";
import glb from "@/composables/glb";
import PowerWord from '@/components/PowerWord.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import SuggestedVideos from "@/components/SuggestedVideos.vue";
import CommentsComponent from "@/components/CommentsComponent.vue";
import LoadingSpin from "../components/LoadingSpin.vue";
import bs from "binary-search";

// => 2

if (!window.glb.videoInfo)
  window.glb.videoInfo = {}

let initialLoad = ref(true);

const router = useRouter()
const route = useRoute()
const player = ref(null)
const ytPlayerReady = ref(false)
const playerState = ref(null)
const words = ref([])
const playerReadyCallbacks = ref([() => {
  ytPlayerReady.value = true;
}])


window.glb.syncerObj.openYTVideo = {}

watch([() => route.params.slug, initialLoad], async () => {
  if (playerMainLoop) clearInterval(playerMainLoop)
  if (!player.value)
    player.value = await getOrMakePlayer()
  await waitPlayerReady()
  duration = player.value.getDuration()
  console.log('duration', duration)
  setTimeout(() => {
    player.value.loadVideoById(route.params.slug, 0, 0)
  }, 10);
  window.glb.syncerObj.openYTVideo.id = route.params.slug
  window.glb.syncerObj.openYTVideo.getMostVotedLanguage = route.params.slug;

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
const videoProgress = ref(0);

watch(() => window.glb.syncerObj?.openYTVideo?.subtitlesStatus, async (newVal, oldVal) => {
  if (newVal == 1) {
    words.value = (await window.glb.safeAuthedReq('/api/getYTSubtitles/' + route.params.slug)).map((word, i) => {
      word.el = null;
      word.active = false;
      word.startTime = parseFloat(word.startTime);
      word.endTime = parseFloat(word.endTime);
      return word;

    });
    let translatedWords = await window.glb.safeAuthedReq('/api/getTranslation',
      {
        words: words.value.map(word => word.word),
        sourceLang: window.glb.syncerObj.openYTVideo.mostVoted,
        targetLang: window.glb.settings.translationLanguage || window.glb.syncerObj.openYTVideo.getMostVotedLanguage
      }
    );
    words.value.forEach((word, i) => {
      word.translatedWord = translatedWords[i];
    })
    if (playerMainLoop) clearInterval(playerMainLoop)
    playerMainLoop = setTimeout(updateWords, 100)
    // window.syncer.destroy();
  }
})

const updateWords = () => {
  if (ytPlayerReady.value && words.value) {
    let currentTime = player.value.getCurrentTime();
    // duration = player.value.getDuration()
    //   videoProgress.value = currentTime / duration * 100;
    if (words.value && words.value.length > 0 && glb.isIterable(words.value)) {

      //binary search
      let l, r, m;
      l = 0;
      r = words.value.length - 1;
      while (l <= r) {
        m = Math.floor((l + r) / 2);
        if ((words.value[m].startTime) <= currentTime && (words.value[m].endTime) >= currentTime) {
          break;
        }
        else if ((words.value[m].startTime) > currentTime) {
          r = m - 1;
        }
        else {
          l = m + 1;
        }
      }

      activeM.value = m;
      let actword = words.value[activeM.value];
      if (actword)
        actScrTop.value = actword.el.offsetTop;
    }
  }

  if (playerMainLoop) clearInterval(playerMainLoop)
  playerMainLoop = setTimeout(updateWords, 100)

}
let lastactword = null;
let duration = null;
let playerMainLoop = null;
const activeM = ref(-1);
const actScrTop = ref(0);
watch(actScrTop, (newVal, oldVal) => {
  if (newVal != oldVal) {

    document.getElementById('subWordsHolderId').scrollTop = (actScrTop.value - document.getElementById('subWordsHolderId').offsetTop);;
  }
})

onUnmounted(() => {
  clearInterval(playerMainLoop);
})


function requestSubGen() {
  window.glb.syncerObj.openYTVideo.generateSubtitles = route.params.slug;
}

const commentsOpen = ref(false);

function toggleComments() {
  commentsOpen.value = !commentsOpen.value;
}


</script>
<template>
  <div class="flex items-center justify-center h-full">
    <div class="flex flex-wrap h-full w-full   relative">
      <div class="video-and-suggestions flex flex-col sm:basis-4/6 h-full  overflow-auto">

        <div class="themed-bg-primary shadow-md sm:h-96 h-80 w-full flex flex-col pointer-none sticky top-0 items-center z-10 shrink-0">
          <!-- video -->
          <iframe id="ytPlayerElement" class="w-full h-full themed-bg-primary" :src="'https://www.youtube.com/embed/'
            + '' + '?enablejsapi=1&autoplay=1'"></iframe>
          <!-- :class="borderColor" -->
          <!-- &mute=1&controls=0&showinfo=0&disablekb=1 -->

          <div class="yt-video-player-slider-holder w-full -translate-y-2  relative transition shrink-0 hidden">
            <div class=" yt-video-player-slider-bg bg-gray-700 w-full bg-gray-800/50 h-2 absolute">
            </div>
            <div class=" yt-video-player-slider-bg bg-gray-700 w-full opacity-0 h-2 absolute z-10" x-ref="totalBar"
              x-init="$watch('draggingSlider', draggingSlider => console.log(draggingSlider))">
            </div>
            <div class=" yt-video-player-slider bg-gray-700 h-2 absolute " :style="{ width: videoProgress + '%' }">
              <!--mousedown -->
              <div
                class=" yt-video-player-slider-cursor rounded-full h-2 bg-red-600 w-4 hover:scale-150 scale-125 right-0 absolute translate-x-1/2">
              </div>
            </div>
          </div>
          <div class="w-full h-20 subtitles shrink-0">
            <div class="flex items-center justify-center flex-wrap overflow-auto w-full h-full scroll-smooth"
              id="subWordsHolderId"
              v-if="window.glb.syncerObj?.openYTVideo?.subtitlesStatus == 1 && glb.isIterable(words) && words.length > 0">
              <div v-for="(word, index) in words" :key="index" :ref="(el) => { word.el = el }" class="p-1 h-10  ">
                <div :class="index == activeM ? 'bg-blue-600/50' : 'themed-bg-tertiary'"
                  class="h-full p-1 min-w-[30px] hover:bg-gray-400/50 rounded  flex flex-col">
                  <div class="mainWord shrink-0 center h-1/2">
                    {{ word.word }}
                  </div>
                  <div class="mainWord shrink-0 center h-1/2">
                    {{ word.translatedWord || '...' }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="window.glb.syncerObj?.openYTVideo?.subtitlesStatus == -1"
              class=" w-full h-full flex items-center justify-center">
              <div class="btn" @click="requestSubGen">Generate Subtitles
                <i class="fa fa-bolt"></i>
              </div>
            </div>
            <div v-else-if="window.glb.syncerObj?.openYTVideo?.subtitlesStatus == 0"
              class=" w-full h-full flex flex-col items-center justify-center">
              <div class=" flex items-center px-2 space-x-2">
                <div>
                  Subtitles Generation in Progress
                </div>
                <div>{{ '(' + parseFloat(window.glb.syncerObj?.openYTVideo?.subtitlesGenerationProgress)?.toFixed(2) + '%)' }}
                </div>
                <LoadingSpin />
              </div>
              <q-slider thumb-size="0px" class="px-6" :color="window.glb.dark ? 'white' : 'black'"
                v-model="window.glb.syncerObj.openYTVideo.subtitlesGenerationProgress" :min="0" :max="100" />

            </div>
            <div v-else-if="window.glb.syncerObj?.openYTVideo?.subtitlesStatus == -2"
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

          <div class=" controls h-10 themed-bg-tertiary center-cross flex px-2 shrink-0 self-stretch">
            <i class="fa  center effects w-8 h-8 fa-play"></i>
            <i class="fa  center effects w-8 h-8 fa-pause hidden"></i>
            <i class="fa  center effects w-8 h-8 fa-backward"></i>
            <i class="fa  center effects w-8 h-8 fa-forward"></i>
            <i class="fa  center effects w-8 h-8 fa-volume-up" @click="toggleMute"></i>
            <div class="grow"> </div>
            <div class=" center effects px-2 flex flex-col"  @click="window.glb.openSelectLang({ multiselect: false, startingPoint: null }, (e) => {
              window.glb.settings.translationLanguage = e.languagecode
                        })">
              <div class="flex text-xs reactive-text-3">Translation</div>
              <div class="flex text-xs reactive-text-3">Language</div>
              <div class="flex text-sm reactive-text-3">{{ window.glb.settings.translationLanguage || 'unknown' }}</div>
            </div>
            <div class=" center effects px-2 flex flex-col"  @click="window.glb.openSelectLang({ multiselect: false, startingPoint: null }, (e) => {
              window.glb.syncerObj.openYTVideo.voteLanguage = e.languagecode
                        })">
              <div class="flex text-xs">CC</div>
              <div class="flex text-sm">{{ window.glb.syncerObj?.openYTVideo?.mostVoted || 'unknown' }}</div>
            </div>
            <i class=" center effects w-8 h-8 fa fa-comment"></i>
            <i class=" center effects w-8 h-8 fa fa-closed-captioning" @click="toggleBuiltInCaption"></i>
            <i class=" center effects w-8 h-8 fa fa-gear"></i>
          </div>
        </div>
        <div class="info p-2" v-if="window.glb.syncerObj.openYTVideo.videoInfo">

          <div class="text-xl">{{ window.glb.syncerObj.openYTVideo.videoInfo.title }}</div>
          <div class="hidden">{{ window.glb.syncerObj.openYTVideo.videoInfo.info.description }}</div>
          <div class="">{{ window.glb.syncerObj.openYTVideo.videoInfo.info.channelTitle }}</div>
          <!-- show comments button -->
          <div class="btn m-2 themed-bg-tertiary themed-text-primary" @click="toggleComments">Comments</div>
        </div>

        <div class="suggested-videos  sm:flex-wrap sm:flex ">
          <SuggestedVideos />
        </div>
      </div>

      <div
        class="full sm:static fixed themed-bg-primary z-10 top-0 left-0 overflow-auto sm:h-full sm:translate-x-0 sm:basis-1/12 grow"
        :class="commentsOpen ? '' : 'translate-x-full'">
        <div class="w-full p-2 flex sticky top-0 z-10 themed-bg-secondary center-cross" @click="toggleComments">
          <q-icon name="close" class="w-8 h-8"></q-icon>
          <div>Close</div>
        </div>
        <div class="center flex flex-col full">

          <div v-if="window.glb.syncerObj?.openYTVideo.commentsError" class="full center dark">
            {{ window.glb.syncerObj?.openYTVideo.commentsError }}
          </div>
          <div class="comments flex-col  h-full w-full" v-else-if="window.glb.syncerObj?.openYTVideo?.comments?.items">
            <CommentsComponent :comments="window.glb.syncerObj?.openYTVideo?.comments"
              v-for="(comment, index) in window.glb.syncerObj?.openYTVideo?.comments?.items" :key="index" :comment="{
                content: comment.snippet.topLevelComment.snippet.textOriginal,
                authorName: comment.snippet.topLevelComment.snippet.authorDisplayName,
                authorImage: comment.snippet.topLevelComment.snippet.authorProfileImageUrl,
                likeCount: comment.snippet.topLevelComment.snippet.likeCount,
                publishedAt: comment.snippet.topLevelComment.snippet.publishedAt,
                updatedAt: comment.snippet.topLevelComment.snippet.updatedAt,
                totalReplyCount: comment.snippet.totalReplyCount,
                replies: comment.replies
              }" />
          </div>
          <div v-else class="full grow center dark">
            <LoadingSpin />
          </div>
          <div class="w-full p-2 flex sticky bottom-0 z-10 themed-bg-secondary">
            <div class="flex-grow">
              <input type="text" class="w-full h-10 p-2 border-2 rounded" placeholder="Comment" v-model="commentText" />
            </div>
            <div class="flex-grow-0">
              <div class="btn" @click="postComment">
                <i class="fa fa-paper-plane"></i>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <!-- <script src="/src/js/youtube-iframe-setup.js"></script>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                <script src="/src/parts/yt.js"></script> -->
  </div>
</template>
