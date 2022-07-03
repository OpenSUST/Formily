/* eslint-disable react/prop-types */
import React from 'react'
import Field from './Field'
// @ts-ignore
import Preview from 'preview-office-docs'
import Box from '@mui/material/Box'

const components: Field<string[]> = {
  ViewComponent ({ value }) {
    return (
      <Box sx={{ '& iframe': { border: '1px solid #e0e0e0', borderRadius: '4px' } }}>
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
