<template>
  <div class="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
    <!-- Main content -->
    <div class="flex flex-col w-full flex-1 overflow-hidden">
      <!-- Header -->
      <div class="relative z-10 flex-shrink-0 flex h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex-1 px-4 flex items-center">
          <!-- Left side -->
          <div class="flex items-center space-x-4">
            <!-- App switcher -->
            <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg class="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
              </svg>
            </button>
            
            <!-- Logo -->
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-check-square" class="h-6 w-6 text-blue-600" />
              <span class="font-medium text-blue-600">Atidone</span>
            </div>

            <!-- Main navigation -->
            <div v-if="loggedIn" class="flex items-center space-x-2">
              <UButton
                to="/todos"
                icon="i-lucide-list"
                label="Todos"
                :color="$route.path === '/todos' ? 'primary' : 'neutral'"
                variant="ghost"
              />
              <UButton
                to="/optimistic-todos"
                icon="i-lucide-sparkles"
                label="Optimistic Todos"
                :color="$route.path === '/optimistic-todos' ? 'primary' : 'neutral'"
                variant="ghost"
              />
            </div>
          </div>

          <!-- Right side -->
          <div class="ml-auto flex items-center space-x-4">
            <!-- Dark mode toggle -->
            <UButton
              square
              variant="ghost"
              color="neutral"
              :icon="
                $colorMode.preference === 'dark' || $colorMode.preference === 'system'
                  ? 'i-lucide-moon'
                  : 'i-lucide-sun'
              "
              @click="isDarkMode = !isDarkMode"
            />

            <!-- Login/Profile -->
            <template v-if="!loggedIn">
              <UButton
                :to="`https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${config.public.NUXT_OAUTH_JIRA_CLIENT_ID}&scope=read:me%20read:account&redirect_uri=http://localhost:3000/api/auth/jira&response_type=code&prompt=consent`"
                icon="i-simple-icons-jira"
                label="Login with Jira"
                color="neutral"
                size="xs"
                external
              />
            </template>
            <template v-else>
              <UDropdownMenu
                v-if="user"
                :items="items"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-lucide-chevron-down"
                >
                  <UAvatar
                    :src="user.picture"
                    :alt="user.name"
                    size="3xs"
                  />
                  {{ user.name }}
                </UButton>
              </UDropdownMenu>
            </template>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 overflow-auto">
        <UContainer class="min-h-screen flex flex-col my-4">
          <UCard variant="subtle">
            <NuxtPage />
          </UCard>

          <footer class="text-center mt-2">
            <NuxtLink
              href="https://github.com/atinux/atidone"
              target="_blank"
              class="text-sm text-neutral-500 hover:text-neutral-700"
            >
              GitHub
            </NuxtLink>
            ·
            <NuxtLink
              href="https://twitter.com/atinux"
              target="_blank"
              class="text-sm text-neutral-500 hover:text-neutral-700"
            >
              Twitter
            </NuxtLink>
          </footer>
        </UContainer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types'

const { loggedIn, user, clear } = useUserSession()
const colorMode = useColorMode()
const config = useRuntimeConfig()

watch(loggedIn, () => {
  if (!loggedIn.value) {
    navigateTo('/')
  }
})

const isDarkMode = computed({
  get: () => colorMode.preference === 'dark',
  set: () =>
    (colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark')
})

useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', href: '/icon.png' }]
})

useSeoMeta({
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  title: 'Atidone',
  description:
    'A Nuxt demo hosted with edge-side rendering, authentication and queyring a Cloudflare D1 database',
  ogImage: '/social-image.png',
  twitterImage: '/social-image.png',
  twitterCard: 'summary_large_image'
})

const items = [
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: clear
    }
  ]
] satisfies DropdownMenuItem[][]
</script>

<style lang="postcss">
body {
  @apply font-sans text-neutral-950 bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-50;
}
</style> 