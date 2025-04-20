import { eq, desc } from 'drizzle-orm'
import { mergeRequests } from '../../database/schema'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const requests = await useDB()
    .select()
    .from(mergeRequests)
    .where(eq(mergeRequests.userId, user.accountId))
    .orderBy(desc(mergeRequests.createdAt))
    .all()
  return requests
}) 