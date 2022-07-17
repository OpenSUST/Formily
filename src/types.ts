import 'schemastery'

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

export type Kind = 'file' | 'image' | 'csv' | 'liveOffice' | 'number' | 'text' | ''

declare module 'schemastery' {
  interface Meta {
      kind?: Kind;
  }
}
