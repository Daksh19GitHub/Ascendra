import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchProfile, updateProfile } from '../api/webAppApi'
import ProfileCompletionRing from '../components/ProfileCompletionRing'
import ProfilePhotoUpload from '../components/ProfilePhotoUpload'
import {
  buildProfileForm,
  calculateProfileCompletion,
  emptyAchievement,
  emptyEducation,
  emptyWorkExperience,
  sanitizeProfilePayload,
} from '../utils/profileForm'

function ChecklistItem({ done, children }) {
  return (
    <li className={done ? 'done' : 'pending'}>
      <span className="profile-checklist-icon" aria-hidden="true">
        <i className={`bi ${done ? 'bi-check-lg' : 'bi-x-lg'}`}></i>
      </span>
      {children}
    </li>
  )
}

function ProfileEdit() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState(() => buildProfileForm(user))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [completion, setCompletion] = useState(user?.profileCompletion ?? 25)

  useEffect(() => {
    setCompletion(calculateProfileCompletion(user, form))
  }, [user, form])

  useEffect(() => {
    fetchProfile()
      .then((response) => {
        updateUser(response.data.user)
        setForm(buildProfileForm(response.data.user))
      })
      .catch(() => {
        setError('Unable to load your profile. Please refresh and try again.')
      })
      .finally(() => {
        setLoading(false)
      })
    // Load profile once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(path, value) {
    setForm((prev) => {
      const next = { ...prev }
      if (path === 'fullName') {
        next.fullName = value
      } else if (path === 'headline') {
        next.headline = value
      } else if (path.startsWith('address.')) {
        const key = path.split('.')[1]
        next.address = { ...prev.address, [key]: value }
      }
      return next
    })
    setSuccess('')
  }

  function updateListItem(listName, index, field, value) {
    setForm((prev) => {
      const list = [...prev[listName]]
      if (listName === 'skills') {
        list[index] = value
      } else {
        list[index] = { ...list[index], [field]: value }
      }
      return { ...prev, [listName]: list }
    })
    setSuccess('')
  }

  function addListItem(listName, factory) {
    setForm((prev) => ({
      ...prev,
      [listName]: [...prev[listName], factory()],
    }))
  }

  function removeListItem(listName, index) {
    setForm((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = sanitizeProfilePayload(form)
      const response = await updateProfile(payload)
      updateUser(response.data.user)
      setForm(buildProfileForm(response.data.user))
      setSuccess('Profile saved successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container webapp-page-content text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container webapp-page-content">
      <div className="profile-layout">
        <aside className="profile-completion-card">
          <ProfileCompletionRing percentage={completion} />
          <h2>Profile strength</h2>
          <p className="webapp-muted">
            Complete your profile to help others learn about your background and
            expertise.
          </p>
          <ul className="profile-checklist">
            <ChecklistItem done={Boolean(user?.username)}>Username</ChecklistItem>
            <ChecklistItem done={Boolean(user?.email)}>Email</ChecklistItem>
            <ChecklistItem done={Boolean(user?.profile?.profilePhoto?.url)}>
              Profile photo
            </ChecklistItem>
            <ChecklistItem done={Boolean(form.fullName.trim())}>Full name</ChecklistItem>
            <ChecklistItem done={Boolean(form.headline.trim())}>Professional headline</ChecklistItem>
            <ChecklistItem
              done={Object.values(form.address).some((v) => v.trim())}
            >
              Address
            </ChecklistItem>
            <ChecklistItem
              done={form.education.some((e) => e.institution.trim())}
            >
              Education
            </ChecklistItem>
            <ChecklistItem done={form.skills.some((s) => s.trim())}>
              Skills
            </ChecklistItem>
            <ChecklistItem
              done={form.achievements.some((a) => a.title.trim())}
            >
              Achievements
            </ChecklistItem>
            <ChecklistItem
              done={form.workExperience.some((w) => w.company.trim())}
            >
              Work experience
            </ChecklistItem>
          </ul>
        </aside>

        <div className="webapp-panel profile-form-panel">
          <div className="webapp-panel-header">
            <div>
              <Link to="/app/profile" className="profile-edit-back-link">
                <i className="bi bi-arrow-left me-1"></i>
                View public profile
              </Link>
              <h1>Edit profile</h1>
              <p className="webapp-muted mb-0">
                Update the details shown on your public profile
              </p>
            </div>
          </div>

          {error && <div className="profile-alert profile-alert-error">{error}</div>}
          {success && (
            <div className="profile-alert profile-alert-success">{success}</div>
          )}

          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <ProfilePhotoUpload
              photoUrl={user?.profile?.profilePhoto?.url}
              onPhotoUpdated={(updatedUser, message) => {
                updateUser(updatedUser)
                setSuccess(message || 'Profile photo updated successfully.')
                setError('')
              }}
            />

            <section className="profile-section">
              <h2>Account</h2>
              <p className="profile-section-hint">
                Username and email are saved from your login and cannot be changed
                here.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control profile-readonly"
                    value={user?.username || ''}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control profile-readonly"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2>Personal details</h2>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="fullName" className="form-label">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="form-control"
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="headline" className="form-label">
                    Headline
                  </label>
                  <input
                    id="headline"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 3rd Year Student at NSUT or Recruiter at Google"
                    value={form.headline}
                    onChange={(e) => updateField('headline', e.target.value)}
                    disabled={saving}
                    maxLength={220}
                  />
                  <div className="form-text">
                    Shown under your name across Ascendra, like LinkedIn.
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="street" className="form-label">
                    Street address
                  </label>
                  <input
                    id="street"
                    type="text"
                    className="form-control"
                    placeholder="123 Main Street"
                    value={form.address.street}
                    onChange={(e) => updateField('address.street', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="form-control"
                    value={form.address.city}
                    onChange={(e) => updateField('address.city', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="state" className="form-label">
                    State / Province
                  </label>
                  <input
                    id="state"
                    type="text"
                    className="form-control"
                    value={form.address.state}
                    onChange={(e) => updateField('address.state', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    className="form-control"
                    value={form.address.country}
                    onChange={(e) => updateField('address.country', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="postalCode" className="form-label">
                    Postal code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    className="form-control"
                    value={form.address.postalCode}
                    onChange={(e) =>
                      updateField('address.postalCode', e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-top">
                <h2>Education</h2>
                <button
                  type="button"
                  className="btn btn-sm btn-profile-add"
                  onClick={() => addListItem('education', emptyEducation)}
                  disabled={saving}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Add
                </button>
              </div>
              {form.education.map((entry, index) => (
                <div className="profile-repeat-card" key={`edu-${index}`}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Institution</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.institution}
                        onChange={(e) =>
                          updateListItem('education', index, 'institution', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Degree</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="B.Sc., M.B.A., etc."
                        value={entry.degree}
                        onChange={(e) =>
                          updateListItem('education', index, 'degree', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Field of study</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.field}
                        onChange={(e) =>
                          updateListItem('education', index, 'field', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Start year</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.startYear}
                        onChange={(e) =>
                          updateListItem('education', index, 'startYear', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End year</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.endYear}
                        onChange={(e) =>
                          updateListItem('education', index, 'endYear', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={entry.description}
                        onChange={(e) =>
                          updateListItem('education', index, 'description', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>
                  {form.education.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-profile-remove"
                      onClick={() => removeListItem('education', index)}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            <section className="profile-section">
              <div className="profile-section-top">
                <h2>Skills</h2>
                <button
                  type="button"
                  className="btn btn-sm btn-profile-add"
                  onClick={() => addListItem('skills', () => '')}
                  disabled={saving}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Add
                </button>
              </div>
              <div className="row g-3">
                {form.skills.map((skill, index) => (
                  <div className="col-md-6" key={`skill-${index}`}>
                    <div className="profile-inline-field">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. React, Leadership"
                        value={skill}
                        onChange={(e) =>
                          updateListItem('skills', index, 'skill', e.target.value)
                        }
                        disabled={saving}
                      />
                      {form.skills.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-profile-remove-inline"
                          onClick={() => removeListItem('skills', index)}
                          disabled={saving}
                          aria-label="Remove skill"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="profile-section">
              <div className="profile-section-top">
                <h2>Achievements</h2>
                <button
                  type="button"
                  className="btn btn-sm btn-profile-add"
                  onClick={() => addListItem('achievements', emptyAchievement)}
                  disabled={saving}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Add
                </button>
              </div>
              {form.achievements.map((entry, index) => (
                <div className="profile-repeat-card" key={`ach-${index}`}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.title}
                        onChange={(e) =>
                          updateListItem('achievements', index, 'title', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Year</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.year}
                        onChange={(e) =>
                          updateListItem('achievements', index, 'year', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={entry.description}
                        onChange={(e) =>
                          updateListItem(
                            'achievements',
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>
                  {form.achievements.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-profile-remove"
                      onClick={() => removeListItem('achievements', index)}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            <section className="profile-section">
              <div className="profile-section-top">
                <h2>Work experience</h2>
                <button
                  type="button"
                  className="btn btn-sm btn-profile-add"
                  onClick={() => addListItem('workExperience', emptyWorkExperience)}
                  disabled={saving}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Add
                </button>
              </div>
              {form.workExperience.map((entry, index) => (
                <div className="profile-repeat-card" key={`work-${index}`}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.company}
                        onChange={(e) =>
                          updateListItem(
                            'workExperience',
                            index,
                            'company',
                            e.target.value
                          )
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Job title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={entry.title}
                        onChange={(e) =>
                          updateListItem('workExperience', index, 'title', e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Start date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Jan 2022"
                        value={entry.startDate}
                        onChange={(e) =>
                          updateListItem(
                            'workExperience',
                            index,
                            'startDate',
                            e.target.value
                          )
                        }
                        disabled={saving}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dec 2024"
                        value={entry.endDate}
                        onChange={(e) =>
                          updateListItem(
                            'workExperience',
                            index,
                            'endDate',
                            e.target.value
                          )
                        }
                        disabled={saving || entry.current}
                      />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`current-${index}`}
                          checked={entry.current}
                          onChange={(e) =>
                            updateListItem(
                              'workExperience',
                              index,
                              'current',
                              e.target.checked
                            )
                          }
                          disabled={saving}
                        />
                        <label className="form-check-label" htmlFor={`current-${index}`}>
                          I currently work here
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={entry.description}
                        onChange={(e) =>
                          updateListItem(
                            'workExperience',
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>
                  {form.workExperience.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-profile-remove"
                      onClick={() => removeListItem('workExperience', index)}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </section>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="btn btn-profile-save"
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  'Save profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileEdit
