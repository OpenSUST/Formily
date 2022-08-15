import Field from './Field'
import text from './Text'
import number from './Number'
import image from './Image'
import liveOffice from './LiveOffice'
import csv from './CSV'
import multiCSV from './MultiCSV'
import file from './File'
import title from './Title'

const obj = { text, number, image, liveOffice, csv, multiCSV, file, title }
export default obj as typeof obj & { [key: string]: Field<any> }
