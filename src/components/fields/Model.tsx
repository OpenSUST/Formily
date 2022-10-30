/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react'
import Field, { createSchema } from './Field'
import FileUpload, { FileObject } from '../FileUploader'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { UPLOAD } from '../../api'
import { useApolloClient } from '@apollo/client'
import { loadAsync } from 'jszip'
import { Loader } from 'three'
import { dataURItoBlob } from '../../utils'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Canvas, useLoader } from '@react-three/fiber'

class ZipLoader extends Loader {
  load (url: string, onLoad?: (response: Record<string, ArrayBuffer>) => void, _?: (request: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) {
    const files: Record<string, ArrayBuffer> = {}
    const promise = loadAsync(url).then(zip => Promise.all(Object.entries(zip.files)
      .filter(([, value]) => !value.dir)
      .map(([key, value]) => value.async('arraybuffer').then(data => (files[key] = data)))
    ))
    if (onLoad) promise.then(() => onLoad(files))
    promise.catch(onError)
  }
}

const Viewer: React.FC<{ value: string }> = ({ value }) => {
  console.log(value, useLoader(ZipLoader, value))
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[800, 800, 0]} />
    </Canvas>
  )
}

const components: Field<string> = {
  name: '模型',
  schema: createSchema('model'),
  getDefaultValue () { return '' },
  isEmpty (value) { return !value },
  ViewComponent: ({ value }) => value ? <Viewer value={value} /> : null,
  EditorComponent ({ value, keyName, data, onSubmit }) {
    const client = useApolloClient()
    const ref = useRef<FileObject>()
    const [cleared, setCleared] = useState(false)

    useEffect(() => onSubmit(keyName, async () => {
      if (!ref.current) return
      const { data: { file: { requestUpload: { postURL, formData } } } } =
          await client.query({ query: UPLOAD, variables: { ext: ref.current.name.slice(ref.current.name.lastIndexOf('.') + 1), size: ref.current.size } })
      const body = new FormData()
      for (const k in formData) body.append(k, formData[k])
      body.append('file', dataURItoBlob(ref.current.path))
      await fetch(postURL, { body, method: 'POST' })
      data[keyName] = postURL + formData.key + '#' + ref.current.name
    }), [])

    const arr = (value || '').split('#')

    return (
      <Box sx={{ whiteSpace: 'nowrap', overflowX: 'auto' }}>
        {value && !cleared && (
          <Button
            variant='outlined'
            startIcon={<DeleteIcon />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none', letterSpacing: 'normal', mr: 1 }}
            onClick={() => {
              setCleared(true)
              data[keyName] = ''
            }}
          >
            <Box component='span' sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{arr[arr.length - 1]}</Box>
          </Button>
        )}
        <FileUpload
          key={keyName}
          title='上传新文件'
          header='拖拽文件以上传'
          leftLabel='或'
          rightLabel='选择文件'
          buttonLabel='点击这里'
          errorSizeMessage='文件过大'
          buttonRemoveLabel='清除全部'
          maxFileSize={100}
          onFilesChange={list => (ref.current = list[0])}
          allowedExtensions={['zip']}
          containerProps={{ style: { display: 'inline-block' } }}
        />
      </Box>
    )
  }
}

export default components
