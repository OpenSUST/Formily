/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react'
import Field from './Field'
import Zoom from 'react-medium-image-zoom'
import ClearIcon from '@mui/icons-material/Clear'
import Box from '@mui/material/Box'
import FileUpload, { FileObject } from '../FileUploader'
import { UPLOAD } from '../../api'
import { useApolloClient } from '@apollo/client'

function dataURItoBlob (dataURI: string) {
  const byteString = atob(dataURI.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: dataURI.split(',')[0].split(':')[1].split(';')[0] })
}

const components: Field<string[]> = {
  ViewComponent ({ value }) {
    return (
      <Box sx={{ whiteSpace: 'nowrap', overflowX: 'auto', '& div': { mr: 1 } }}>
        {value.map((url, i) => (<Zoom key={i}><img src={url} height={140} /></Zoom>))}
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
        return postURL + formData.key
      })
    ).then(urls => {
      if (!data[keyName] && !urls.length) return
      data[keyName] = (data[keyName] || value).concat(urls)
    }) as any), [])
    return (
      <Box sx={{ whiteSpace: 'nowrap', overflowX: 'auto' }}>
        {(data[keyName] as string[] || value).map((url, i, cur) => (
          <Box key={i} sx={{ mr: 1, position: 'relative', display: 'inline-block' }}>
            <img src={url} height={140} />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                opacity: 0,
                transition: '.15s',
                cursor: 'pointer',
                '&:hover': { opacity: 1 }
              }}
              onClick={() => {
                data[keyName] = cur.filter(it => it !== url)
                update(id + 1)
              }}
            >
              <ClearIcon />
            </Box>
          </Box>))}
        <FileUpload
          multiFile
          title='上传新文件'
          header='拖拽文件以上传'
          leftLabel='或'
          rightLabel='选择文件'
          buttonLabel='点击这里'
          errorSizeMessage='文件过大'
          buttonRemoveLabel='清除全部'
          maxFileSize={10}
          // eslint-disable-next-line react/jsx-handler-names
          onError={console.error}
          allowedExtensions={['jpg', 'jpeg', 'png', 'gif', 'webp']}
          onFilesChange={list => {
            ref.current = list
            if (!data[keyName] && list.length) data[keyName] = [...value]
            update(id + 1)
          }}
          containerProps={{ style: { display: 'inline-block' } }}
        />
      </Box>
    )
  }
}

export default components
