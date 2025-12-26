
export const translations = {
  en: {
    nav: {
      engine: "Engine",
      simulations: "Simulations",
      audit: "Audit Log",
      settings: "Settings"
    },
    hero: {
      title: "Initialize Intelligence",
      subtitle: "Configure your decision parameters for the high-performance engine."
    },
    actions: {
      analyze: "Analyze",
      reset: "Reset to Home",
      export: "Export PDF",
      modify: "Modify Parameters"
    }
  },
  es: {
    nav: {
      engine: "Motor",
      simulations: "Simulaciones",
      audit: "Auditoría",
      settings: "Ajustes"
    },
    hero: {
      title: "Inicializar Inteligencia",
      subtitle: "Configure sus parámetros de decisión para el motor de alto rendimiento."
    },
    actions: {
      analyze: "Analizar",
      reset: "Volver al Inicio",
      export: "Exportar PDF",
      modify: "Modificar Parámetros"
    }
  },
  jp: {
    nav: {
      engine: "エンジン",
      simulations: "シミュレーション",
      audit: "監査ログ",
      settings: "設定"
    },
    hero: {
      title: "インテリジェンスの初期化",
      subtitle: "高性能エンジンのための決定パラメータを構成します。"
    },
    actions: {
      analyze: "分析する",
      reset: "ホームに戻る",
      export: "PDFエクスポート",
      modify: "パラメータ変更"
    }
  }
}

export type Language = keyof typeof translations;

export const useTranslation = (lang: Language) => {
  return translations[lang] || translations.en;
}
