<script setup>


</script>



<template>
    <div class="generalWindow m-6 sm:m-16 p-2 sm:p-6 rounded themed-bg-secondary">
        <div class="col-item effects">
            <div class="left-grow">Dark Mode</div>
            <q-toggle v-model="window.glb.dark" class="toggle-red" />
        </div>
        <div class="col-item effects">
            <div class="left-grow">Auto Translate</div>
            <q-toggle v-model="window.glb.settings.translationOn" class="toggle-red" />
        </div>
        <div class="col-item effects">
            <div class="left-grow">
                Select Translation Language
            </div>
            <div class="bg-red-400 center-cross space-x-2 flex p-1 px-2 rounded btn" @click="window.glb.openSelectLang({ multiselect: false, startingPoint: null }, (e) => {
                window.glb.settings.targetTranslationLang = e.languagecode
            })">
                <div class="">
                    {{ window.glb.settings.targetTranslationLang }}
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>
    </div>
</template>