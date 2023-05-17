import glb from '@/composables/glb'
import './assets/main.css'
import JsonViewer from "vue-json-viewer";
import { createApp } from 'vue'
import * as vueMain from 'vue'
import App from './App.vue'
import router from './router'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App)
window.vue = vueMain

app.directive('click-outside', glb.clickOutside)


app.directive('loading-bar', {
    mounted(el, binding) {
        console.log('loading-bar mounted');
        // Create the loading bar element
        const loadingBar = document.createElement('div');
        loadingBar.className = 'loading-bar';

        // Set the position to the bottom of the parent div
        loadingBar.style.display = binding.value.loading ? 'block' : 'none';
        loadingBar.style.position = 'absolute';
        loadingBar.style.bottom = '0';
        loadingBar.style.left = '0';
        loadingBar.style.width = '100%';
        loadingBar.style.height = binding.value.height || '2px'; // Use a default height of 2px if not specified

        // Customize the loading bar appearance
        if (binding.value.color) loadingBar.style.backgroundColor = binding.value.color

        // Append the loading bar to the parent div
        el.appendChild(loadingBar);

        // Create the overlay element
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';

        // Set the overlay position and dimensions
        overlay.style.display = binding.value.loading ? 'block' : 'none';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        // overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Customize the overlay color and transparency if needed
        // overlay.style.zIndex = '9999'; // Adjust the z-index as necessary

        // Append the overlay to the body
        el.appendChild(overlay);
        el.dataset.loadingBarElement = loadingBar;
        el.dataset.loadingOverlayElement = overlay;
        // Add a class to the parent div to indicate it has a loading bar
        el.classList.add('loading-bar-container');
    },
    updated(el, binding) {
        console.log('loading-bar updated');
        // Get the loading bar and overlay elements
        const loadingBar = el.querySelector('.loading-bar');
        const overlay = document.querySelector('.loading-overlay');

        // Set the display style of the loading bar and overlay
        loadingBar.style.display = binding.value.loading ? 'block' : 'none';
        overlay.style.display = binding.value.loading ? 'block' : 'none';
        if (binding.value.color) loadingBar.style.backgroundColor = binding.value.color
    },
    unmounted(el) {
        console.log('loading-bar unmounted');
        // Remove the loading bar when the directive is unmounted
        const loadingBar = el.querySelector('.loading-bar');
        if (loadingBar) {
            el.removeChild(loadingBar);
        }

        // Remove the loading bar container class
        el.classList.remove('loading-bar-container');

        // Remove the overlay element from the body
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
});

app.use(router, app)

app.config.globalProperties.cons = (s) => { console.log(s); return s }
app.config.globalProperties.window = window
glb.baseUrl = "http://34.125.247.156:8080"
// glb.baseUrl = 'http://localhost:8080'
window.glb = glb


const vuetify = createVuetify({
    components,
    directives,
})

app.use(vuetify)
app.use(JsonViewer)
app.mount('#app')
