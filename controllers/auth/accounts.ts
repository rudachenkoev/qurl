import { AuthenticatedRequest } from '@/middleware/auth'
import prisma from '@/services/prisma'
import { Response } from 'express'

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
