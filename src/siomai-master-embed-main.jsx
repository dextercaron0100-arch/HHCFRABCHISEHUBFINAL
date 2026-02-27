import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import './siomai-master-embed.css'
import BossSiomaiMasterFranchisePage from './BossSiomaiMasterFranchisePage.jsx'

inject()

const mountNode = document.getElementById('masterCanvasMount')

if (mountNode) {
  createRoot(mountNode).render(<BossSiomaiMasterFranchisePage />)
}
