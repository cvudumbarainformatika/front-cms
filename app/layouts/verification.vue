<template>
  <div class="h-screen w-full overflow-hidden bg-white dark:bg-gray-950 flex flex-col">
    <!-- Header -->
    <div class="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
      <OrganizationLogo size="sm" />
      <UButton to="/" icon="i-lucide-x" variant="ghost" color="neutral" />
    </div>

    <!-- Content Wrapper (Centered, Scrollable) -->
    <div class="flex-1 flex justify-center p-4 sm:p-8 md:p-12 overflow-y-auto">
      <div class="w-full sm:max-w-lg lg:max-w-2xl">
        <slot />
      </div>
    </div>
  </div>
</template>
