


<script setup>
import { ref } from 'vue'

const selected = ref(false)


</script>



<template>
    <div :style="{ backgroundColor: selected ? 'lightblue' : '' }" @click="selected = true; console.log('clc', selected)">
        {{ selected }} <slot></slot>
    </div>
</template>