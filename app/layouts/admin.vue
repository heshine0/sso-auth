<template>
  <UDashboardGroup class="h-screen w-full">
    <UDashboardSidebar>
      <template #header>
        <div class="flex items-center gap-2 px-2">
          <UIcon name="i-heroicons-command-line" class="w-8 h-8 text-primary-500" />
          <span class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
        </div>
      </template>

      <UNavigationMenu :items="links" orientation="vertical" />

      <template #footer>
        <div class="p-2 flex flex-col gap-2">
          <UUser
            :name="user?.name || 'User'"
            :description="user?.email || ''"
            :avatar="{ src: user?.image || 'https://avatars.githubusercontent.com/u/739984?v=4' }"
          />
          <UButton
            block
            color="neutral"
            icon="i-heroicons-arrow-right-on-rectangle"
            label="Sign out"
            @click="handleSignOut"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <UDashboardNavbar title="Dashboard">
        <template #right>
           <UColorModeButton />
        </template>
      </UDashboardNavbar>

      <div class="flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import authClient from '~/utils/auth-client'

const { data: session } = await authClient.useSession(useFetch)
const user = computed(() => session.value?.user)

async function handleSignOut() {
  await authClient.signOut()
  await navigateTo('/login')
}

const links = [
  {
    label: 'Users',
    icon: 'i-heroicons-users',
    to: '/admin/users'
  },
  {
    label: 'Sessions',
    icon: 'i-heroicons-list-bullet',
    to: '/admin/sessions'
  },
  {
    label: 'Accounts',
    icon: 'i-heroicons-key',
    to: '/admin/accounts'
  },
  {
    label: 'WeChat MiniPrograms',
    icon: 'i-heroicons-squares-2x2',
    to: '/admin/wechat-miniprograms'
  }
]
</script>
