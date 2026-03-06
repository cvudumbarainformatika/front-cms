<script setup lang="ts">
/**
 * MemberCard Component
 * Locked design for member cards in Theme 2
 */
interface Props {
  name: string
  position: string
  photo?: string
  joinedDate?: string
  icon?: string
  showJoinDate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showJoinDate: true,
  icon: 'i-lucide-award'
})

const { getImageUrl } = useImageUrl()
</script>

<template>
  <div class="flex flex-col group h-full">
    <!-- Image Area -->
    <div class="relative aspect-3/4 bg-slate-100 rounded-4xl overflow-hidden mb-[-50px] shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-slate-50">
      <NuxtImg
        v-if="props.photo"
        :src="getImageUrl(props.photo)"
        :alt="props.name"
        class="w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-slate-100">
         <UIcon name="i-lucide-user" class="w-20 h-20 text-slate-200" />
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>

    <!-- Content Area -->
    <div class="relative z-10 mx-6 bg-white/95 backdrop-blur-xl pb-10 pt-6 px-6 text-center rounded-4xl border border-white/50 flex flex-col items-center gap-1 min-h-[180px] justify-center shadow-xl group-hover:translate-y-[-8px] transition-all duration-500 group-hover:bg-white">
       <!-- Icon circle -->
       <div class="absolute -top-7 w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
          <UIcon :name="props.icon" class="w-6 h-6" />
       </div>

       <p class="text-[10px] font-extrabold text-primary-600 uppercase tracking-widest mt-4">{{ props.position }}</p>
       <div class="h-0.5 w-10 bg-primary-500/20 my-2 rounded-full"></div>
       <h3 class="font-extrabold text-slate-900 text-lg leading-tight">{{ props.name }}</h3>
       <p v-if="showJoinDate && props.joinedDate" class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Member Since: {{ props.joinedDate }}</p>

       <!-- Extra Content Slot -->
       <div class="w-full mt-2">
          <slot />
       </div>
    </div>
  </div>
</template>

<style scoped>
.text-primary-600 { color: #10B981; }
.bg-primary-600 { background-color: #10B981; }
</style>
