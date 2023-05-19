import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import guest from './middleware/guest'
import auth from './middleware/auth'
import middlewarePipeline from './middlewarePipeline'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      children: [
        {
          path: ':id',
          component: import('../views/ChatDetailView.vue'),
        }
      ],
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('../views/ProgressView.vue'),
      children: [
        {
          path: ':id',
          component: () => import('../views/ProgressDetailView.vue'),
          children: [
            {
              path: ':quizId',
              component: () => import('../views/QuizView.vue'),
            }
          ]
        }
      ],
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/uploadbase',
      name: 'uploadbase',
      component: () => import('../views/UploadbaseView.vue'),
      children: [
        {
          path: '/uploadbase',
          component: () => import('../views/UBHomeView.vue'),
        },
        {
          path: '/uploadbase/settings',
          component: () => import('../views/UBSettingsView.vue'),
        },
        {
          path: '/uploadbase/myuploads',
          component: () => import('../views/UBMyUploadsView.vue'),
        },
        {
          path: '/uploadbase/history',
          component: () => import('../views/UBHistoryView.vue'),
        },
        {
          path: '/uploadbase/watch/:slug',
          component: () => import('../views/UBVideoView.vue'),
        },
      ],
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        middleware: [guest]
      }
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/HomeView.vue'),
      meta: {
        middleware: [auth]
      }
    },
    {
      path: '/yt/:slug',
      name: 'yt',
      component: () => import('../views/YTView.vue')
    }
  ]
})


async function cookieAutoLogin({ next, store }) {

  const cookieName = 'tempJwt'; // Replace with your desired cookie name
  const cookieValue = getCookie(cookieName);
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  if (cookieValue) {
    await window.glb.reloadUser(cookieValue);
    if (window.glb.user) {
      return next();
    }
    // And redirect to the login page
    return next({ name: 'login' });

  } else {
    return next();
  }
}
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}
export default {
  install(app, options) {
    router.install(app)

    router.beforeEach(async (to, from, next) => {

      if (!to.meta.middleware) {
        return next()
      }

      const defaultMiddlewares = [cookieAutoLogin];
      const middleware = [...defaultMiddlewares, ...to.meta.middleware]

      const context = {
        to,
        from,
        next,
      }

      return middleware[0]({
        ...context,
        next: middlewarePipeline(context, middleware, 1)
      })
    })
  }
}
