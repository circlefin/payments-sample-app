<script setup>
/**
 * Developers page removed. Redirect to home.
 * This page intentionally redirects users to the homepage.
 */

// navigateTo works on server and client in Nuxt 3 and will perform a redirect
// The call below triggers an immediate redirect when this page is visited.

navigateTo('/', { redirectCode: 302 })
</script>
