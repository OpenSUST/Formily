import React, { useCallback, useMemo, useRef, useState } from 'react'
import Schema from 'schemastery'

import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Fab from '@mui/material/Fab'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import fields from './fields'
import Field from './fields/Field'
import { compareTitle, normalizeTitle } from '../utils'
import { CircularLoading } from './Loading'
import { TemplateData, FieldType, TemplateType } from '../types'
import {
  GET_DATA, ADD_DATA, UPDATE_DATA, skipFieldsList, ADD_TEMPLATE, GET_KEYS_DATA, LIST_KEYS,
  LIST_TEMPLATES, GET_TEMPLATE, GET_TEMPLATE_DATA, defaultFieldsName
} from '../api'

import { useQuery, useApolloClient } from '@apollo/client'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

type AsyncFunction = (old: any) => Promise<void> | void

const ItemCard: React.FC = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id?: string }>()
  const [submitting, setSubmitting] = useState(false)
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [importTemplateOpen, setImportTemplateOpen] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [options, setOptions] = useState<readonly FieldType[]>([])
  const [templates, setTemplates] = useState<readonly TemplateType[]>([])
  const [fieldsData, setFieldsData] = useState<FieldType[]>([])
  const [newData, setNewData] = useState<any>({ })
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)

  const formData = useRef<Record<string, any>>({})
  const pendingList = useRef<Record<string, AsyncFunction>>({})
  const onSubmit = useCallback((key: string, fn: AsyncFunction) => { pendingList.current[key] = fn }, [])

  const { loading, error, data } = id
    ? useQuery(GET_DATA, { variables: { id } })
    : useQuery(GET_TEMPLATE_DATA, { variables: { id: '000000000000000000000' } })

  const [schema, others] = useMemo(() => {
    if (!data) return []
    let others: any, schema: Schema
    const localization: Record<string, any> = {}
    if (id) {
      const rows = data.item.get
      let _id
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ;[{ _id, ...others }] = rows.items
      schema = new Schema(rows.schema)
      data.key.get.forEach((it: any) => (localization[it._id] = it.localization))
    } else {
      const rows = data.template.get.keys
      schema = Schema.object(Object.fromEntries(rows.map((row: any) => [row._id, new Schema(JSON.parse(row.schema))])))
      others = { }
      ;(rows as FieldType[]).forEach(it => {
        if (it._id === '_id') return
        others[it._id] = fields[(schema as any).dict[it._id]?.meta?.kind || 'text'].getDefaultValue()
        localization[it._id] = it.localization
      })
      Object.assign(formData.current, others)
    }
    const arr: FieldType[] = []
    for (const key in others) {
      if (skipFieldsList[key]) continue
      arr.push({ _id: key, schema: (schema as any).dict[key], localization: localization[key] || {}, __typename: 'Key' }) // TODO: i18n
    }
    setNewData(others)
    setFieldsData(arr)
    return [schema, others]
  }, [data])

  if (error) throw error
  if (loading) return <CircularLoading loading />

  const dumpState = () => JSON.stringify([])
  const loadState = async (templateData: any) => {
    const templateDataObj: any = {}
    const ids: string[] = []
    if (typeof templateData === 'string') templateData = JSON.parse(templateData || '[]')
    if (!Array.isArray(templateData)) templateData = []
    ;(templateData as TemplateData[]).forEach(it => {
      if (it.key in newData) return
      ids.push(it.key)
      templateDataObj[it.key] = it.default
    })
    const { error, data } = await client.query({ query: GET_KEYS_DATA, variables: { ids } })
    if (error) {
      console.error(error)
      enqueueSnackbar('导入失败!', { variant: 'error' })
      return
    }
    const obj: any = { ...newData }
    const arr = data.key.get.filter((it: any) => !skipFieldsList[it._id])
    arr.forEach((it: any) => {
      const cur = (schema as any).dict[it._id] = new Schema(JSON.parse(it.schema))
      obj[it._id] = formData.current[it._id] = templateDataObj[it._id] ?? fields[cur.meta?.kind || 'text'].getDefaultValue()
    })
    setNewData(obj)
  }

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{(newData as any).title || ''}</Typography>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableBody sx={{ '& .key': { width: 150 }, '& .delete': { width: 26, pl: 1 }, '& td': { pl: 0, textAlign: 'justify' } }}>
          {Object.entries(newData).map(([key, value]) => [key, value, normalizeTitle(defaultFieldsName[key] || key)] as const).sort((a, b) => compareTitle(a[2], b[2])).map(([key, value, title]) => {
            const kind: string = (schema as any).dict[key]?.meta?.kind
            const EditorComponent = (fields[kind] || fields.text).EditorComponent as Field<any>['EditorComponent']
            return (
              <TableRow key={key}>
                <TableCell component='th' scope='row' className='delete'>
                  {!(key in skipFieldsList) && (
                    <IconButton
                      size='small'
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [key]: _, ...newData } = others
                        formData.current[key] = null
                        delete pendingList.current[key]
                        setNewData(newData)
                      }}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell
                  component='th'
                  scope='row'
                  className='key'
                  sx={{ fontWeight: kind === 'title' ? 'bold' : undefined }}
                >
                  {title}
                </TableCell>
                <TableCell>
                  <EditorComponent
                    key={key}
                    value={value}
                    name={title}
                    keyName={key}
                    data={formData.current}
                    onSubmit={onSubmit}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Box sx={{ p: 1, textAlign: 'right' }}>
        <Button
          onClick={async () => {
            const res = await client.query({ query: LIST_KEYS })
            const arr = res.data.key.get.filter((it: any) => !skipFieldsList[it._id])
            setOptions(arr.map((it: any) => ({ ...it, schema: new Schema(JSON.parse(it.schema)) })))
            setAddFieldOpen(true)
          }}
        >
          添加新字段
        </Button>
        <Button
          onClick={async () => {
            const res = await client.query({ query: LIST_TEMPLATES })
            setTemplates(res.data.template.search)
            setImportTemplateOpen(true)
          }}
        >
          导入模板
        </Button>
        <Button
          disabled
          onClick={async () => {
            setSaveTemplateOpen(true)
          }}
        >
          保存为模板
        </Button>
      </Box>
      <Fab
        color='primary'
        aria-label='save'
        disabled={submitting}
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => {
          if (formData.current.title === '') {
            enqueueSnackbar('请填写项目标题!', { variant: 'error' })
            return
          }
          setSubmitting(true)
          Promise.all(Object.entries(pendingList.current).map(([key, fn]) => fn(newData[key])))
            .then(() => client.mutate({ mutation: id ? UPDATE_DATA : ADD_DATA, variables: { id, set: formData.current } }))
            .then(it => {
              if (it.errors) throw it.errors
              enqueueSnackbar('保存成功!', { variant: 'success' })
              navigate('/item/' + (id || it.data.item.add))
              setTimeout(() => location.reload(), 100)
            })
            .catch(e => {
              console.error(e)
              enqueueSnackbar('保存失败!', { variant: 'error' })
            })
            .then(() => setSubmitting(false))
        }}
      >
        <SaveIcon />
      </Fab>
      <Dialog
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
        sx={{ '& .MuiDialog-paper': { maxHeight: '40vh' }, '& .MuiDialog-container': { alignItems: 'flex-start', paddingTop: '10vh' } }}
      >
        <DialogTitle>添加新字段</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            isOptionEqualToValue={(a: any, b: any) => a._id === b._id}
            getOptionLabel={(option: FieldType) => option.localization?.['zh-CN'] || option._id}
            options={options}
            loading={!options.length}
            limitTags={10}
            disableCloseOnSelect
            style={{ minWidth: 300, marginTop: 8 }}
            renderOption={(props, option: FieldType, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {normalizeTitle(option.localization?.['zh-CN'] || option._id)}&nbsp;<Chip label={fields[option.schema.meta?.kind || 'text'].name} size='small' />
              </li>
            )}
            value={fieldsData}
            onChange={(_, value) => setFieldsData(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='standard'
                label='请选择需要添加的字段'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {options.length ? null : <CircularProgress color='inherit' size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddFieldOpen(false)
              const obj: any = { title: newData.title, description: newData.description, images: newData.images }
              fieldsData.forEach(it => {
                const cur = (schema as any).dict[it._id] = it.schema
                obj[it._id] = fields[cur.meta?.kind || 'text'].getDefaultValue()
                if (it._id in newData) obj[it._id] = newData[it._id]
                else formData.current[it._id] = obj[it._id]
              })
              for (const key in formData.current) {
                if (!(key in obj)) {
                  delete formData.current[key]
                  delete pendingList.current[key]
                }
              }
              for (const key in others) {
                if (!(key in obj)) {
                  formData.current[key] = null
                  delete pendingList.current[key]
                }
              }
              setNewData(obj)
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={importTemplateOpen}
        onClose={() => setImportTemplateOpen(false)}
      >
        <DialogTitle>导入模板</DialogTitle>
        <DialogContent>
          <Autocomplete
            getOptionLabel={(option: TemplateType) => option.name}
            options={templates}
            loading={!templates.length}
            style={{ minWidth: 300, marginTop: 8 }}
            value={selectedTemplate}
            onChange={(_, value) => setSelectedTemplate(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='standard'
                label='请选择需要导入的模板'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {templates.length ? null : <CircularProgress color='inherit' size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportTemplateOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setImportTemplateOpen(false)
              client.query({ query: GET_TEMPLATE, variables: { id: selectedTemplate!._id } })
                .then(({ error, data }) => {
                  if (error) throw error
                  loadState(data.template.get.payload)
                }).catch(e => {
                  console.error(e)
                  enqueueSnackbar('加载模板失败!', { variant: 'error' })
                })
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
      >
        <DialogTitle>保存为模板</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要保存的模板</DialogContentText>
          <input type='text' value={saveTemplateName} onChange={(e) => setSaveTemplateName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setSaveTemplateOpen(false)
              const state = dumpState() // returns json object
              client.mutate({ mutation: ADD_TEMPLATE, variables: { name: saveTemplateName, payload: state } })
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ItemCard
