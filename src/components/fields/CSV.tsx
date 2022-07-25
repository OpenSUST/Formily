/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useRef } from 'react'
import Field from './Field'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import Button from '@mui/material/Button'

registerAllModules()

const components: Field<string> = {
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
        <div style={{ height: 400, width: '100%', marginTop: 8 }}>
          <HotTable
            colHeaders
            rowHeaders
            height='auto'
            readOnly
            ref={hotTableComponent}
            data={useMemo<string[][]>(() => value.replace(/\r/g, '').split('\n').map(it => it.split(',')), [value])}
            language='zh-CN'
            licenseKey='non-commercial-and-evaluation'
          />
        </div>
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
              reader.onload = () => instance.loadData((reader.result as string).replace(/\r/g, '').split('\n').map(it => it.split(',')))
              reader.readAsText(file, 'UTF-8')
            }}
          />
        </Button>
        <div style={{ height: 400, width: '100%', marginTop: 8 }}>
          <HotTable
            colHeaders
            rowHeaders
            contextMenu
            height='auto'
            data={useMemo<string[][]>(() => value.replace(/\r/g, '').split('\n').map(it => it.split(',')), [value])}
            language='zh-CN'
            ref={hotTableComponent}
            licenseKey='non-commercial-and-evaluation'
          />
        </div>
      </div>
    )
  }
}

export default components
