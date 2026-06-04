const rawBase = import.meta.env.VITE_API_BASE_URL ?? 'http://103.162.20.119:3000'
const normalizedBase = rawBase.replace(/\/+$/, '')
export const API_BASE_URL = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`

const HTML_RESPONSE_MESSAGE = 'Security verification required. Complete the challenge to continue.'
const HTML_CONTENT_TYPE_PATTERN = /\btext\/html\b/i
const HTML_DOCUMENT_PATTERN = /^\s*(?:<!doctype html\b|<html[\s>])/i

export class HtmlApiResponseError extends Error {
  public readonly responseUrl: string
  public readonly status: number

  constructor(message: string, responseUrl: string, status: number) {
    super(message)
    this.name = 'HtmlApiResponseError'
    this.responseUrl = responseUrl
    this.status = status
  }
}

const escapeAttribute = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const addBaseHref = (html: string, responseUrl: string): string => {
  if (!responseUrl || /<base\b/i.test(html)) return html

  let baseHref = responseUrl
  try {
    baseHref = typeof window === 'undefined' ? responseUrl : new URL(responseUrl, window.location.href).href
  } catch {
    baseHref = responseUrl
  }

  const escapedBaseHref = escapeAttribute(baseHref)
  const withBase = html.replace(/<head([^>]*)>/i, `<head$1><base href="${escapedBaseHref}">`)
  return withBase.replace(/\saction=(["'])\s*\1/gi, (_match, quote: string) => ` action=${quote}${escapedBaseHref}${quote}`)
}

const renderHtmlResponse = (html: string, responseUrl: string): void => {
  if (typeof document === 'undefined') return

  document.open()
  document.write(addBaseHref(html, responseUrl))
  document.close()
}

const isHtmlResponseText = (text: string): boolean => HTML_DOCUMENT_PATTERN.test(text)

const handleHtmlResponseText = (response: Response, text: string): string => {
  if (!isHtmlResponseText(text)) return text

  renderHtmlResponse(text, response.url)
  throw new HtmlApiResponseError(HTML_RESPONSE_MESSAGE, response.url, response.status)
}

export const assertNonHtmlResponse = async (response: Response): Promise<Response> => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!HTML_CONTENT_TYPE_PATTERN.test(contentType) && response.ok) return response

  const text = await response.clone().text().catch(() => '')
  handleHtmlResponseText(response, text)
  return response
}

export const readApiResponseText = async (response: Response): Promise<string> => {
  const text = await response.text()
  return handleHtmlResponseText(response, text)
}

export const parseApiJson = async <T>(response: Response): Promise<T> => {
  const text = await readApiResponseText(response)
  if (!text.trim()) return null as T

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Unexpected non-JSON response from API')
  }
}

export const apiFetch = async (path: string, options: RequestInit = {}, token?: string | null): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  return assertNonHtmlResponse(response)
}

export const getToken = (): string | null => localStorage.getItem('finsight_token')
export const getUserId = (): string | null => localStorage.getItem('finsight_userId')
export const getIsAdmin = (): boolean => localStorage.getItem('finsight_isAdmin') === 'true'

export const authFetch = (path: string, options: RequestInit = {}): Promise<Response> =>
  apiFetch(path, options, getToken())
