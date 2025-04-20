import type { H3Event } from 'h3'
import type { User } from '#auth-utils'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface UserResponse {
  account_id: string
  email: string
  name: string
  picture: string
}

export default eventHandler(async (event) => {
  const code = getQuery(event).code
  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Missing authorization code'
    })
  }

  const config = useRuntimeConfig()
  const origin = getRequestURL(event).origin
  const redirectUri = `${origin}/api/auth/jira`

  const tokenResponse = await $fetch<TokenResponse>('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    body: {
      grant_type: 'authorization_code',
      client_id: config.public.NUXT_OAUTH_JIRA_CLIENT_ID,
      client_secret: config.NUXT_OAUTH_JIRA_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    }
  })

  const userResponse = await $fetch<UserResponse>('https://api.atlassian.com/me', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`
    }
  })

  const user: User = {
    accountId: userResponse.account_id,
    email: userResponse.email,
    name: userResponse.name,
    picture: userResponse.picture
  }

  await setUserSession(event, { user })
  return sendRedirect(event, '/todos')
}) 