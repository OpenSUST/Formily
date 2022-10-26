import Schema from 'schemastery'

export interface ItemType {
  description: string
  images: string[]
  title: string
  _id: string
}

export interface FavoriteType {
  title: string
  image: string
  description: string
}

export interface FieldType {
  localization: any
  schema: Schema
  __typename: string
  _id: string
}

export interface TemplateType {
  _id: string
  name: string
  payload: string
}

export interface TemplateData {
  key: string
  default?: any
}

export type Kind = 'file' | 'image' | 'csv' | 'multiCSV' | 'liveOffice' | 'number' | 'text' | 'title'

declare module 'schemastery' {
  interface Meta {
    kind?: Kind
    extraData?: string
  }
}
