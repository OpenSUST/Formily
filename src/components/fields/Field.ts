export default interface Field <T> {
  ViewComponent: React.ElementType<{ value: T }>
  EditorComponent: React.ElementType<{ value: T, name: string, keyName: string, data: Record<string, any>, onSubmit: (fn: () => Promise<void>) => void }>
}
