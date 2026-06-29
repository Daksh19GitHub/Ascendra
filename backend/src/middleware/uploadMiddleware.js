import multer from 'multer'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(new Error('Only JPG, PNG, and WebP images are allowed'))
  },
})

export const uploadProfilePhoto = upload.single('photo')

export function handleUploadError(err, req, res, next) {
  if (!err) {
    return next()
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Image must be 2 MB or smaller',
    })
  }

  return res.status(400).json({
    success: false,
    message: err.message || 'Invalid image upload',
  })
}
