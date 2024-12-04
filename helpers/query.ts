import prisma from '@/services/prisma'
import { PrismaClient } from '@prisma/client'
import { ParsedQs } from 'qs'

const paginateQuery = (query: ParsedQs): { skip?: number; take?: number } => {
  const page = parseInt(query.page as string, 10)
  const pageCount = parseInt(query.pageCount as string, 10)

  if (isNaN(page) || isNaN(pageCount)) return {}

  return { skip: (page - 1) * pageCount, take: pageCount }
}

const orderQuery = (query: ParsedQs): { orderBy?: { [column: string]: 'asc' | 'desc' } } => {
  const ordering = query.ordering as string
  if (!ordering) return {}

  const direction = ordering.startsWith('-') ? 'desc' : 'asc'
  const column = direction === 'desc' ? ordering.slice(1) : ordering

  return { orderBy: { [column]: direction } }
}

export async function handleQueryResponse<T>(
  model: keyof PrismaClient,
  options: {
    query: ParsedQs
    where: Record<string, unknown>
    select: Record<string, unknown>
  }
): Promise<{ totalCount?: number; results: T[] } | T[]> {
  const { query, where, select } = options

  // Form pagination and sorting parameters
  const pagination = paginateQuery(query)
  const ordering = orderQuery(query)

  try {
    // Getting data taking into account filters
    const results = await (prisma[model] as any).findMany({
      where,
      select,
      ...pagination,
      ...ordering
    })

    // If pagination of items is requested
    if (Object.keys(pagination).length) {
      const totalCount = await (prisma[model] as any).count({ where })
      return { totalCount, results }
    }

    return results
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to fetch data')
  }
}
