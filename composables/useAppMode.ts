/**
 * Whether the app is running against Circle's test environment or live
 * (real money). The server decides, from the key it was given, and the screens
 * ask once. Until the answer arrives, `loaded` is false and screens say nothing
 * about the mode rather than guess.
 */
export function useAppMode() {
  const mode = useState<{ loaded: boolean; live: boolean }>(
    'fm-app-mode',
    () => ({ loaded: false, live: false }),
  )

  async function loadMode(): Promise<void> {
    if (mode.value.loaded || !import.meta.client) {
      return
    }
    try {
      const result = await $fetch<any>('/api/mode')
      mode.value = { loaded: true, live: Boolean(result && result.live) }
    } catch {
      // Leave it unknown. The screens simply show no mode label.
    }
  }

  return { mode, loadMode }
}
