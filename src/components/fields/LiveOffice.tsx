/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from 'react'
import Field from './Field'
// @ts-ignore
import Preview from 'preview-office-docs'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { UPLOAD } from '../../api'
import { useApolloClient } from '@apollo/client'

const components: Field<string> = {
  ViewComponent ({ value }) {
    return value
      ? (
        <Box sx={{ '& iframe': { border: '1px solid #e0e0e0', borderRadius: '4px' } }}>
          <Box sx={{ mb: 1 }}>
            <Button variant='contained' href={value} target='_blank'>下载文件</Button>
          </Box>
          <Preview url={[value]} height='500px' width='100%' />
        </Box>)
      : <>请先上传文档</>
  },
  EditorComponent ({ onSubmit, data, keyName }) {
    const ref = useRef<File>()
    const client = useApolloClient()
    useEffect(() => onSubmit(keyName, async () => {
      const it = ref.current
      if (!it) return
      const { data: { file: { requestUpload: { postURL, formData } } } } =
        await client.query({ query: UPLOAD, variables: { ext: it.name.slice(it.name.lastIndexOf('.')), size: it.size } })
      const body = new FormData()
      for (const k in formData) body.append(k, formData[k])
      body.append('file', it)
      await fetch(postURL, { body, method: 'POST' })
      data[keyName] = postURL + formData.key + '#' + it.name
    }), [])
    return (
      <Button variant='contained' component='label'>
        上传文件
        <input
          hidden
          accept='application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint'
          type='file'
          onChange={e => (ref.current = e.target.files?.[0])}
        />
      </Button>
    )
  }
}

export default components
