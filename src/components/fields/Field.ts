export default interface Field <T> {
  ViewComponent: React.ElementType<{ value: T }>
  EditorComponent: React.ElementType<{ value: T }>
}
