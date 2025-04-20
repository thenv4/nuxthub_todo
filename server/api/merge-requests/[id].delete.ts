import { eq } from 'drizzle-orm'
import { useValidatedParams, zh } from 'h3-zod'
import { mergeRequests } from '../../database/schema'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  
  // Chỉ cho phép admin xóa
  if (user.email !== 'thenv4@f88.vn') {
    throw createError({
      statusCode: 403,
      message: 'Không có quyền thực hiện thao tác này'
    })
  }

  const { id } = await useValidatedParams(event, {
    id: zh.intAsString
  })

  const deletedRequest = await useDB()
    .delete(mergeRequests)
    .where(eq(mergeRequests.id, id))
    .returning()
    .get()

  if (!deletedRequest) {
    throw createError({
      statusCode: 404,
      message: 'Không tìm thấy yêu cầu merge'
    })
  }

  return deletedRequest
}) 