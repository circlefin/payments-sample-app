// Pages that need a signed-in user send visitors to the login page first,
// and bring them back afterwards.
export default defineNuxtRouteMiddleware((to) => {
  const { session, load } = useAuth()
  load()
  if (!session.value) {
    return navigateTo({ path: '/login', query: { next: to.fullPath } })
  }
})
