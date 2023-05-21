<script setup>
import { ref, watch, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()



</script>

<template>
  <div class="flex flex-col w-full h-full bg-gray-700">
          <div class="h-10 bg-red-800 w-full flex justify-around">
                  <i class="btn full center fas fa-api p-2" @click="router.push('/admin/apicontrols')">APIS</i>
                  <i class="btn full center fas fa-api p-2" @click="router.push('/admin/socketpg')">SocketPG</i>

      </div>
      <RouterView />
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