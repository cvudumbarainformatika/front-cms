import { getDynamicContent } from '../../data/dynamicContent'

export default defineEventHandler((event) => {
  const slugParam = getRouterParam(event, 'slug')
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : (slugParam || '')

  console.log('[Dynamic Content GET] Looking for slug:', slug)
  
  const data = getDynamicContent(slug)
  
  console.log('[Dynamic Content GET] Found:', data ? `Yes (title: ${data.title})` : 'No')
  
  if (!data) {
    return {
      success: true,
      data: null,
      message: 'No content for slug'
    }
  }

  return {
    success: true,
    data
  }
})
