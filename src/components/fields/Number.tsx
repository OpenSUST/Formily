/* eslint-disable react/prop-types */
import React from 'react'
import Schema from 'schemastery'
import Field, { createSchema } from './Field'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

const components: Field<number> = {
  name: '数字',
  schema: createSchema('number', Schema.number()),
  getDefaultValue () { return 0 },
  isEmpty (value) { return !value },
  ViewComponent ({ value }) {
    return (
      <Typography>{value}</Typography>
    )
  },
  EditorComponent ({ name, value, keyName, data }) {
    return (
      <TextField
        multiline
        fullWidth
        label={name}
        type='number'
        variant='standard'
        defaultValue={value}
        onChange={e => (data[keyName] = +e.target.value)}
      />
    )
  }
}

export default components
