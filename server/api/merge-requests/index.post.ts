import { useValidatedBody, z } from 'h3-zod'
import { mergeRequests } from '../../database/schema'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { sourceBranch, targetBranch, title, description } = await useValidatedBody(event, {
    sourceBranch: z.string().min(1),
    targetBranch: z.string().min(1),
    title: z.string().min(1).max(100),
    description: z.string().optional()
  })

  const mergeRequest = await useDB().insert(mergeRequests).values({
    userId: user.accountId,
    email: user.email,
    fullName: user.name,
    sourceBranch,
    targetBranch,
    title,
    description,
    status: 'pending'
  }).returning().get()

  return mergeRequest
}) 