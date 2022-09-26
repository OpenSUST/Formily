/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useRef } from 'react'
import Button from '@mui/material/Button'
import Field, { createSchema } from './Field'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'

registerAllModules()

const components: Field<string> = {
  name: '表格',
  schema: createSchema('csv'),
  getDefaultValue () { return '' },
  isEmpty (value) { return !value.length },
  ViewComponent ({ value, keyName }) {
    const hotTableComponent = useRef<HotTable>(null)
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
        <HotTable
          colHeaders
          rowHeaders
          height={400}
          readOnly
          ref={hotTableComponent}
          style={{ width: '100%', marginTop: 8 }}
          data={useMemo<string[][]>(() => value.replace(/\r/g, '').split('\n').map(it => it.split(',')), [value])}
          language='zh-CN'
          licenseKey='non-commercial-and-evaluation'
        />
      </div>
    )
  },
  EditorComponent ({ value, onSubmit, keyName, data }) {
    const hotTableComponent = useRef<HotTable>(null)
    useEffect(() => {
      onSubmit(keyName, old => {
        const instance = hotTableComponent.current?.__hotInstance
        if (!instance) return
        const newData = instance.getPlugin('exportFile').exportAsString('csv', {
          bom: false,
          columnDelimiter: ',',
          exportHiddenColumns: true,
          exportHiddenRows: true,
          rowDelimiter: '\r\n'
        })
        if (newData !== old) data[keyName] = newData
      })
    }, [])
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
        </Button>
        <HotTable
          colHeaders
          rowHeaders
          contextMenu
          height={400}
          data={useMemo<string[][]>(() => value.replace(/\r/g, '').split('\n').map(it => it.split(',')), [value])}
          language='zh-CN'
          ref={hotTableComponent}
          style={{ width: '100%', marginTop: 8 }}
          licenseKey='non-commercial-and-evaluation'
        />
      </div>
    )
  }
}

export default components
