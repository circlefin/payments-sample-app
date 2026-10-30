/** Copies text and reports "copied" for two seconds, for a button label. */
export function useCopy() {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch {
      // Clipboard can be blocked. The address stays visible to copy by hand.
      copied.value = false
    }
  }

  return { copied, copy }
}
