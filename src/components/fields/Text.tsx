/* eslint-disable react/prop-types */
import React from 'react'
import Field, { createSchema } from './Field'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

const components: Field<string> = {
  name: '文本',
  schema: createSchema(),
  getDefaultValue () { return '' },
  isEmpty (value) { return !value },
  ViewComponent ({ value }) {
    return (
      <Typography>{typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : Object.prototype.toString.call(value)}</Typography>
    )
  },
  EditorComponent ({ name, value, keyName, data }) {
    return (
      <TextField
        multiline
        fullWidth
        label={name}
        maxRows={10}
        variant='standard'
        defaultValue={value}
        onChange={e => (data[keyName] = e.target.value)}
      />
    )
  }
}

export default components
