/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react'
import Field, { createSchema } from './Field'
import Schema from 'schemastery'
import DeleteIcon from '@mui/icons-material/Delete'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FileUpload, { FileObject } from 'react-mui-fileuploader'
import { UPLOAD } from '../../api'
import { dataURItoBlob } from '../../utils'
import { useApolloClient } from '@apollo/client'

const components: Field<string[]> = {
  name: '文件',
  schema: createSchema('file', Schema.array(Schema.string())),
  getDefaultValue () { return [] },
  isEmpty (value) { return !value.length },
  ViewComponent ({ value }) {
    return (
      <Box sx={{ whiteSpace: 'nowrap', overflowX: 'auto' }}>
        {value.map((url, i) => {
          const arr = url.split('#')
          return (
            <Button
              key={i}
              variant='outlined'
              startIcon={<AttachFileIcon />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', letterSpacing: 'normal', mr: 1 }}
              href={url}
              target='_blank'
            >
              <Box component='span' sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{arr[arr.length - 1]}</Box>
            </Button>
          )
        })}
      </Box>
    )
  },
  EditorComponent ({ value, keyName, data, onSubmit }) {
    const ref = useRef<FileObject[]>([])
    const [id, update] = useState(0)
    const client = useApolloClient()
    useEffect(() => onSubmit(keyName, () => Promise.all(
      ref.current.map(async it => {
        const { data: { file: { requestUpload: { postURL, formData } } } } =
          await client.query({ query: UPLOAD, variables: { ext: it.name.slice(it.name.lastIndexOf('.') + 1), size: it.size } })
        const body = new FormData()
        for (const k in formData) body.append(k, formData[k])
        body.append('file', dataURItoBlob(it.path))
        await fetch(postURL, { body, method: 'POST' })
        return (postURL.endsWith('/') ? postURL : postURL + '/') + formData.key + '#' + it.name
      })
    ).then(urls => {
      if (!data[keyName] && !urls.length) return
      data[keyName] = (data[keyName] || value).concat(urls)
    }) as any), [])
    return (
      <Box sx={{ whiteSpace: 'nowrap', overflowX: 'auto' }}>
        {(data[keyName] as string[] || value).map((url, i, cur) => {
          const arr = url.split('#')
          return (
            <Button
              key={i}
              variant='outlined'
              startIcon={<DeleteIcon />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', letterSpacing: 'normal', mr: 1 }}
              onClick={() => {
                data[keyName] = cur.filter(it => it !== url)
                update(id + 1)
              }}
            >
              <Box component='span' sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{arr[arr.length - 1]}</Box>
            </Button>
          )
        })}
        <FileUpload
          multiFile
          key={keyName}
          title='上传新文件'
          header='拖拽文件以上传'
          leftLabel='或'
          rightLabel='选择文件'
          buttonLabel='点击这里'
          errorSizeMessage='文件过大'
          buttonRemoveLabel='清除全部'
          maxFileSize={100}
          onFilesChange={list => {
            ref.current = list
            if (!data[keyName] && list.length) data[keyName] = [...value]
            update(id + 1)
          }}
          // eslint-disable-next-line react/jsx-handler-names
          onError={console.log}
          allowedExtensions={[]}
          containerProps={{ style: { display: 'inline-block' } }}
        />
      </Box>
    )
  }
}

export default components
