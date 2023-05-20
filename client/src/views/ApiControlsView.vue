<script setup>


const res = (await fetch('http://lanxplore.xyz/test' + endpoint.url, {
    method: endpoint.method,
    headers: {
        'Content-Type': 'application/json'
    },
    body: body ? body : null
}));



</script>


<template>
    <div class="w-full h-full bg-red-400">
            {{ res }}
    </div>
</template>