import { useEffect, useRef, useState } from 'react'
import { sendAssistantMessage } from '../api/webAppApi'

const QUICK_PROMPTS = [
  'Draft a post about a recent achievement',
  'What skills should I add to my profile?',
  'Suggest a post introducing myself on Ascendra',
  'Which of my skills fit software engineering roles?',
]

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    'Hi! I can help you draft feed posts and answer questions about your skills. Try a quick prompt below or ask anything.',
}

function toApiMessages(messages) {
  return messages.filter((message) => message !== WELCOME_MESSAGE)
}

function AiAssistantPanel() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await sendAssistantMessage(toApiMessages(nextMessages))
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach Ascendra AI. Please try again.')
    } finally {
      setLoading(false)
      inputRef.current?.focus({ preventScroll: true })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await handleSend(input)
  }

  async function handleCopy(content, index) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1800)
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  function handleClearChat() {
    setMessages([WELCOME_MESSAGE])
    setError('')
    setInput('')
  }

  return (
    <aside className="webapp-rail-right ai-assistant-rail" aria-label="Ascendra AI assistant">
      <div className="ai-assistant-panel">
        <header className="ai-assistant-header">
          <div className="ai-assistant-header-main">
            <span className="ai-assistant-icon" aria-hidden="true">
              <i className="bi bi-stars"></i>
            </span>
            <div>
              <h2>Ascendra AI</h2>
              <p>Posts & skills helper</p>
            </div>
          </div>
          <button
            type="button"
            className="ai-assistant-clear-btn"
            onClick={handleClearChat}
            disabled={loading}
            title="Clear chat"
            aria-label="Clear chat"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>
        </header>

        <div className="ai-assistant-quick-prompts" role="group" aria-label="Quick prompts">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="ai-assistant-quick-btn"
              disabled={loading}
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div
          ref={messagesContainerRef}
          className="ai-assistant-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`ai-assistant-message ai-assistant-message-${message.role}`}
            >
              <p>{message.content}</p>
              {message.role === 'assistant' && index > 0 && (
                <button
                  type="button"
                  className="ai-assistant-copy-btn"
                  onClick={() => handleCopy(message.content, index)}
                >
                  <i className={`bi ${copiedIndex === index ? 'bi-check2' : 'bi-clipboard'}`}></i>
                  {copiedIndex === index ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-assistant-message ai-assistant-message-assistant ai-assistant-loading">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Thinking...
            </div>
          )}
        </div>

        {error && <p className="ai-assistant-error">{error}</p>}

        <form className="ai-assistant-form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="form-control ai-assistant-input"
            rows={3}
            placeholder="Ask about skills or request a post draft..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            maxLength={2000}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
          />
          <button
            type="submit"
            className="btn btn-profile-save ai-assistant-send-btn"
            disabled={loading || !input.trim()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </aside>
  )
}

export default AiAssistantPanel
