import Schema, { Meta } from 'schemastery'

export default interface Field <T> {
  name: string
  schema: Schema
  getDefaultValue (): T
  isEmpty (value: T): boolean
  hasExtraData?: boolean
  ViewComponent: React.ElementType<{ value: T, keyName: string, meta: Meta }>
  EditorComponent: React.ElementType<{
    value: T
    name: string
    keyName: string
    data: Record<string, any>
    onSubmit: (key: string, fn: (old: T) => Promise<void> | void) => void
  }>
}

export const createSchema = (type?: string, schema: Schema = Schema.string()) => {
  schema.meta ||= {}
  if (type) schema.meta.kind = type as any
  return schema
}
