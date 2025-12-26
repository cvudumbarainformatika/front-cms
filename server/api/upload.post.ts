import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    // Parse multipart form data
    const form = await readMultipartFormData(event)
    
    if (!form || form.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const file = form[0]
    
    if (!file.filename || !file.data) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid file data' })
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'File type not allowed. Only JPG, PNG, WEBP, GIF are supported.' 
      })
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.data.length > maxSize) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'File too large. Maximum size is 5MB.' 
      })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const hash = createHash('md5').update(file.data).digest('hex').substring(0, 8)
    const ext = file.filename.split('.').pop()
    const sanitizedName = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFilename = `${timestamp}_${hash}_${sanitizedName}`

    // Create upload directory structure: public/uploads/YYYY/MM/
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const uploadDir = join(process.cwd(), 'public', 'uploads', String(year), month)
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadDir, uniqueFilename)
    await writeFile(filePath, file.data)

    // Return URL
    const url = `/uploads/${year}/${month}/${uniqueFilename}`

    console.log('[Upload] File saved:', { 
      filename: uniqueFilename, 
      size: file.data.length, 
      type: file.type,
      url 
    })

    return {
      success: true,
      data: {
        url,
        filename: uniqueFilename,
        originalName: file.filename,
        size: file.data.length,
        type: file.type
      },
      message: 'File uploaded successfully'
    }

  } catch (error: any) {
    console.error('[Upload] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to upload file'
    })
  }
})
