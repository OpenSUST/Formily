/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import Schema from 'schemastery'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import Field, { createSchema } from './Field'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'

registerAllModules()

const components: Field<string[]> = {
  name: '多表格',
  schema: createSchema('multiCSV', Schema.array(Schema.string())),
  getDefaultValue () { return [] },
  isEmpty (value) { return !value.length },
  ViewComponent ({ value, keyName }) {
    if (!value.length) value.push('')
    const [index, setIndex] = useState(0)
    const hotTableComponent = useRef<HotTable>(null)
    useEffect(() => {
      hotTableComponent.current?.__hotInstance?.loadData(value![index].replace(/\r/g, '').split('\n').map(it => it.split(',')))
    }, [index])
    return (
      <div style={{ width: '100%' }}>
        <Button
          variant='contained'
          onClick={() => hotTableComponent.current?.__hotInstance?.getPlugin('exportFile').downloadFile('csv', {
            bom: false,
            columnDelimiter: ',',
            exportHiddenColumns: true,
            exportHiddenRows: true,
            rowDelimiter: '\r\n',
            fileExtension: 'csv',
            filename: keyName + '_[YYYY]-[MM]-[DD]',
            mimeType: 'text/csv'
          })}
        >
          导出文件
        </Button>
        <div style={{ maxHeight: 400, width: '100%', marginTop: 8 }}>
          <HotTable
            colHeaders
            rowHeaders
            height='auto'
            readOnly
            ref={hotTableComponent}
            language='zh-CN'
            licenseKey='non-commercial-and-evaluation'
          />
        </div>
        <Pagination
          page={index + 1}
          count={value.length}
          onChange={(_, page) => setIndex(page - 1)}
        />
      </div>
    )
  },
  EditorComponent ({ value, onSubmit, keyName, data }) {
    if (!value.length) value.push('')
    const [index, setIndex] = useState(0)
    const indexRef = useRef(0)
    const [newData, setNewData] = useState<string[]>(() => [...value])
    const hotTableComponent = useRef<HotTable>(null)
    const newDataRef = useRef<string[]>()
    newDataRef.current = newData
    useEffect(() => {
      newDataRef.current = [...value]
      onSubmit(keyName, old => {
        const instance = hotTableComponent.current?.__hotInstance
        if (!instance) return
        newDataRef.current![indexRef.current] = instance.getPlugin('exportFile').exportAsString('csv', {
          bom: false,
          columnDelimiter: ',',
          exportHiddenColumns: true,
          exportHiddenRows: true,
          rowDelimiter: '\r\n'
        })
        if (newDataRef.current!.length !== old.length || newDataRef.current!.some((it, i) => it !== old[i])) data[keyName] = newDataRef.current
      })
    }, [])
    useEffect(() => {
      indexRef.current = index
      hotTableComponent.current?.__hotInstance?.loadData(newDataRef.current![index].replace(/\r/g, '').split('\n').map(it => it.split(',')))
    }, [index])
    return (
      <div style={{ width: '100%' }}>
        <Button
          variant='contained'
          onClick={() => hotTableComponent.current?.__hotInstance?.getPlugin('exportFile').downloadFile('csv', {
            bom: false,
            columnDelimiter: ',',
            exportHiddenColumns: true,
            exportHiddenRows: true,
            rowDelimiter: '\r\n',
            fileExtension: 'csv',
            filename: keyName + '_[YYYY]-[MM]-[DD]',
            mimeType: 'text/csv'
          })}
        >
          导出文件
        </Button>&nbsp;
        <Button variant='contained' component='label'>
          导入文件
          <input
            hidden
            accept='text/csv'
            type='file'
            onChange={e => {
              const file = e.target.files?.[0]
              const instance = hotTableComponent.current?.__hotInstance
              if (!file || !instance) return
              const reader = new FileReader()
              reader.onload = async () => {
                let text: string
                try {
                  text = new window.TextDecoder('gbk').decode(reader.result as ArrayBuffer)
                } catch {
                  text = await new Blob([reader.result as ArrayBuffer], { type: 'text/plain; charset=utf-8' }).text()
                }
                instance.loadData(text.replace(/\r/g, '').split('\n').map(it => it.split(',')))
              }
              reader.readAsArrayBuffer(file)
            }}
          />
        </Button>&nbsp;
        <Button
          variant='contained'
          onClick={() => {
            setNewData([...newData, ''])
            setIndex(newData.length)
          }}
        >
          添加表格
        </Button>&nbsp;
        <Button
          disabled={!index}
          variant='contained'
          onClick={() => {
            setNewData(newData.filter((_, id) => id !== index))
            setIndex(0)
          }}
        >
          删除表格
        </Button>
        <div style={{ height: 400, width: '100%', marginTop: 8 }}>
          <HotTable
            colHeaders
            rowHeaders
            contextMenu
            height='auto'
            language='zh-CN'
            ref={hotTableComponent}
            licenseKey='non-commercial-and-evaluation'
          />
        </div>
        <Pagination
          page={index + 1}
          count={newData.length}
          onChange={(_, page) => {
            setIndex(indexRef.current = page - 1)
            const instance = hotTableComponent.current?.__hotInstance
            if (instance) {
              const newData0 = instance.getPlugin('exportFile').exportAsString('csv', {
                bom: false,
                columnDelimiter: ',',
                exportHiddenColumns: true,
                exportHiddenRows: true,
                rowDelimiter: '\r\n'
              })
              if (newData0 === newData[index]) return
              const arr = [...newData]
              arr[index] = newData0
              setNewData(arr)
            }
          }}
        />
      </div>
    )
  }
}

export default components
