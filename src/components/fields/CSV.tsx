/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import Field from './Field'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import {
  DataGrid,
  GridToolbarContainer,
  GridColumns
} from '@mui/x-data-grid'

const Toolbar: React.FC<{ addData: () => void }> = ({ addData }) => {
  return (
    <GridToolbarContainer>
      <Button color='primary' startIcon={<AddIcon />} onClick={addData}>添加记录</Button>
    </GridToolbarContainer>
  )
}

const components: Field<string> = {
  ViewComponent ({ value }) {
    const data = value.split('\n')
    return (
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          columns={data[0].split(',').map((headerName, field) => ({ field: field.toString(), headerName, width: 26 * headerName.length + 40 })) as any}
          rows={data.slice(1).map((it, id) => {
            const obj: any = { id }
            it.split(',').map((val, field) => (obj[field] = val))
            return obj
          })}
        />
      </div>
    )
  },
  EditorComponent ({ value }) {
    const [columns, setColumns] = useState<GridColumns<string[]>>([])
    const [rows, setRows] = useState<any[]>([])
    useEffect(() => {
      const data = value.split('\n')
      setColumns(data[0].split(',').map((headerName, field) => ({ field: field.toString(), headerName, width: 26 * headerName.length + 40 })))
      setRows(data.slice(1).map((it, id) => {
        const obj: any = { id }
        it.split(',').map((val, field) => (obj[field] = val))
        return obj
      }))
    }, [value])
    return (
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          components={{ Toolbar }}
          componentsProps={{ toolbar: { addData () { setRows([...rows, {}]) } } }}
          experimentalFeatures={{ newEditingApi: true }}
          columns={columns}
          rows={rows}
        />
      </div>
    )
  }
}

export default components
