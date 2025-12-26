"use client"

export function useHaptics() {
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern)
      } catch {
        // Ignore failures
      }
    }
  }

  const light = () => vibrate(10)
  const medium = () => vibrate(20)
  const heavy = () => vibrate([30, 50, 30])
  const error = () => vibrate([10, 80, 10])
  const success = () => vibrate([10, 10, 10])

  return { light, medium, heavy, error, success }
}
