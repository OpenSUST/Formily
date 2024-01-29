/* eslint-disable react/prop-types */
import React, { useRef, useEffect, useState } from 'react'
import Field, { createSchema } from './Field'
// @ts-ignore
import Preview from 'preview-office-docs'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { UPLOAD } from '../../api'
import { useApolloClient } from '@apollo/client'

const components: Field<string> = {
  name: '文档',
  schema: createSchema('liveOffice'),
  getDefaultValue () { return '' },
  isEmpty (value) { return !value.length },
  ViewComponent ({ value }) {
    return value
      ? (
        <Box sx={{ '& iframe': { border: '1px solid #e0e0e0', borderRadius: '4px' } }}>
          <Box sx={{ mb: 1 }}>
            <Button variant='contained' href={value} target='_blank'>下载文件</Button>
          </Box>
          <Preview url={value} height='500px' width='100%' />
        </Box>)
      : <>请先上传文档</>
  },
  EditorComponent ({ onSubmit, data, keyName, value }) {
    const ref = useRef<File>()
    const [file, setFile] = useState<File>()
    const client = useApolloClient()
    useEffect(() => onSubmit(keyName, async () => {
      const it = ref.current
      if (!it) return
      const { data: { file: { requestUpload: { postURL, formData } } } } =
        await client.query({ query: UPLOAD, variables: { ext: it.name.slice(it.name.lastIndexOf('.') + 1), size: it.size } })
      const body = new FormData()
      for (const k in formData) body.append(k, formData[k])
      body.append('file', it)
      await fetch(postURL, { body, method: 'POST' })
      data[keyName] = (postURL.endsWith('/') ? postURL : postURL + '/') + formData.key + '#' + it.name
    }), [])
    return (
      <>
        {file ? file.name + ' ' : value && value.slice(value.lastIndexOf('#') + 1) + ' '}
        <Button variant='contained' component='label'>
          上传文件
          <input
            hidden
            accept='.doc, .docx, .ppt, .pptx, .xls, .xlsx, .ppts'
            type='file'
            onChange={e => setFile(ref.current = e.target.files?.[0])}
          />
        </Button>
      </>
    )
  }
}

export default components
