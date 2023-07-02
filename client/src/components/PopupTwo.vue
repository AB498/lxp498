<template>
  <div>
    <slot name="content" v-bind:onMouseover="handleMouseover"></slot>
  </div>
</template>

<script setup>
import { useSlots, onMounted, nextTick } from "vue";

const slots = useSlots();

const handleMouseover = () => {};

onMounted(async () => {
  await nextTick();
  const content = slots.content()[0];
  content.addEventListener("mouseover", handleMouseover);
});
</script>
