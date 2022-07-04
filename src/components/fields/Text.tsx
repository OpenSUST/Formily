/* eslint-disable react/prop-types */
import React from 'react'
import Field from './Field'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

const components: Field<string> = {
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
        maxRows={10}
        variant='standard'
        defaultValue={value}
        onChange={e => (data[keyName] = e.target.value)}
      />
    )
  }
}

export default components
