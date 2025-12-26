import { documents } from '../../data/documents'

export default defineEventHandler((event) => {
  // Simulasi delay network
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        data: documents
      })
    }, 500)
  })
})
