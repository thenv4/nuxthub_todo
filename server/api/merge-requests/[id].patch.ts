import { eq } from 'drizzle-orm'
import { useValidatedParams, useValidatedBody, z, zh } from 'h3-zod'
import { mergeRequests } from '../../database/schema'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  // Chỉ cho phép admin cập nhật
  if (user.email !== 'thenv4@f88.vn') {
    throw createError({
      statusCode: 403,
      message: 'Không có quyền thực hiện thao tác này'
    })
  }

  const { id } = await useValidatedParams(event, {
    id: zh.intAsString
  })

  const { status } = await useValidatedBody(event, {
    status: z.enum(['pending', 'merged', 'rejected'])
  })

  const updatedRequest = await useDB()
    .update(mergeRequests)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(eq(mergeRequests.id, id))
    .returning()
    .get()

  if (!updatedRequest) {
    throw createError({
      statusCode: 404,
      message: 'Không tìm thấy yêu cầu merge'
    })
  }

  return updatedRequest
}) 