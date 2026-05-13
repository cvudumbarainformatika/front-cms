export default defineEventHandler((event) => {
  const documentTypes = [
    { label: 'Serkom', value: 'Serkom' },
    { label: 'Identitas (KTP/SIM)', value: 'Identitas' },
    { label: 'Ijazah', value: 'Ijazah' },
    { label: 'Lainnya', value: 'Lainnya' }
  ]

  return {
    status: 'success',
    data: documentTypes
  }
})
