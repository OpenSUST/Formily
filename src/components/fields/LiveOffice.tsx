/* eslint-disable react/prop-types */
import React from 'react'
import Field from './Field'
// @ts-ignore
import Preview from 'preview-office-docs'
import Box from '@mui/material/Box'

const components: Field<string[]> = {
  ViewComponent ({ value }) {
    return (
      <Box>
        <Preview url={value} height='500px' width='100%' />
      </Box>
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
