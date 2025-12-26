import { listDynamicContents } from '../../data/dynamicContent'

export default defineEventHandler(() => {
  return {
    success: true,
    data: listDynamicContents()
  }
})
