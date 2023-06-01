<script setup>


let toggleStyle = {
    container: 'inline-block rounded-full outline-none focus:ring focus:ring-green-500 focus:ring-opacity-30',
    toggle: 'flex w-12 h-5 rounded-full relative cursor-pointer transition items-center box-content border-2 text-xs leading-none',
    toggleOn: 'bg-red-700 border-green-500 justify-start ',
    toggleOff: 'bg-gray-400 border-gray-100 justify-end ',
    toggleOnDisabled: 'bg-gray-300 border-gray-200 justify-start  cursor-not-allowed',
    toggleOffDisabled: 'bg-gray-200 border-gray-200 justify-end  cursor-not-allowed',
    handle: 'inline-block bg-white w-5 h-5 top-0 rounded-full absolute transition-all',
    handleOn: 'left-full transform -translate-x-full',
    handleOff: 'left-0',
    handleOnDisabled: 'bg-gray-100 left-full transform -translate-x-full',
    handleOffDisabled: 'bg-gray-100 left-0',
    label: 'text-center w-8 border-box whitespace-nowrap select-none',
}


</script>



<template>
    <div class="w-full p-2 flex effects center-cross space-x-2" @click="showSettingsList = !showSettingsList">
        <q-icon name="chevron_left" class="text-xl float-right cursor-pointer"></q-icon>
        <div>Settings</div>
    </div>
    <div class="generalWindow m-10 p-6 rounded ">
        <div class="col-item effects">General</div>
        <div class="col-item effects">
            <div class="left-grow">Start Muted</div>
            <Toggle :classes="toggleStyle" v-model="window.glb.settings.startMuted" class="toggle-red" />
        </div>
        <div class="col-item effects">
            <div class="left-grow">Auto Translate</div>
            <Toggle :classes="toggleStyle" v-model="window.glb.settings.translationOn" class="toggle-red" />
        </div>
        <div class="col-item effects">
            <div class="left-grow">
                Select Translation Language
            </div>
            <div class="bg-red-400 p-1 px-2 rounded btn"
                @click="window.glb.openSelectLang({ multiselect: false, startingPoint: null }, (e) => {
                    console.log(e)
                    window.glb.user.nativeLanguages = e
                })" >
                <i class="fas fa-chevron-down"></i> {{ window.glb.settings.targetTranslationLang }}
            </div>
        </div>
    </div>
</div></template>