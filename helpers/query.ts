import { ParsedQs } from 'qs'

export const paginateQuery = (query: ParsedQs): { skip?: number; take?: number } => {
  const page = query.page && typeof query.page === 'string' ? parseInt(query.page, 10) : null
  const pageSize = query.page_size && typeof query.page_size === 'string' ? parseInt(query.page_size, 10) : null

  if (!page || !pageSize) return {}

  return {
    skip: (page - 1) * pageSize,
    take: pageSize
  }
}

export const orderQuery = (query: ParsedQs): { orderBy?: { [column: string]: 'asc' | 'desc' } } => {
  const ordering = query.ordering && typeof query.ordering === 'string' ? query.ordering : null

  if (!ordering) return {}

  const direction = ordering.startsWith('-') ? 'desc' : 'asc'
  const column = direction === 'desc' ? ordering.slice(1) : ordering

  return {
    orderBy: {
      [column]: direction
    }
  }
}
