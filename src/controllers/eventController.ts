import { Request, Response } from 'express'
import { prisma } from '../app'
import { generateCode } from '../utils/createEventCode'
import Log from '../utils/logger'

export async function getEventByCode(req: Request, res: Response) {
  const eventCode = req.params.code
  try {
    const event = await prisma.event.findMany({
      where: { eventCode },
    })
    if (event.length === 0) {
      return res.status(404).json({ error: 'invalid event code' })
    }
    return res.status(200).json(event)
  } catch (err: any) {
    Log.error(`error: ${err.message}`)
  }
}

export async function getAllEvents(req: Request, res: Response) {
  try {
    const event = await prisma.event.findMany()
    if (event.length === 0) {
      return res.status(404).json({ msg: 'no events found' })
    }
    return res.status(200).json(event)
  } catch (e: any) {
    Log.error(`error: ${e.message}`)
  }
}

export async function createEvent(req: Request, res: Response) {
  const data = req.body

  const eventCode: string = generateCode()
  const firebaseUrl = data.coverUrl
  const coverUrl = firebaseUrl

  const maxParticipants = Number(data.maxParticipants)
  const isPublic = Boolean(data.isPublic)

  const { name, idCreator, date, location, description } = data

  try {
    const event = await prisma.event.create({
      data: {
        name,
        creator: { connect: { id: idCreator } },
        date,
        location,
        description,
        maxParticipants,
        isPublic,
        eventCode,
        coverUrl,
      },
    })
    Log.info(`event created: ${eventCode}`)
    return res.status(201).json(event)
  } catch (e: any) {
    Log.error(`error: ${e.message}`)
  }
}

export async function deleteEvent(req: Request, res: Response) {
  const id = req.params.id
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  })

  if (!event) {
    return res.status(404).json({ msg: 'event not found' })
  }

  try {
    const deletedEvent = await prisma.event.delete({
      where: {
        id,
      },
    })
    Log.info(`event ${id} was be deleted`)
    return res.status(201).json({ deleted: deletedEvent })
  } catch (e: any) {
    Log.error(`error: ${e.message}`)
  }
}

export async function editEvent(req: Request, res: Response) {
  const id = req.params.id
  const data = req.body
  try {
    const event = await prisma.event.findMany({ where: { id } })
    if (event.length === 0) { return res.status(404).json({ msg: 'event not found' }) }

    const updatedEvent = await prisma.event.update({
      where:
        { id },
      data,
    })

    Log.info(`event ${id} was be updated`)
    return res.status(200).json({ updated: updatedEvent })
  }
  catch (err: any) {
    Log.error(`error: ${err.message}`)
    return res.status(500).json({ error: 'internal server error' })
  }
}
