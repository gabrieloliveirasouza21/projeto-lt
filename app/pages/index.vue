<script setup lang="ts">
// Redireciona imediatamente para o login
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/login')
    }
  ]
})
</script>

<template>
  <div>Redirecionando...</div>
</template>