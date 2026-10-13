/**
 * Pure helpers that turn the activity list into the numbers and shapes the
 * dashboard draws. No framework code in here, so they are easy to test.
 */

export type StatusKind = 'complete' | 'failed' | 'pending'

export interface StatItem {
  direction: 'sent' | 'received'
  state: string
  amount: string
  date: string
}

export interface Point {
  x: number
  y: number
}

/** Groups Circle's many transaction states into three plain ones. */
export function statusKind(state: string): StatusKind {
  switch (state) {
    case 'COMPLETE':
    case 'CONFIRMED':
      return 'complete'
    case 'FAILED':
    case 'DENIED':
    case 'CANCELLED':
      return 'failed'
    default:
      return 'pending'
  }
}

function amountOf(item: StatItem): number {
  const value = Number(item.amount)
  return Number.isFinite(value) && value > 0 ? value : 0
}

/** Money in and out during the calendar month that contains `now`. Failed transfers are ignored. */
export function monthTotals(items: StatItem[], now: Date) {
  let sent = 0
  let received = 0
  let pending = 0
  let count = 0

  for (const item of items) {
    const when = new Date(item.date)
    if (Number.isNaN(when.getTime())) {
      continue
    }
    if (
      when.getFullYear() !== now.getFullYear() ||
      when.getMonth() !== now.getMonth()
    ) {
      continue
    }
    const kind = statusKind(item.state)
    if (kind === 'failed') {
      continue
    }
    const value = amountOf(item)
    count += 1
    if (kind === 'pending') {
      pending += value
    }
    if (item.direction === 'sent') {
      sent += value
    } else {
      received += value
    }
  }

  return { sent, received, pending, count, net: received - sent }
}

/**
 * Money received and sent in each of the last `weeks` weeks. The last bucket
 * is the seven days ending today. Failed transfers are ignored.
 */
export function weeklySeries(items: StatItem[], now: Date, weeks = 8) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const starts: Date[] = []
  for (let i = 0; i < weeks; i++) {
    starts.push(
      new Date(end.getFullYear(), end.getMonth(), end.getDate() - (weeks - i) * 7),
    )
  }

  const received: number[] = new Array(weeks).fill(0)
  const sent: number[] = new Array(weeks).fill(0)

  for (const item of items) {
    const when = new Date(item.date)
    if (Number.isNaN(when.getTime()) || statusKind(item.state) === 'failed') {
      continue
    }
    if (when < starts[0] || when >= end) {
      continue
    }
    let index = weeks - 1
    while (index > 0 && when < starts[index]) {
      index -= 1
    }
    if (item.direction === 'sent') {
      sent[index] += amountOf(item)
    } else {
      received[index] += amountOf(item)
    }
  }

  const labels = starts.map((d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  )
  return { labels, received, sent }
}

/** Picks a tidy top value and step for a chart axis, so ticks read 0, 5, 10, 15, 20 and so on. */
export function niceScale(maxValue: number, divisions = 4) {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return { step: 5, max: 5 * divisions }
  }
  const rough = maxValue / divisions
  const power = Math.pow(10, Math.floor(Math.log10(rough)))
  const fraction = rough / power
  const nice =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
  const step = nice * power
  return { step, max: step * divisions }
}

/** Short axis text: 950, 1.5k, 2M. */
export function axisLabel(value: number): string {
  const trim = (n: number) => String(Number(n.toFixed(2)))
  if (value >= 1_000_000) {
    return `${trim(value / 1_000_000)}M`
  }
  if (value >= 1000) {
    return `${trim(value / 1000)}k`
  }
  return trim(value)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** A smooth line through the points that never dips below or above them. */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) {
    return ''
  }
  let d = `M${round2(points[0].x)},${round2(points[0].y)}`
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const mid = (a.x + b.x) / 2
    d += ` C${round2(mid)},${round2(a.y)} ${round2(mid)},${round2(b.y)} ${round2(b.x)},${round2(b.y)}`
  }
  return d
}

/** The same line, closed down to the baseline so it can be filled. */
export function areaPath(points: Point[], baseY: number): string {
  if (points.length === 0) {
    return ''
  }
  const first = points[0]
  const last = points[points.length - 1]
  return `${smoothPath(points)} L${round2(last.x)},${round2(baseY)} L${round2(first.x)},${round2(baseY)} Z`
}
