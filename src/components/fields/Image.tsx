/* eslint-disable react/prop-types */
import React from 'react'
import Field from './Field'
import Zoom from 'react-medium-image-zoom'
import Box from '@mui/material/Box'

const components: Field<string[]> = {
  ViewComponent ({ value }) {
    return (
      <Box sx={{ whiteSpace: 'nowrap', overflowX: 'auto', '& div': { mr: 1 } }}>
        {value.map((url, i) => (<Zoom key={i}><img src={url} height={140} /></Zoom>))}
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
