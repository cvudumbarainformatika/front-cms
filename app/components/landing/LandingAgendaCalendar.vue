<script setup lang="ts">
import { ref, computed } from 'vue'

const { $apiFetch } = useNuxtApp()

// Fetch all published agendas to populate the calendar
const { data: agendaData, pending } = useAsyncData(
  'home-agenda-calendar',
  () => $apiFetch('/agenda', {
    query: {
      limit: 100, // Fetch a reasonable amount for the calendar
      status: 'published'
    }
  }),
  { server: false }
)

const allEvents = computed(() => {
  if (!agendaData.value?.data?.items) return []
  return agendaData.value.data.items
})

const currentDate = ref(new Date())

const currentMonthName = computed(() => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[currentDate.value.getMonth()]
})

const currentYear = computed(() => currentDate.value.getFullYear())

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentDate.value.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentDate.value.getMonth(), 1).getDay()
})

interface CalendarEvent {
  id: number | string
  slug: string
  title: string
  location?: string
  date: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const year = currentYear.value
  const month = currentDate.value.getMonth()

  // Previous month filler
  const prevMonthDays = new Date(year, month, 0).getDate()
  const firstDay = firstDayOfMonth.value

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false,
        events: []
    })
  }

  // Current month
  const today = new Date()
  for (let i = 1; i <= daysInMonth.value; i++) {
    const d = new Date(year, month, i)
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()

    days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        events: []
    })
  }

  // Next month filler
  const remainingCells = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        events: []
    })
  }

  // Map events
  days.forEach(day => {
     day.events = allEvents.value.filter((e: any) => {
        const eDate = new Date(e.date)
        return eDate.getDate() === day.date.getDate() &&
               eDate.getMonth() === day.date.getMonth() &&
               eDate.getFullYear() === day.date.getFullYear()
     })
  })

  return days
})

const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}
</script>

<template>
  <div class="mt-24">
    <ScrollReveal animation="fade">
      <div class="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/20 text-slate-900 border border-white/10 overflow-hidden relative">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

        <div class="relative z-10">
          <!-- Calendar Header -->
          <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h3 class="text-3xl md:text-4xl font-bold tracking-tight text-slate-800">
              {{ currentMonthName }} <span class="text-primary-600">{{ currentYear }}</span>
            </h3>

            <div class="flex items-center gap-2">
              <UButton color="neutral" variant="solid" class="bg-slate-500 hover:bg-slate-600 text-white rounded-lg px-4" @click="goToToday">today</UButton>
              <UButton color="neutral" variant="solid" class="bg-slate-700 hover:bg-slate-800 text-white rounded-l-lg px-2" icon="i-lucide-chevron-left" @click="prevMonth" />
              <UButton color="neutral" variant="solid" class="bg-slate-700 hover:bg-slate-800 text-white rounded-r-lg px-2" icon="i-lucide-chevron-right" @click="nextMonth" />
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="border rounded-2xl overflow-hidden bg-white">
            <!-- Days Header -->
            <div class="grid grid-cols-7 bg-primary-600 text-white text-center text-xs md:text-sm font-bold tracking-wider">
              <div v-for="(day, idx) in weekDays" :key="day" class="py-3 px-1" :class="{ 'border-l border-primary-500': idx > 0 }">
                {{ day }}
              </div>
            </div>

            <!-- Days Grid -->
            <div class="grid grid-cols-7 border-t bg-slate-50/50">
              <div
                v-for="(day, idx) in calendarDays"
                :key="idx"
                class="min-h-[120px] md:min-h-[180px] border-b border-t-0 p-1 md:p-2 transition-colors relative"
                :class="[
                  (idx % 7 !== 0) ? 'border-l' : '',
                  !day.isCurrentMonth ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                ]"
              >
                <!-- Date Number -->
                <div class="flex justify-end mb-2">
                  <span
                    class="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full text-xs md:text-base font-bold"
                    :class="[
                      day.isToday ? 'bg-primary-600 text-white shadow-lg scale-110' : 'text-slate-600',
                      !day.isCurrentMonth ? 'opacity-30' : ''
                    ]"
                  >
                    {{ day.date.getDate() }}
                  </span>
                </div>

                <!-- Events List -->
                <div class="space-y-1.5 md:space-y-2 overflow-y-auto max-h-[85px] md:max-h-[120px] no-scrollbar">
                  <NuxtLink
                    v-for="event in day.events"
                    :key="event.id"
                    :to="`/agenda/${event.slug}`"
                    class="block bg-slate-800 hover:bg-primary-700 text-white rounded md:rounded-lg p-2 md:p-2.5 cursor-pointer transition-all shadow-md group border border-white/5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div class="text-[10px] md:text-[13px] font-extrabold leading-snug line-clamp-2 md:line-clamp-3 group-hover:text-white uppercase tracking-tight">
                      {{ event.title }}
                    </div>
                    <div v-if="event.location" class="flex items-center gap-1 mt-1.5 text-slate-400 group-hover:text-primary-100">
                      <UIcon name="i-lucide-map-pin" class="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                      <span class="text-[9px] md:text-[11px] font-medium truncate">{{ event.location }}</span>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
