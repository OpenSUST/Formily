/* eslint-disable react/prop-types */
import React from 'react'
import Field from './Field'
import Typography from '@mui/material/Typography'

const components: Field<string> = {
  ViewComponent ({ value }) {
    return (
      <Typography>{value}</Typography>
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
