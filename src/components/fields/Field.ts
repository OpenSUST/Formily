export default interface Field <T> {
  ViewComponent: React.ElementType<{ value: T, keyName: string }>
  EditorComponent: React.ElementType<{
    value: T
    name: string
    keyName: string
    data: Record<string, any>
    onSubmit: (key: string, fn: (old: T) => Promise<void> | void) => void
  }>
}
