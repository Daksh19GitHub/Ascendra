import {
  addProfileSearchHistory,
  clearProfileSearchHistory,
  getProfileSearchHistory,
  removeProfileSearchHistoryEntry,
} from '../services/searchHistoryService.js'

export async function listSearchHistory(req, res, next) {
  try {
    const history = await getProfileSearchHistory(req.user._id)

    res.json({
      success: true,
      data: { history },
    })
  } catch (error) {
    next(error)
  }
}

export async function recordSearchHistory(req, res, next) {
  try {
    const username = (req.body.username || '').trim()

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      })
    }

    const result = await addProfileSearchHistory(req.user._id, username)

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      })
    }

    res.json({
      success: true,
      data: { history: result.history },
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteSearchHistoryEntry(req, res, next) {
  try {
    const result = await removeProfileSearchHistoryEntry(req.user._id, req.params.username)

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      })
    }

    res.json({
      success: true,
      data: { history: result.history },
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteAllSearchHistory(req, res, next) {
  try {
    const result = await clearProfileSearchHistory(req.user._id)

    res.json({
      success: true,
      message: 'Search history cleared',
      data: { history: result.history },
    })
  } catch (error) {
    next(error)
  }
}
