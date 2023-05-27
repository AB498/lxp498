import glb from '@/composables/glb'
import JsonViewer from "vue-json-viewer";
import * as vueMain from 'vue'
import router from '@/router'
import { boot } from 'quasar/wrappers'
import '@/assets/main.css'

import Vue3Lottie from "vue3-lottie";
import "vue3-lottie/dist/style.css";

export default boot(({ app }) => {

    window.glb = {}
    app.config.globalProperties.window = window

    window.vue = vueMain

    app.directive('click-outside', glb.clickOutside)


    app.directive('loading-bar', {
        mounted(el, binding) {
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
            // loadingBar.style.zIndex = '9999'; // Adjust the z-index as necessary


            // Customize the loading bar appearance
            if (binding.value.color) loadingBar.style.backgroundColor = binding.value.color

            // Append the loading bar to the parent div
            el.appendChild(loadingBar);

            // Create the overlay element
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.style.display = binding.value.loading ? 'block' : 'none';
            el.appendChild(overlay);


            const overlay2 = document.createElement('div');
            overlay2.className = 'loading-overlay2';
            overlay2.style.display = binding.value.loading ? 'block' : 'none';
            overlay2.style.animation = '';
            el.appendChild(overlay2);

            el.dataset.loadingBarElement = loadingBar;
            el.dataset.loadingOverlayElement = overlay;
            el.dataset.loadingOverlayElement2 = overlay2;
            // Add a class to the parent div to indicate it has a loading bar
            el.classList.add('loading-bar-container');
            console.log('mounted')
        },
        updated(el, binding) {
            // Get the loading bar and overlay elements
            const loadingBar = el.querySelector('.loading-bar');
            const overlay = el.querySelector('.loading-overlay');
            const overlay2 = el.querySelector('.loading-overlay2');

            // Set the display style of the loading bar and overlay
            setTimeout(() => {
                loadingBar.style.display = binding.value.loading ? 'block' : 'none';
                overlay.style.display = binding.value.loading ? 'block' : 'none';
                overlay2.style.display = binding.value.loading ? 'block' : 'none';
                if (binding.value.color) loadingBar.style.backgroundColor = binding.value.color
            }, binding.value.loading ? 0 : 300);
        },
        unmounted(el) {
            try {
                // Remove the loading bar when the directive is unmounted
                const loadingBar = el.querySelector('.loading-bar');
                if (loadingBar) {
                    el.removeChild(loadingBar);
                }

                // Remove the loading bar container class
                el.classList.remove('loading-bar-container');

                // Remove the overlay element from the body
                const overlay = el.querySelector('.loading-overlay');
                if (overlay) {
                    el.removeChild(overlay);
                }
            } catch (e) {
                console.log(e);
            }

        }
    });

    app.use(router, app)
    app.config.errorHandler = (err, vm, info) => {
      console.error("Vue template evaluation error:", err);
      console.error("Vue instance:", vm);
      console.error("Additional information:", info);
    };


app.use(Vue3Lottie);
    app.config.globalProperties.cons = (s, m) => { console.log(s, m); return s }
    app.config.globalProperties.window = window
    glb.baseUrl = "http://lanxplore.xyz"
    glb.socketUrl = "http://lanxplore.xyz"
    // glb.baseUrl = 'http://localhost:8080'
    window.glb = glb
    window.onerror = function (message, source, lineno, colno, error) {
        console.log(message + '\n', source + ':' + lineno + ':' + colno /*error*/);
        return true;
    }
    app.use(JsonViewer)

})

export { }
