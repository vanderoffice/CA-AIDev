/**
 * useBotPersistence.js
 *
 * Custom hook for persisting bot session state to sessionStorage.
 * Returns sessionId, messages, mode, and their setters + reset.
 */

import { useState, useEffect, useCallback } from 'react'

function readStorage(key, fallback) {
  try {
    const stored = sessionStorage.getItem(key)
    return stored !== null ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sessionStorage full or unavailable — degrade silently
  }
}

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function useBotPersistence(botName) {
  const prefix = `${botName}-`

  const [sessionId, setSessionId] = useState(() => {
    const stored = readStorage(`${prefix}sessionId`, null)
    if (stored) return stored
    const id = generateId()
    writeStorage(`${prefix}sessionId`, id)
    return id
  })

  const [messages, setMessagesRaw] = useState(() =>
    readStorage(`${prefix}messages`, [])
  )

  const [mode, setModeRaw] = useState(() =>
    readStorage(`${prefix}mode`, 'choice')
  )

  // Sync messages to sessionStorage
  useEffect(() => {
    writeStorage(`${prefix}messages`, messages)
  }, [prefix, messages])

  // Sync mode to sessionStorage
  useEffect(() => {
    writeStorage(`${prefix}mode`, mode)
  }, [prefix, mode])

  // Wrap setMessages to accept both value and updater function
  const setMessages = useCallback((valueOrUpdater) => {
    setMessagesRaw(valueOrUpdater)
  }, [])

  // Wrap setMode similarly
  const setMode = useCallback((valueOrUpdater) => {
    setModeRaw(valueOrUpdater)
  }, [])

  // Reset: clear all keys, regenerate session, reset state
  const reset = useCallback(() => {
    sessionStorage.removeItem(`${prefix}sessionId`)
    sessionStorage.removeItem(`${prefix}messages`)
    sessionStorage.removeItem(`${prefix}mode`)

    const newId = generateId()
    writeStorage(`${prefix}sessionId`, newId)
    setSessionId(newId)
    setMessagesRaw([])
    setModeRaw('choice')
  }, [prefix])

  return { sessionId, messages, mode, setMessages, setMode, reset }
}
