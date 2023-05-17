<script setup>
import { ref, watch, reactive, onMounted, nextTick, onUnmounted } from 'vue'

const errors = ref([])
const results = ref([])
let umntd = true;

onUnmounted(() => {
  umntd = false;
})

const requests = ref([])
const responses = ref([])

if (!window.glb.admin) window.glb.admin = {}

window.glb.admin.showingWindow = window.glb.admin.showingWindow || 0

onMounted(async () => {
  errors.value = window.glb.tryParseJSON(await (await fetch(window.glb.baseUrl + '/admin/errors')).text())
  results.value = window.glb.tryParseJSON(await (await fetch(window.glb.baseUrl + '/admin/results')).text())

  requests.value = window.glb.tryParseJSON(await (await fetch(window.glb.baseUrl + '/admin/requests')).text())
  responses.value = window.glb.tryParseJSON(await (await fetch(window.glb.baseUrl + '/admin/responses')).text())
  pollChanges();

})

async function pollChanges() {
  let reqVal = '';
  await window.glb.poll(async () => {
    reqVal = window.glb.tryParseJSON(await (await fetch(window.glb.baseUrl + '/admin/requests')).text())
    return [null, JSON.stringify(reqVal) != JSON.stringify(requests.value)]
  })
  console.log('changed');
  requests.value = reqVal;
  if (umntd)
    pollChanges();
}


</script>

<template>
  <div class="flex flex-col w-full h-full bg-gray-700">

    <div class="flex w-full">
      <div class="basis-full flex items-center justify-center btn rounded-none"
        :class="window.glb.admin.showingWindow == 0 ? 'activated' : ''" @click="window.glb.admin.showingWindow = 0">
        ErrorResult
      </div>
      <div class="basis-full flex items-center justify-center btn rounded-none"
        :class="window.glb.admin.showingWindow == 1 ? 'activated' : ''"
        @click="window.glb.admin.showingWindow = 1; cons(1)">
        RequestResponse
      </div>
      <div class="basis-full flex items-center justify-center btn rounded-none"
        :class=" window.glb.admin.showingWindow == 2 ? 'activated' : '' " @click=" window.glb.admin.showingWindow = 2; ">
        Global
      </div>
    </div>
    <div class="flex" v-if=" window.glb.admin.showingWindow == 2 ">
          <div class=" errors flex flex-col w-full h-full whitespace-pre-wrap basis-full">
                  <JsonViewer :value=" window.glb " class="bg-zinc-800" theme="my-awesome-json-theme">
                  </JsonViewer>
          </div>
        </div>
        <div class="flex" v-if=" window.glb.admin.showingWindow == 1 ">
          <div class=" errors flex flex-col w-full h-full whitespace-pre-wrap basis-full">
            <div class="bg-cyan-700 p-1 text-2xl font-mono flex items-center justify-center">Requests</div>
            <div
              v-for="(                                            item, index                                            ) in                                             requests                                            "
              :key=" index " class="hover:-translate-y-1 transition-all bg-red-500/75 shadow-xl shadow-blue-700">
              <div class="flex flex-row w-full border ">
                <div class="flex flex-col basis-1/4">
                  {{ Object.entries(item)[0][0] }}
                </div>
                <div class="flex flex-col basis-3/4">

                  <JsonViewer :value=" Object.entries(item)[0][1] " class="bg-zinc-800" theme="my-awesome-json-theme">
                  </JsonViewer>
                </div>
              </div>
            </div>
          </div>
          <div class=" errors flex flex-col w-full h-full whitespace-pre-wrap basis-full">
            <div class="bg-cyan-700 p-1 text-2xl font-mono flex items-center justify-center">Responses</div>
            <div
              v-for="(                                            item, index                                            ) in                                             responses                                            "
              :key=" index " class="hover:-translate-y-1 transition-all bg-red-500/75 shadow-xl shadow-blue-700">
              <div class="flex flex-row w-full border ">
                <div class="flex flex-col basis-1/4">
                  {{ Object.entries(item)[0][0] }}
                </div>
                <div class="flex flex-col basis-3/4">

                  <JsonViewer :value=" Object.entries(item)[0][1] " class="bg-zinc-800" theme="my-awesome-json-theme">
                  </JsonViewer>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex" v-if=" window.glb.admin.showingWindow == 0 ">
          <div class=" errors flex flex-col w-full h-full whitespace-pre-wrap basis-full">
            <div class="bg-cyan-700 p-1 text-2xl font-mono flex items-center justify-center">Errors</div>
            <div
              v-for="(                                           item, index                                           ) in                                            errors                                           "
              :key=" index " class="hover:-translate-y-1 transition-all bg-red-500/75 shadow-xl shadow-blue-700">
              <div class="flex flex-row w-full border ">
                <div class="flex flex-col basis-1/4">
                  {{ Object.entries(item)[0][0] }}
                </div>
                <div class="flex flex-col basis-3/4">

                  <JsonViewer :value=" Object.entries(item)[0][1] " class="bg-zinc-800" theme="my-awesome-json-theme">
                  </JsonViewer>
                </div>
              </div>
            </div>
          </div>
          <div class="results flex flex-col w-full h-full whitespace-pre-wrap basis-full">
            <div class="bg-cyan-700 p-1 text-2xl font-mono flex items-center justify-center">Results</div>
            <div
              v-for="(                                           item, index                                           ) in                                            results                                           "
          :key=" index " class="hover:-translate-y-1 transition-all bg-red-500/75 shadow-xl shadow-blue-700">
          <div class="flex flex-row w-full border ">
            <div class="flex flex-col basis-1/4">
              {{ Object.entries(item)[0][0] }}
            </div>
            <div class="flex flex-col basis-3/4">

              <JsonViewer :value=" Object.entries(item)[0][1] " class="bg-zinc-800" theme="my-awesome-json-theme">
              </JsonViewer>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template> 


<style lang="scss">
.my-awesome-json-theme {
  white-space: nowrap;
  color: #d4d4d4;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #bbb;
    background-color: #444;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }

  .jv-button {
    color: #a2d6ff
  }

  .jv-key {
    color: #e6e6e6
  }

  .jv-item {
    &.jv-array {
      color: #e6e6e6
    }

    &.jv-boolean {
      color: #ff87b3
    }

    &.jv-function {
      color: #6ec4ff
    }

    &.jv-number {
      color: #ff87b3
    }

    &.jv-number-float {
      color: #ff87b3
    }

    &.jv-number-integer {
      color: #ff87b3
    }

    &.jv-object {
      color: #e6e6e6
    }

    &.jv-undefined {
      color: #ffb94e
    }

    &.jv-string {
      color: #9fdfa9;
      word-break: break-word;
      white-space: normal;
    }
  }

  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }

      &:hover {
        &:before {
          background: #444;
        }
      }
    }
  }
}
</style>