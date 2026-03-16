<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <template #header>
          <div class="font-bold">Users</div>
        </template>
        <div class="text-3xl font-bold">Manage Users</div>
        <template #footer>
          <UButton color="primary" @click="navigateTo('/admin/users')">View</UButton>
        </template>
      </UCard>
      <UCard>
        <template #header>
          <div class="font-bold">Sessions</div>
        </template>
        <div class="text-3xl font-bold">Active Sessions</div>
        <template #footer>
          <UButton color="primary" @click="navigateTo('/admin/sessions')">View</UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
</script>
