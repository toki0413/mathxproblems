import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { SiteHeader, SiteFooter } from '@/components/SiteChrome'

// 路由级懒加载：Graph/Laws/Stats 等重页面按需加载，首屏只拉必要 chunk。
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProblemsPage = lazy(() => import('@/pages/ProblemsPage'))
const ProblemDetailPage = lazy(() => import('@/pages/ProblemDetailPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const ApiPage = lazy(() => import('@/pages/ApiPage'))
const ImpactPage = lazy(() => import('@/pages/ImpactPage'))
const NeedsPage = lazy(() => import('@/pages/NeedsPage'))
const ToolsPage = lazy(() => import('@/pages/ToolsPage'))
const ObstaclesPage = lazy(() => import('@/pages/ObstaclesPage'))
const LedgerPage = lazy(() => import('@/pages/LedgerPage'))
const GraphPage = lazy(() => import('@/pages/GraphPage'))
const LawsPage = lazy(() => import('@/pages/LawsPage'))
const SubmitPage = lazy(() => import('@/pages/SubmitPage'))
const ReviewPage = lazy(() => import('@/pages/ReviewPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
              <span className="font-mono2 text-xs text-ink-3">Loading…</span>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/api" element={<ApiPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/needs" element={<NeedsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/obstacles" element={<ObstaclesPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/laws" element={<LawsPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
