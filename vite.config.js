import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const cleanUrlHtmlRoutes = {
  '/history': '/history.html',
  '/boss-siomai': '/boss-siomai.html',
  '/awards': '/awards.html',
  '/bigstop-franchise-kit': '/bigstop-franchise-kit.html',
  '/bigstop': '/bigstop.html',
  '/boss-chickn': '/boss-chickn.html',
  '/boss-fries': '/boss-fries.html',
  '/branches': '/branches.html',
  '/burger2go': '/burger2go.html',
  '/faqs': '/faqs.html',
  '/founder': '/founder.html',
  '/herrera-franchise-kit': '/herrera-franchise-kit.html',
  '/herrera-pharmacy': '/herrera-pharmacy.html',
  '/noodle-king': '/noodle-king.html',
  '/seals': '/seals.html',
}

function extensionlessHtmlRewritePlugin(routes) {
  const rewriteRoute = (req, _res, next) => {
    if (!req.url) {
      next()
      return
    }

    const [pathname, query] = req.url.split('?')
    const targetPath = routes[pathname]
    if (targetPath) {
      req.url = query ? `${targetPath}?${query}` : targetPath
    }

    next()
  }

  return {
    name: 'hhf-extensionless-html-rewrite',
    configureServer(server) {
      server.middlewares.use(rewriteRoute)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteRoute)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), extensionlessHtmlRewritePlugin(cleanUrlHtmlRoutes)],
  server: {
    open: '/index.html',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    open: '/index.html',
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        bossSiomai: fileURLToPath(new URL('./boss-siomai.html', import.meta.url)),
        history: fileURLToPath(new URL('./history.html', import.meta.url)),
      },
    },
  },
})
