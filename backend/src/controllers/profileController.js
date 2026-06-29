import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'
import { getFriendshipContext } from '../utils/friendship.js'
import { clearProfileEmbedding } from '../utils/profileEmbedding.js'

export async function getProfile(req, res) {
  const user = req.user

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
    },
  })
}

export async function getUserProfile(req, res, next) {
  try {
    const user = await User.findOne({
      username: req.params.username.toLowerCase(),
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const friendship = await getFriendshipContext(req.user._id, user._id)

    res.json({
      success: true,
      data: {
        user: {
          ...user.toPublicProfileJSON(req.user._id),
          friendship,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const { fullName, headline, address, education, skills, achievements, workExperience } =
      req.body

    const existingProfile = user.profile?.toObject?.() ?? user.profile ?? {}

    user.profile = {
      ...existingProfile,
      fullName: fullName?.trim() || '',
      headline: headline?.trim() || '',
      address: {
        street: address?.street?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        country: address?.country?.trim() || '',
        postalCode: address?.postalCode?.trim() || '',
      },
      education: Array.isArray(education) ? education : [],
      skills: Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      workExperience: Array.isArray(workExperience) ? workExperience : [],
    }

    clearProfileEmbedding(user)

    await user.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicJSON(),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function uploadProfilePhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload',
      })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const previousPublicId = user.profile?.profilePhoto?.publicId

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'ascendra/profile-photos',
      public_id: `user_${user._id}`,
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })

    if (previousPublicId && previousPublicId !== result.public_id) {
      await cloudinary.uploader.destroy(previousPublicId).catch(() => {})
    }

    const existingProfile = user.profile?.toObject?.() ?? user.profile ?? {}

    user.profile = {
      ...existingProfile,
      profilePhoto: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    }

    await user.save()

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        user: user.toPublicJSON(),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function removeProfilePhoto(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const publicId = user.profile?.profilePhoto?.publicId

    if (!publicId && !user.profile?.profilePhoto?.url) {
      return res.status(400).json({
        success: false,
        message: 'No profile photo to remove',
      })
    }

    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(() => {})
    }

    const existingProfile = user.profile?.toObject?.() ?? user.profile ?? {}

    user.profile = {
      ...existingProfile,
      profilePhoto: {
        url: '',
        publicId: '',
      },
    }

    await user.save()

    res.json({
      success: true,
      message: 'Profile photo removed successfully',
      data: {
        user: user.toPublicJSON(),
      },
    })
  } catch (error) {
    next(error)
  }
}
