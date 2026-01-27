<script setup lang="ts">
/**
 * Direktori Anggota Section
 * Real interactive map dengan Leaflet.js + OpenStreetMap (GRATIS!)
 */

const { searchMembers, formatMemberName } = useMembers()

const searchQuery = ref('')
const featuredMembers = ref<any[]>([])
const searchResults = ref<any[]>([])
const loading = ref(false)
const showSearchResults = ref(false)
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
const markers: any[] = []

// Lazy load Leaflet only on client side
let L: any = null

// Comprehensive city/province coordinates for Indonesia
const cityCoordinates: Record<string, [number, number]> = {
  // Major cities
  'Jakarta': [-6.2088, 106.8456],
  'Kota Jakarta': [-6.2088, 106.8456],
  'DKI Jakarta': [-6.2088, 106.8456],
  'Surabaya': [-7.2575, 112.7521],
  'Kota Surabaya': [-7.2575, 112.7521],
  'Bandung': [-6.9175, 107.6191],
  'Kota Bandung': [-6.9175, 107.6191],
  'Semarang': [-7.0051, 110.4381],
  'Kota Semarang': [-7.0051, 110.4381],
  'Yogyakarta': [-7.7956, 110.3695],
  'Denpasar': [-8.6705, 115.2126],
  'Kota Denpasar': [-8.6705, 115.2126],
  'Medan': [3.5952, 98.6722],
  'Kota Medan': [3.5952, 98.6722],
  'Makassar': [-5.1477, 119.4327],
  'Kota Makassar': [-5.1477, 119.4327],
  'Palembang': [-2.9761, 104.7754],
  'Kota Palembang': [-2.9761, 104.7754],
  'Malang': [-7.9666, 112.6326],
  'Kota Malang': [-7.9666, 112.6326],
  'Padang': [-0.9471, 100.4172],
  'Kota Padang': [-0.9471, 100.4172],
  'Balikpapan': [-1.2379, 116.8529],
  'Kota Balikpapan': [-1.2379, 116.8529],
  'Samarinda': [-0.5022, 117.1536],
  'Kota Samarinda': [-0.5022, 117.1536],
  'Manado': [1.4748, 124.8421],
  'Kota Manado': [1.4748, 124.8421],
  // Provinces (fallback)
  'Jawa Barat': [-6.9175, 107.6191],
  'Jawa Tengah': [-7.1508, 110.1403],
  'Jawa Timur': [-7.2575, 112.7521],
  'Bali': [-8.3405, 115.0920],
  'Sumatera Utara': [3.5952, 98.6722],
  'Sumatera Barat': [-0.9471, 100.4172],
  'Sulawesi Selatan': [-5.1477, 119.4327],
  'Kalimantan Timur': [0.5387, 116.4194],
  'Papua': [-4.2699, 138.0804],
}

// Get best coordinates for member (prioritize kota_kabupaten > provinsi)
const getMemberCoordinates = (member: any): [number, number] => {
  // Try kota_kabupaten first
  if (member.kota_kabupaten) {
    const cityCoord = cityCoordinates[member.kota_kabupaten]
    if (cityCoord) {
      // Small random offset untuk avoid overlap
      const offset = () => (Math.random() - 0.5) * 0.3
      return [cityCoord[0] + offset(), cityCoord[1] + offset()]
    }
  }
  
  // Fallback to provinsi
  if (member.provinsi) {
    const provCoord = cityCoordinates[member.provinsi]
    if (provCoord) {
      // Larger random offset untuk provinsi level
      const offset = () => (Math.random() - 0.5) * 2
      return [provCoord[0] + offset(), provCoord[1] + offset()]
    }
  }
  
  // Default: center of Indonesia with random spread
  const offset = () => (Math.random() - 0.5) * 10
  return [-2.5489 + offset(), 118.0149 + offset()]
}

// Clear all markers from map
const clearMarkers = () => {
  if (!map) return
  markers.forEach(marker => marker.remove())
  markers.length = 0
}

// Add markers for members and auto-zoom
const addMarkersAndZoom = (members: any[]) => {
  if (!map || !L || members.length === 0) return

  // Clear existing markers
  clearMarkers()

  // Custom icon untuk markers
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div class="w-6 h-6 bg-primary-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full pulse-marker"></div></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  const bounds: any[] = []

  // Add markers for each member
  members.forEach(member => {
    const coords = getMemberCoordinates(member)
    const marker = L.marker(coords, { icon: customIcon }).addTo(map!)
    
    // Popup content
    const popupContent = `
      <div class="p-2 min-w-[200px]">
        <h4 class="font-bold text-sm text-slate-900 mb-1">${formatMemberName(member)}</h4>
        <p class="text-xs text-slate-500 mb-1">NPA: ${member.npa}</p>
        ${member.kota_kabupaten ? `<p class="text-xs text-slate-600 mb-1">📍 ${member.kota_kabupaten}</p>` : ''}
        ${member.cabang ? `<p class="text-xs text-slate-600 mb-1">${member.cabang}</p>` : ''}
        ${member.provinsi ? `<p class="text-xs text-slate-500 mb-2">${member.provinsi}</p>` : ''}
      </div>
    `
    
    marker.bindPopup(popupContent, {
      className: 'custom-popup'
    })
    
    markers.push(marker)
    bounds.push(coords)
  })

  // Auto-zoom to fit all markers
  if (bounds.length > 0) {
    const leafletBounds = L.latLngBounds(bounds)
    map.fitBounds(leafletBounds, {
      padding: [50, 50],
      maxZoom: members.length === 1 ? 12 : 10 // Zoom closer if single result
    })
  }
}

// Initialize map (only on client)
const initMap = async () => {
  if (!process.client || !mapContainer.value || map) return

  // Lazy load Leaflet and CSS
  if (!L) {
    L = (await import('leaflet')).default
    // Import CSS
    await import('leaflet/dist/leaflet.css')
  }

  // Create map centered on Indonesia
  map = L.map(mapContainer.value, {
    center: [-2.5, 118],
    zoom: 5,
    zoomControl: true,
    scrollWheelZoom: true
  })

  // Add beautiful tile layer (CartoDB Positron - light & clean style)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  // Add initial markers for featured members
  addMarkersAndZoom(featuredMembers.value)
}

// Load featured members
onMounted(async () => {
  try {
    const response = await searchMembers({ limit: 12 })
    featuredMembers.value = response.members
    
    // Wait for DOM then init map
    await nextTick()
    initMap()
  } catch (error) {
    console.error('Failed to load featured members:', error)
  }
})

// Cleanup
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// Handle search
const handleSearch = async () => {
  if (!searchQuery.value) {
    showSearchResults.value = false
    searchResults.value = []
    // Reset map to show featured members
    addMarkersAndZoom(featuredMembers.value)
    return
  }

  loading.value = true
  showSearchResults.value = true
  try {
    const response = await searchMembers({ 
      nama: searchQuery.value, 
      limit: 10 
    })
    searchResults.value = response.members || []
    
    // Update map with search results - auto zoom!
    if (searchResults.value.length > 0) {
      addMarkersAndZoom(searchResults.value)
    }
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = useDebounceFn(handleSearch, 500)
</script>

<template>
  <UPageSection id="direktori" class="py-24 bg-white">
    <div class="mb-10 text-center md:text-left">
      <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-slate-900">
        Direktori <span class="text-primary-600">Anggota</span>
      </h2>
      <p class="text-lg text-slate-500">
        Temukan anggota PDPI di seluruh Indonesia. Map interaktif menampilkan sebaran anggota berdasarkan provinsi.
      </p>
    </div>

    <!-- Interactive Map Container -->
    <div class="relative w-full h-[600px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50">
      
      <!-- Leaflet Map (Client Only) -->
      <ClientOnly>
        <div ref="mapContainer" class="absolute inset-0 w-full h-full"></div>
        <template #fallback>
          <div class="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50">
            <div class="text-center">
              <UIcon name="i-lucide-loader-2" class="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" />
              <p class="text-slate-600">Loading map...</p>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Floating Search Bar -->
      <div class="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-[1000]">
        <div class="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/50 flex gap-2">
          <div class="relative grow">
            <UIcon name="i-lucide-search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              v-model="searchQuery"
              @input="debouncedSearch"
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="Cari nama, cabang, provinsi, tempat praktek..." 
              class="w-full bg-transparent h-12 pl-12 pr-4 text-slate-900 placeholder-slate-400 font-medium focus:outline-none rounded-xl hover:bg-slate-50 transition-colors"
            >
          </div>
          <UButton 
            @click="handleSearch"
            :loading="loading"
            color="primary" 
            class="px-6 rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:bg-primary-600"
          >
            Cari
          </UButton>
        </div>
      </div>

      <!-- Floating Sidebar List -->
      <div class="absolute top-28 left-8 bottom-8 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden hidden lg:flex flex-col border border-slate-100 z-[1000]">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-semibold text-slate-900">
            {{ showSearchResults ? 'Hasil Pencarian' : 'Anggota PDPI' }}
          </h3>
          <p class="text-xs text-slate-500">
            {{ showSearchResults ? `${searchResults.length} anggota ditemukan` : `${featuredMembers.length} anggota ditampilkan` }}
          </p>
        </div>
        
        <!-- List Content -->
        <div class="overflow-y-auto flex-1 p-2 space-y-2 no-scrollbar">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 mx-auto text-primary-500 animate-spin mb-2" />
            <p class="text-xs text-slate-500">Mencari...</p>
          </div>

          <!-- Search Results or Featured Members -->
          <div 
            v-else
            v-for="member in (showSearchResults ? searchResults : featuredMembers)" 
            :key="member.id"
            class="p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors group/item"
          >
            <h4 class="font-semibold text-sm text-slate-900 group-hover/item:text-primary-700 mb-1">
              {{ formatMemberName(member) }}
            </h4>
            <p class="text-xs text-slate-500 mb-2">{{ member.provinsi || 'N/A' }}</p>
            <div class="flex flex-wrap gap-1">
              <span v-if="member.cabang" class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                {{ member.cabang }}
              </span>
              <span v-if="member.tempat_praktek_1" class="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 truncate max-w-[180px]">
                {{ member.tempat_praktek_1 }}
              </span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="showSearchResults && searchResults.length === 0 && !loading" class="text-center py-8">
            <UIcon name="i-lucide-search-x" class="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p class="text-sm text-slate-500">Tidak ada hasil</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-3 border-t border-slate-100">
          <UButton 
            to="/direktori"
            color="primary"
            variant="soft"
            block
            size="sm"
          >
            Lihat Semua Anggota
          </UButton>
        </div>
      </div>

      <!-- Mobile CTA -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 lg:hidden z-[1000]">
        <UButton 
          to="/direktori"
          color="primary"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          Lihat Semua Anggota
        </UButton>
      </div>
    </div>

    <!-- Map Legend -->
    <div class="mt-6 flex items-center justify-center gap-6 text-sm text-slate-600">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
        <span>Lokasi Anggota</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-mouse-pointer-click" class="w-4 h-4" />
        <span>Klik pin untuk detail</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-zoom-in" class="w-4 h-4" />
        <span>Scroll untuk zoom</span>
      </div>
    </div>
  </UPageSection>
</template>

<style scoped>
/* Custom styles for Leaflet markers and popups */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.pulse-marker) {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

:deep(.custom-popup .leaflet-popup-content-wrapper) {
  border-radius: 12px;
  padding: 0;
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 0;
}

:deep(.custom-popup .leaflet-popup-tip) {
  background: white;
}

/* Hide default Leaflet attribution on mobile */
@media (max-width: 640px) {
  :deep(.leaflet-control-attribution) {
    font-size: 8px;
  }
}
</style>
