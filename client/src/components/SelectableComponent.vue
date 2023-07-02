<script setup>
import { ref } from "vue";

const selected = ref(false);
</script>

<template>
  <div
    :style="{ backgroundColor: selected ? 'lightblue' : '' }"
    @click="selected = true"
  >
    {{ selected }} <slot></slot>
  </div>
</template>
