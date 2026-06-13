import { openDB } from 'idb'
import { supabase } from './supabase'
import type { DailyLog } from '@/types'

const DB_NAME = 'hhh-offline'
const DB_VERSION = 1
const STORE = 'daily_log_queue'

export interface QueuedLog {
  user_id: string
  log_date: string
  payload: Partial<DailyLog>
  queued_at: number
}

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { autoIncrement: true })
      }
    },
  })
}

export async function enqueueLog(entry: QueuedLog): Promise<void> {
  const db = await getDB()
  await db.add(STORE, entry)
}

// Returns the count of successfully synced entries.
export async function flushQueue(): Promise<number> {
  const db = await getDB()
  const keys = (await db.getAllKeys(STORE)) as number[]
  const values = (await db.getAll(STORE)) as QueuedLog[]

  if (keys.length === 0) return 0

  const entries = keys.map((key, i) => ({ key, value: values[i] }))
  entries.sort((a, b) => a.value.queued_at - b.value.queued_at)

  let flushed = 0
  for (const { key, value } of entries) {
    const { error } = await supabase.from('daily_logs').upsert(
      { ...value.payload, user_id: value.user_id, log_date: value.log_date },
      { onConflict: 'user_id,log_date' }
    )
    if (!error) {
      await db.delete(STORE, key)
      flushed++
    }
  }
  return flushed
}

export async function pendingCount(): Promise<number> {
  const db = await getDB()
  return (await db.count(STORE)) as number
}
