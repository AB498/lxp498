import glb from '@/composables/glb.js'

export default function auth({ next, store }) {

  if (!glb.loggedIn || !glb.user) {
    return next({
      name: 'login'
    })
  }

  return next()
}