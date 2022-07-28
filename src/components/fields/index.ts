import Schema from 'schemastery'
import text from './Text'
import number from './Number'
import image from './Image'
import liveOffice from './LiveOffice'
import csv from './CSV'
import multiCSV from './MultiCSV'
import file from './File'
import { Kind } from '../../types'

export default { text, number, image, liveOffice, csv, multiCSV, file }
export const typeNameMap: Record<Kind, string> = {
  '': '文本',
  text: '文本',
  number: '数字',
  image: '图片',
  csv: '表格',
  multiCSV: '多表格',
  file: '文件',
  liveOffice: '文档'
}
export const defaultValues: Record<Kind, () => any> = {
  '': () => '',
  text: () => '',
  number: () => 0,
  image: () => [],
  csv: () => '',
  file: () => [],
  multiCSV: () => [],
  liveOffice: () => ''
}

const createSchema = (type?: string, schema: Schema = Schema.string()) => {
  schema.meta ||= {}
  if (type) schema.meta.kind = type as any
  return schema
}

export const defaultSchemas: Record<Kind, Schema> = {
  '': createSchema(),
  text: createSchema(),
  number: createSchema('number', Schema.number()),
  image: createSchema('image', Schema.array(Schema.string())),
  csv: createSchema('csv'),
  multiCSV: createSchema('multiCSV', Schema.array(Schema.string())),
  file: createSchema('file', Schema.array(Schema.string())),
  liveOffice: createSchema('liveOffice')
}
