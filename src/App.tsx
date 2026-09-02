import { Routes, Route } from 'react-router'
import { SiteHeader, SiteFooter } from '@/components/SiteChrome'
import HomePage from '@/pages/HomePage'
import ProblemsPage from '@/pages/ProblemsPage'
import ProblemDetailPage from '@/pages/ProblemDetailPage'
import AboutPage from '@/pages/AboutPage'
import StatsPage from '@/pages/StatsPage'
import ApiPage from '@/pages/ApiPage'
import ImpactPage from '@/pages/ImpactPage'
import GraphPage from '@/pages/GraphPage'
import LawsPage from '@/pages/LawsPage'
import SubmitPage from '@/pages/SubmitPage'
import ReviewPage from '@/pages/ReviewPage'
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/api" element={<ApiPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/laws" element={<LawsPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}
