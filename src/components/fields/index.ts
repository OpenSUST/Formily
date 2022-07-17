import text from './Text'
import number from './Number'
import image from './Image'
import liveOffice from './LiveOffice'
import csv from './CSV'
import { Kind } from '../../types'

export default { text, number, image, liveOffice, csv }
export const typeNameMap: Record<Kind, string> = {
  '': '文本',
  text: '文本',
  number: '数字',
  image: '图片',
  csv: '表格',
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
  liveOffice: () => ''
}
