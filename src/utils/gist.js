import fetch from 'fetch-enhance'
import store from 'store'

const token = store.state.app.settings.tokens.github

export function createOrUpdateGist(payload, id) {
  const headers = new Headers()
  if (token) {
    headers.append('Authorization', `token ${token}`)
  }
  const shouldUpdate = id && token
  const method = shouldUpdate ? 'PATCH' : 'POST'
  const url = `https://api.github.com/gists${shouldUpdate ? `/${id}` : ''}`
  return fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload)
  })
}
