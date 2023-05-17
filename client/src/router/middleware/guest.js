import glb from '@/composables/glb.js'

export default function guest({ next, store }) {
  if (glb.loggedIn && glb.user) {
    return next({
      name: 'home'
    })
  }

  return next()
}
