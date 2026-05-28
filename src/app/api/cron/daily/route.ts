import { NextRequest, NextResponse } from 'next/server'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { db } from '@/lib/db'
import { processAutoIncome } from '@/app/actions/income-sources'
import { processAutoRecurring } from '@/app/actions/recurring-transactions'
import { sendBillReminders } from '@/lib/email'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
  })

  let processed = 0
  const errors: string[] = []

  for (const user of users) {
    try {
      await processAutoIncome(user.id)
      await processAutoRecurring(user.id)

      const reminderDate = addDays(new Date(), 2)
      const upcoming = await db.bill.findMany({
        where: {
          userId:  user.id,
          isPaid:  false,
          dueDate: { gte: startOfDay(reminderDate), lte: endOfDay(reminderDate) },
        },
        select: { name: true, amount: true, dueDate: true },
      })

      if (upcoming.length > 0) {
        await sendBillReminders(
          user.email,
          user.name,
          upcoming.map((b) => ({ name: b.name, amount: Number(b.amount), dueDate: b.dueDate })),
        )
      }

      processed++
    } catch (err) {
      errors.push(`${user.id}: ${String(err)}`)
    }
  }

  return NextResponse.json({ ok: true, processed, errors })
}
