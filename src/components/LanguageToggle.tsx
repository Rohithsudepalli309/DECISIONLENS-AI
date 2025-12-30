"use client"

import React from "react"
import { useI18n } from "@/hooks/useI18n"

type Language = "en" | "es" | "jp"

export function LanguageToggle() {
  const { lang, setLang } = useI18n()
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleLang = (l: Language) => {
    setLang(l)
    setIsOpen(false)
  }

  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "es", label: "ES", name: "Español" },
    { code: "jp", label: "JP", name: "日本語" },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group relative overflow-hidden"
        aria-label="Change Language"
      >
        <div className="relative z-10 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-white transition-colors">{lang.toUpperCase()}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 glass-card !p-1 bg-black/90 z-50 animate-in fade-in zoom-in-95 duration-200">
            {languages.map((l) => (
                <button
                    key={l.code}
                    onClick={() => toggleLang(l.code as Language)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-colors ${lang === l.code ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                >
                    <span>{l.name}</span>
                    {lang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
            ))}
        </div>
      )}
    </div>
  )
}
