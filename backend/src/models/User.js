import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { calculateProfileCompletion } from '../utils/profileCompletion.js'

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    field: { type: String, trim: true, default: '' },
    startYear: { type: String, trim: true, default: '' },
    endYear: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
)

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    year: { type: String, trim: true, default: '' },
  },
  { _id: false }
)

const workExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
)

const profileSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    headline: { type: String, trim: true, default: '' },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
    },
    education: { type: [educationSchema], default: [] },
    skills: { type: [String], default: [] },
    achievements: { type: [achievementSchema], default: [] },
    workExperience: { type: [workExperienceSchema], default: [] },
    profilePhoto: {
      url: { type: String, trim: true, default: '' },
      publicId: { type: String, trim: true, default: '' },
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@(\S+\.\S+|ascendra)$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
    profileEmbedding: {
      type: [Number],
      select: false,
    },
    profileEmbeddingHash: {
      type: String,
      select: false,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    profile: this.profile || {},
    profileCompletion: calculateProfileCompletion(this),
    createdAt: this.createdAt,
  }
}

userSchema.methods.toFeedAuthorJSON = function toFeedAuthorJSON() {
  return {
    id: this._id,
    username: this.username,
    fullName: this.profile?.fullName || this.username,
    headline: this.profile?.headline || '',
    profilePhoto: this.profile?.profilePhoto || { url: '', publicId: '' },
  }
}

userSchema.methods.toPublicProfileJSON = function toPublicProfileJSON(viewerId) {
  const isOwner =
    viewerId && this._id.toString() === viewerId.toString()

  return {
    id: this._id,
    username: this.username,
    email: isOwner ? this.email : undefined,
    profile: this.profile || {},
    profileCompletion: calculateProfileCompletion(this),
    isOwner,
    createdAt: this.createdAt,
  }
}

const User = mongoose.model('User', userSchema)

export default User
