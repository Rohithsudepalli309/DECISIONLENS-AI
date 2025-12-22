import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  email: string
  terminalId: string
  role: string
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  lastLogin: string | null
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      lastLogin: null,
      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      login: (email: string) => 
        set({ 
          isLoggedIn: true, 
          user: { 
            email, 
            terminalId: `DL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            role: 'Senior Strategic Analyst' 
          },
          lastLogin: new Date().toISOString()
        }),
      logout: () => set({ user: null, isLoggedIn: false, lastLogin: null }),
    }),
    {
      name: 'decision-lens-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true)
      }
    }
  )
)
