import { useCallback, useEffect, useState } from 'react'

/**
 * 已读问题集合：localStorage 持久化，跨页面共享（图谱页灰化/空心化、列表划线）。
 * 探索进度是用户自己的成就系统——对开放问题社区而言这是最廉价的回访动力。
 */
const KEY = 'mathx-visited'

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

const listeners = new Set<() => void>()
function write(s: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]))
  } catch {
    /* 隐私模式下静默失败 */
  }
  listeners.forEach((f) => f())
}

export function markVisited(id: string) {
  const s = read()
  if (s.has(id)) return
  s.add(id)
  write(s)
}

export function useVisited(): Set<string> {
  const [snap, setSnap] = useState<Set<string>>(read)
  useEffect(() => {
    const f = () => setSnap(read())
    listeners.add(f)
    return () => {
      listeners.delete(f)
    }
  }, [])
  return snap
}

/** 详情页挂载时登记已读 */
export function useMarkVisited(id: string | undefined) {
  useEffect(() => {
    if (id) markVisited(id)
  }, [id])
}

export function useVisitedActions() {
  const clear = useCallback(() => write(new Set()), [])
  return { clear }
}
