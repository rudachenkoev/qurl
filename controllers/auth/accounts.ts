import { AuthenticatedRequest } from '@/middleware/auth'
import { PrismaClient } from '@prisma/client'
import { Response } from 'express'

const prisma = new PrismaClient()
const responseSerializer = {
  id: true,
  email: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
}
// Retrieves the current authenticated user.
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      },
      select: responseSerializer
    })
    if (!user) {
      res.sendStatus(404)
      return
    }
    if (!user.isActive) {
      res.status(400).send('User was deactivated')
      return
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
}
