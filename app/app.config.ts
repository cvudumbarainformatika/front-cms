export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate'
    },
    pageSection:{
      slots:{
        root: 'relative isolate',
        container: 'flex flex-col lg:grid py-12 sm:py-12 lg:py-12 gap-8 sm:gap-8',
      }
    }
  }
})
