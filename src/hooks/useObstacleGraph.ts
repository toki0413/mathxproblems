import { useEffect, useState } from 'react'

/** /api/v1/obstacles.json 的客户端契约：跨题障碍链 + 方法解锁（P1-2 复用市场）。 */
export interface ObstacleGraphEdge {
  a: { problem: string; head: string }
  b: { problem: string; head: string }
  score: number
}

export interface ObstacleGraphPayload {
  links: ObstacleGraphEdge[]
  /** 已通过方法（method）→ 沿障碍链一跳可达、尚未被该方法触及的问题 id 列表 */
  unlocks: Record<string, string[]>
  stats?: { problems: number; obstacles: number; links: number }
}

/**
 * 拉取障碍路由层一次，供详情页「同障碍问题」与障碍页「方法解锁」复用。
 * 纯静态部署下接口 404 时静默为 null，两个消费面各自优雅降级。
 */
export function useObstacleGraph(): ObstacleGraphPayload | null {
  const [data, setData] = useState<ObstacleGraphPayload | null>(null)
  useEffect(() => {
    let alive = true
    fetch('/api/v1/obstacles.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && Array.isArray(d.links)) setData(d as ObstacleGraphPayload)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return data
}
