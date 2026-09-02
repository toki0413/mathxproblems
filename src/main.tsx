import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
// 自托管字体（@fontsource，font-display: swap，无第三方请求）：仅拉丁子集，
// CJK 走系统栈回退。STIX Two Text 是数学排版的文本伴侣，与 KaTeX 同族。
import '@fontsource/stix-two-text/latin-400.css'
import '@fontsource/stix-two-text/latin-400-italic.css'
import '@fontsource/stix-two-text/latin-600.css'
import '@fontsource/stix-two-text/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import { TRPCProvider } from "@/providers/trpc"
import { LanguageProvider } from './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
