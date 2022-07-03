/* eslint-disable react/prop-types */
import React from 'react'
import Field from './Field'
import { DataGrid } from '@mui/x-data-grid'

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
  EditorComponent () {
    return (
      <>
      </>
    )
  }
}

export default components
