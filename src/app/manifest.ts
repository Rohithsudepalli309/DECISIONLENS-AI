import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DecisionLens AI',
    short_name: 'DecisionLens',
    description: 'AI-Powered Strategic Decision Support System. Analyze trade-offs, run Monte Carlo simulations, and visualize risks with neural intelligence.',
    id: "decisionlens-ai-v1",
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: "/decision_ai_bg.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Strategic Intelligence Dashboard"
      },
      {
        src: "/placeholders/mobile-screenshot.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Mobile Decision Support"
      }
    ],
    shortcuts: [
      {
        name: "New Strategy",
        short_name: "Strategy",
        description: "Start a new strategic decision analysis",
        url: "/?action=new",
        icons: [{ src: "/icons/shortcut-plus.png", sizes: "96x96" }]
      },
      {
        name: "View Reports",
        short_name: "Reports",
        description: "Access your decision audit logs",
        url: "/audit",
        icons: [{ src: "/icons/shortcut-list.png", sizes: "96x96" }]
      }
    ],
    share_target: {
      action: "/import-handler",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "file",
            accept: ["text/csv", "application/json", ".csv", ".json"]
          }
        ]
      }
    },
    display_override: ["window-controls-overlay", "minimal-ui"],
    categories: ["productivity", "finance", "business"]
  }
}
