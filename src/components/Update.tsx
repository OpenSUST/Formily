import React, { useCallback, useMemo, useRef, useState } from 'react'
import Schema from 'schemastery'

import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Fab from '@mui/material/Fab'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import SaveIcon from '@mui/icons-material/Save'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import fields from './fields'
import Field from './fields/Field'
import { CircularLoading } from './Loading'
import { GET_DATA, ADD_DATA, UPDATE_DATA } from '../api'

import { useQuery, useApolloClient, gql } from '@apollo/client'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const defaultValue = {
  image: [],
  number: 0
}

interface FieldType {
  _id: string
  name: string
}

interface TemplateType {
  _id: string
  name: string
}

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

const ItemCard: React.FC = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id?: string }>()
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [importTempateOpen, setImportTempateOpen] = useState(false)
  const [options, setOptions] = useState<readonly FieldType[]>([])
  const [templates, setTemplates] = useState<readonly TemplateType[]>([])
  const [fieldsData, setFieldsData] = useState<any[]>()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  let others = {}
  let schema: Schema

  const formData = useRef<Record<string, any>>({})
  const pendingList = useRef<(() => Promise<void>)[]>([])
  const onSubmit = useCallback((fn: () => Promise<void>) => { pendingList.current.push(fn) }, [])

  if (id) {
    const { loading, error, data } = useQuery(GET_DATA, { variables: { id } })
    schema = useMemo(() => data && data.item.get.schema && new Schema(data.item.get.schema), [data && data.item.get.schema])
    if (error) throw error
    if (loading || !schema) return <CircularLoading loading />
    const { items } = data.item.get
    if (!items.length) throw new Error('Empty')
    let _id
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;[{ _id, ...others }] = items
  } else {
    const { loading, error, data } = useQuery(gql`query { key { get { _id localization schema } } }`)
    if (error) throw error
    if (loading) return <CircularLoading loading />
    const rows = data.key.get
    schema = Schema.object(Object.fromEntries(rows.map((row: any) => [row._id, new Schema(JSON.parse(row.schema))])))
    others = Object.fromEntries(rows.filter((i: any) => i._id !== '_id')
      .map((row: any) => [row._id, (defaultValue as any)[(schema as any).dict[row._id]?.meta?.kind as any] || '']))
  }

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{(others as any).title || ''}</Typography>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableBody>
          {Object.entries(others).map(([key, value], i) => {
            const EditorComponent = ((fields as any)[(schema as any).dict[key]?.meta?.kind as any] || fields.text).EditorComponent as Field<any>['EditorComponent']
            return (
              <TableRow key={i} sx={{ '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' } }}>
                <TableCell component='th' scope='row'>{key}</TableCell>
                <TableCell>
                  <EditorComponent
                    value={value}
                    name={key}
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
          onClick={() => {
            // TODO: 请求全部Fields, 然后setOptions()
            setAddFieldOpen(true)
          }}
        >
          添加新字段
        </Button>
        <Button
          onClick={() => {
            // TODO: 请求全部模板, 然后setTemplates()
            setImportTempateOpen(true)
          }}
        >
          导入模板
        </Button>
      </Box>
      <Fab
        color='primary'
        aria-label='save'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => Promise.all(pendingList.current.map(fn => fn()))
          .then(() => client.mutate({ mutation: id ? UPDATE_DATA : ADD_DATA, variables: { id, set: formData.current } }))
          .then(it => {
            if (it.errors) throw it.errors
            enqueueSnackbar('保存成功!', { variant: 'success' })
            navigate('/item/' + (id || it.data.item.add))
          })
          .catch(e => {
            console.error(e)
            enqueueSnackbar('保存失败!', { variant: 'error' })
          })}
      >
        <SaveIcon />
      </Fab>
      <Dialog
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
      >
        <DialogTitle>添加新字段</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要添加的字段</DialogContentText>
          <Autocomplete
            multiple
            getOptionLabel={(option: FieldType) => option.name}
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
                {option.name}
              </li>
            )}
            value={fieldsData}
            onChange={(_, value) => setFieldsData(value)}
            renderInput={(params) => (
              <TextField
                {...params}
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
              // TODO: 添加字段信息
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={importTempateOpen}
        onClose={() => setImportTempateOpen(false)}
      >
        <DialogTitle>导入模板</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要导入的模板</DialogContentText>
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
          <Button onClick={() => setImportTempateOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setImportTempateOpen(false)
              // TODO: 导入模板
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
