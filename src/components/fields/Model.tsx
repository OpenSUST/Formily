/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState, useMemo, Suspense, useLayoutEffect } from 'react'
import Field, { createSchema } from './Field'
import FileUpload, { FileObject } from 'react-mui-fileuploader'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { UPLOAD } from '../../api'
import { useApolloClient } from '@apollo/client'
import { loadAsync } from 'jszip'
import { Loader, FileLoader, Mesh, DoubleSide } from 'three'
import { dataURItoBlob } from '../../utils'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Canvas, useLoader } from '@react-three/fiber'
import { useErrorBoundary } from 'use-error-boundary'
import { OrthographicCamera, OrbitControls, Bounds } from '@react-three/drei'

class ZipLoader extends Loader {
  load (url: string, onLoad?: (response: Record<string, Blob>) => void, onProgress?: (request: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)
    loader.load(url, buffer => {
      const files: Record<string, Blob> = {}
      const promise = loadAsync(buffer as ArrayBuffer).then(zip => Promise.all(Object.entries(zip.files)
        .filter(([, value]) => !value.dir)
        .map(([key, value]) => value.async('blob').then(data => (files[key] = data)))
      ))
      if (onLoad) promise.then(() => onLoad(files))
      promise.catch(onError)
    }, onProgress, onError)
  }
}

const Viewer: React.FC<{ files: Record<string, Blob>, model: string, material: string }> = ({ files, model, material }) => {
  const objectURLs = useMemo(() => [], [files, model, material])
  const materials = useLoader(MTLLoader, material, loader => loader.manager.setURLModifier(url => {
    url = url.replace(/^.*[\\/]/, '')
    if (!files[url]) {
      console.error(new Error('No such file: ' + url))
      return url
    }
    return URL.createObjectURL(files[url])
  }))
  const object = useLoader(OBJLoader, model, loader => {
    loader.manager.setURLModifier(url => {
      url = url.replace(/^.*[\\/]/, '')
      if (!files[url]) {
        console.error(new Error('No such file: ' + url))
        return url
      }
      return URL.createObjectURL(files[url])
    })
    materials.side = DoubleSide
    materials.preload()
    loader.setMaterials(materials)
  })

  useEffect(() => {
    objectURLs.forEach(url => URL.revokeObjectURL(url))
    objectURLs.length = 0
  }, [files, model, material])

  useLayoutEffect(() => {
    object.scale.set(10, 10, 10)
    object.traverse(child_ => {
      const child = child_ as Mesh
      if (child.isMesh) child.geometry.center()
    })
  }, [object])

  return (
    <Canvas style={{ height: 240 }}>
      <Bounds fit clip observe>
        <ambientLight />
        <pointLight position={[800, 800, 0]} />
        <OrthographicCamera makeDefault zoom={1000} position={[300, 200, 300]} />
        <Suspense fallback={null}>
          <primitive object={object} />
        </Suspense>
        <OrbitControls makeDefault enablePan={false} enableZoom enableRotate maxZoom={1} minZoom={0.1} enabled enableDamping />
      </Bounds>
    </Canvas>
  )
}

const ViewerLoader: React.FC<{ value: string }> = ({ value }) => {
  const files = useLoader(ZipLoader, value)
  if (files) {
    let model = ''
    let material = ''
    for (const key in files) {
      if (key.endsWith('.obj')) model = key
      else if (key.endsWith('.mtl')) material = key
    }
    if (model && material) return <Viewer files={files} model={model} material={material} />
  }
  return null
}

function ErrorBoundary ({ children, fallback, name }: any) {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary()
  return didCatch ? fallback(error) : <ErrorBoundary key={name}>{children}</ErrorBoundary>
}

const components: Field<string> = {
  name: '模型',
  schema: createSchema('model'),
  getDefaultValue () { return '' },
  isEmpty (value) { return !value },
  ViewComponent: ({ value }) => value ? <ErrorBoundary fallback={(e: any) => <>{e.toString()}</>}><ViewerLoader value={value} /></ErrorBoundary> : null,
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
      data[keyName] = (postURL.endsWith('/') ? postURL : postURL + '/') + formData.key + '#' + ref.current.name
    }), [])

    const arr = (value || '').split('#')

    return (
      // @ts-ignore
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
          allowedExtensions={['zip', 'x-zip-compressed', 'application/x-zip-compressed', 'application/zip']}
          containerProps={{ style: { display: 'inline-block' } }}
          // eslint-disable-next-line react/jsx-handler-names
          onError={console.log}
        />
      </Box>
    )
  }
}

export default components
