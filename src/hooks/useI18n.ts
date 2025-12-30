"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Language = "en" | "es" | "jp"

const translations = {
  en: {
    dashboard: "Dashboard",
    history: "Audit History",
    bunker: "Security Bunker",
    logout: "Secure Logout",
    sync_stable: "Neural Link Stable",
    syncing: "Syncing Logic",
    export_pdf: "Briefing PDF",
    export_csv: "Raw CSV",
    share: "Share Briefing",
    deep_dive: "View Deep Dive Analysis",
    hide_details: "Hide Technical Analysis",
    tradeoff_matrix: "Tradeoff Matrix",
    executive_summary: "Executive Summary",
    recommended_option: "Recommended Configuration"
  },
  es: {
    dashboard: "Panel",
    history: "Historial de Auditoría",
    bunker: "Búnker de Seguridad",
    logout: "Cierre de Sesión",
    sync_stable: "Enlace Neuronal Estable",
    syncing: "Sincronizando Lógica",
    export_pdf: "Informe PDF",
    export_csv: "CSV Bruto",
    share: "Compartir Informe",
    deep_dive: "Análisis Profundo",
    hide_details: "Ocultar Análisis Técnico",
    tradeoff_matrix: "Matriz de Intercambio",
    executive_summary: "Resumen Ejecutivo",
    recommended_option: "Configuración Recomendada"
  },
  jp: {
    dashboard: "ダッシュボード",
    history: "監査履歴",
    bunker: "セキュリティバンカー",
    logout: "ログアウト",
    sync_stable: "ニューラルリンク安定",
    syncing: "同期中...",
    export_pdf: "PDFレポート",
    export_csv: "CSV出力",
    share: "共有する",
    deep_dive: "詳細分析を表示",
    hide_details: "分析を隠す",
    tradeoff_matrix: "トレードオフマトリックス",
    executive_summary: "エグゼクティブサマリー",
    recommended_option: "推奨構成"
  }
}

interface I18nState {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: keyof typeof translations.en) => string
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
      t: (key) => {
        const { lang } = get()
        return translations[lang][key] || translations.en[key] || key
      }
    }),
    {
      name: 'decision-lens-i18n',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
