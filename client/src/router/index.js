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
export default {
  install(app, options) {
    router.install(app)

    router.beforeEach((to, from, next) => {
      window.glb = glb

      if (!to.meta.middleware) {
        return next()
      }
      const middleware = to.meta.middleware

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
