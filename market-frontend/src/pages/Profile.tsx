import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { ProfileProps } from '../models/Profile'
import { API_PROFILE_URL } from '../config/api'

const CRITERIA_LABELS = ['ddm', 'dcfm', 'ri', 'pb', 'pe', 'pc', 'ps'] as const

const createDefaultCriteriaMatrix = () =>
  CRITERIA_LABELS.map((_, rowIndex) =>
    CRITERIA_LABELS.map((_, colIndex) => (rowIndex === colIndex ? 1 : 0)),
  )

type EditableField = 'username' | 'email' | 'phoneNumber'

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const bodyText = await response.text().catch(() => '')
    throw new Error(
      `Expected JSON but received ${contentType || 'unknown content type'}. ${bodyText.slice(
        0,
        120,
      )}`,
    )
  }

  return response.json() as Promise<ProfileProps>
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileProps | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
  })
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [criteriaMatrix, setCriteriaMatrix] = useState<number[][]>(() =>
    createDefaultCriteriaMatrix(),
  )
  const [isEditingCriteria, setIsEditingCriteria] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const loadProfile = async () => {
      try {
        const response = await fetch(API_PROFILE_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await parseJsonResponse(response)
        if (!isMounted) {
          return
        }

        setProfile(data)
        setFormData({
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        const friendlyError =
          error instanceof Error ? error.message : 'Unable to load your profile'
        setErrorMessage(friendlyError)
      } finally {
        if (!isMounted) {
          return
        }

        setIsFetching(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name as EditableField]: value,
    }))
    setSuccessMessage(null)
  }

  const handleCriteriaChange = (
    rowIndex: number,
    colIndex: number,
    nextValue: string,
  ) => {
    if (rowIndex === colIndex) {
      return
    }

    const parsed = Number.isNaN(Number(nextValue)) ? 0 : Number(nextValue)
    setCriteriaMatrix((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          if (r === c) {
            return 1
          }
          if (r === rowIndex && c === colIndex) {
            return parsed
          }
          return cell
        }),
      ),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

      const payload: ProfileProps = {
        userId: profile?.userId ?? 'unknown-user',
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        createdAt: profile?.createdAt ?? new Date().toISOString(),
        subscriptions: profile?.subscriptions ?? [],
      }

    try {
      const response = await fetch(API_PROFILE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Unable to save profile')
      }

      const updatedProfile = await parseJsonResponse(response)
      setProfile(updatedProfile)
      setFormData({
        username: updatedProfile.username,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
      })
      setSuccessMessage('Profile updated successfully.')
    } catch (error) {
      const friendlyError =
        error instanceof Error ? error.message : 'Unable to save your profile'
      setErrorMessage(friendlyError)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleCriteriaEditing = () => {
    setIsEditingCriteria((prev) => !prev)
  }

  const localizedJoinedAt = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : 'Not yet available'
  const subscriptionSummary =
    profile?.subscriptions && profile.subscriptions.length > 0
      ? profile.subscriptions.join(', ')
      : 'No active subscriptions'
  const disableForm = isFetching || isSaving
  const criteriaNote = 'Diagonal values stay at 1 to preserve consistency.'

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-semibold text-white">Manage profile</h1>
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200">
            {successMessage}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-white/5 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10">
              <img
                src="/avatar.svg"
                alt="avatar"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {profile?.username || formData.username || 'New user'}
              </p>
              <p className="text-sm text-slate-400">
                {profile?.email || formData.email || 'No email yet'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p>
              <span className="font-semibold text-slate-200">Joined:</span>{' '}
              {localizedJoinedAt}
            </p>
            <p>
              <span className="font-semibold text-slate-200">User ID:</span>{' '}
              {profile?.userId || 'Not assigned'}
            </p>
            <p>
              <span className="font-semibold text-slate-200">Subscriptions:</span>{' '}
              {subscriptionSummary}
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/50"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-200">Username</span>
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={disableForm}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white transition focus:border-sky-500 focus:outline-none"
                autoComplete="username"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-200">Email</span>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={disableForm}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white transition focus:border-sky-500 focus:outline-none"
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span className="font-semibold text-slate-200">Phone number</span>
              <input
                name="phoneNumber"
                type="tel"
                placeholder="+84 123 456 789"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={disableForm}
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-white transition focus:border-sky-500 focus:outline-none"
                autoComplete="tel"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              The server will validate and store your latest contact details.
            </p>
            <button
              type="submit"
              disabled={disableForm}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      <section className="bg-red-500 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Criteria matrix</h2>
            <p className="text-sm text-slate-400">{criteriaNote}</p>
          </div>
          <button
            type="button"
            onClick={toggleCriteriaEditing}
            className="inline-flex items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20"
          >
            {isEditingCriteria ? 'Done editing' : 'Edit criteria'}
          </button>
        </div>

        <div className="mt-6 overflow-x-auto lg:overflow-x-visible">
          <table className="w-full table-auto border-collapse text-[10px] md:text-[11px] text-slate-200">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-[9px] md:text-[10px] uppercase tracking-wide text-slate-400">
                  Criteria
                </th>
                {CRITERIA_LABELS.map((label) => (
                  <th
                    key={`col-${label}`}
                    className="px-2 py-1 text-[9px] md:text-[10px] uppercase tracking-wide text-slate-400 text-center"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {CRITERIA_LABELS.map((rowLabel, rowIndex) => (
                <tr key={`row-${rowLabel}`} className="border-t border-white/5">
                  <th className="px-3 py-3 text-left text-[9px] md:text-[10px] uppercase tracking-wide text-slate-400">
                    {rowLabel}
                  </th>

                  {CRITERIA_LABELS.map((colLabel, colIndex) => {
                    const isDiagonal = rowIndex === colIndex
                    const cellValue = criteriaMatrix[rowIndex][colIndex]

                    return (
                      <td
                        key={`${rowLabel}-${colLabel}`}
                        className="h-8 px-1.5 align-middle"
                      >
                        <div className="flex h-full items-center justify-center">
                          {isDiagonal ? (
                            // Diagonal cell (fixed "1")
                            <span className="inline-flex h-6 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 text-center text-[9px] md:text-[10px] leading-none font-semibold text-white">
                              1
                            </span>
                          ) : (
                            // Editable cell
                            <input
                              type="number"
                              step="0.01"
                              value={cellValue}
                              onChange={(event) =>
                                handleCriteriaChange(
                                  rowIndex,
                                  colIndex,
                                  event.target.value,
                                )
                              }
                              disabled={!isEditingCriteria}
                              className="h-6 w-full min-w-0 rounded-xl border border-white/10 bg-slate-900/80 px-2 text-center text-[9px] md:text-[10px] leading-none text-white transition focus:border-sky-500 focus:outline-none disabled:opacity-60"
                            />
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Profile