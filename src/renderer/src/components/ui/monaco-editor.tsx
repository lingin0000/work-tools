import Editor from '@monaco-editor/react'
import { useTheme } from '../provider/theme-provider'

function MonacoEditor(props: React.ComponentProps<typeof Editor>) {
  const { theme } = useTheme()
  return <Editor height="90vh" {...props} theme={theme === 'dark' ? 'vs-dark' : 'vs-light'} />
}

export { MonacoEditor }
