import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: number
  username: string
  terminalId: string
  role: string
  org_id?: number
  org_name?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  lastLogin: string | null
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (username: string, token: string, org_id?: number, org_name?: string) => void
  logout: () => void
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      lastLogin: null,
      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      login: (username, token, org_id, org_name) => 
        set({ 
          isLoggedIn: true, 
          token,
          user: { 
            id: Math.floor(Math.random() * 1000) + 1,
            username, 
            terminalId: `DL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            role: 'Senior Strategic Analyst',
            org_id,
            org_name
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
  ) as StateCreator<AuthState>
) as UseBoundStore<StoreApi<AuthState>>
