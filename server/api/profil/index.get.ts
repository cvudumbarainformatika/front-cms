/**
 * GET /api/profil
 * Mengambil data profil organisasi (visi misi, sejarah, AD/ART)
 */

import { visiMisi, sejarah, adArt } from '../../data/profil'

export default defineEventHandler(() => {
  return {
    success: true,
    data: {
      visiMisi,
      sejarah,
      adArt
    },
    message: 'Profil fetched successfully'
  }
})
