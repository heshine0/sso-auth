<template>
  <div>Loading...</div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    async (to, from) => {
      const { data: session } = await authClient.useSession(useFetch);
      if (session.value) {
        return navigateTo('/admin/users');
      } else {
        return navigateTo('/login');
      }
    }
  ]
});
</script>
