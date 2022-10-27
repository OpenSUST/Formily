import Field from './Field'
import text from './Text'
import number from './Number'
import image from './Image'
import liveOffice from './LiveOffice'
import chart from './Chart'
import multiCharts from './MultiCharts'
import csv from './CSV'
import multiCSV from './MultiCSV'
import file from './File'
import title from './Title'

const obj = { text, number, image, liveOffice, csv, multiCSV, file, title, chart, multiCharts }
export default obj as typeof obj & { [key: string]: Field<any> }
