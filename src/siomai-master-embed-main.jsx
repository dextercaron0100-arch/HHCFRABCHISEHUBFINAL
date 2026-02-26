import { createRoot } from 'react-dom/client'
import './siomai-master-embed.css'
import BossSiomaiMasterFranchisePage from './BossSiomaiMasterFranchisePage.jsx'

const mountNode = document.getElementById('masterCanvasMount')

if (mountNode) {
  createRoot(mountNode).render(<BossSiomaiMasterFranchisePage />)
}
