import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: number
  username: string
  terminalId: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  lastLogin: string | null
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (username: string, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      lastLogin: null,
      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      login: (username: string, token: string) => 
        set({ 
          isLoggedIn: true, 
          token,
          user: { 
            id: Math.floor(Math.random() * 1000) + 1,
            username, 
            terminalId: `DL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            role: 'Senior Strategic Analyst' 
          },
          lastLogin: new Date().toISOString()
        }),
      logout: () => set({ user: null, token: null, isLoggedIn: false, lastLogin: null }),
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
