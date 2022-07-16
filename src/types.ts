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

type Kind = 'file' | 'image' | 'csv' | 'office' | 'number';
declare module 'schemastery' {
    interface Meta {
        kind?: Kind;
    }
}
