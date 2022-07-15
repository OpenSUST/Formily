import text from './Text'
import number from './Number'
import image from './Image'
import liveOffice from './LiveOffice'
import csv from './CSV'

export default { text, number, image, liveOffice, csv }
export const typeNameMap = {
  text: '文本',
  number: '数字',
  image: '图片',
  csv: '表格'
}
