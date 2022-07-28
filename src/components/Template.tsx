import React, { useEffect, useState, useRef } from 'react'
import Schema from 'schemastery'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Autocomplete from '@mui/material/Autocomplete'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Chip from '@mui/material/Chip'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import EditIcon from '@mui/icons-material/Edit'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { typeNameMap } from './fields'
import { CircularLoading } from './Loading'
import { GET_KEYS_DATA, LIST_KEYS, GET_TEMPLATE, UPDATE_TEMPLATE, skipFieldsList } from '../api'
import { TemplateData, FieldType } from '../types'

import { useQuery, useApolloClient } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

const Template: React.FC = () => {
  const client = useApolloClient()
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [templateData, setTemplateData] = useState<(TemplateData)[]>([])
  const [fieldsData, setFieldsData] = useState<FieldType[]>([])
  const [options, setOptions] = useState<readonly FieldType[]>([])
  const [templateName, setTemplateName] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id: string }>()
  const { loading, error, data } = useQuery(GET_TEMPLATE, { variables: { id } })
  const schemas = useRef<Record<string, Schema>>({})

  useEffect(() => {
    if (!data) return
    setTemplateName(data.template.get.name)
    let payload = (typeof data.template.get.payload === 'string' ? JSON.parse(data.template.get.payload || '[]') : data.template.get.payload) as TemplateData[]
    if (!Array.isArray(payload)) payload = []
    client.query({ query: GET_KEYS_DATA, variables: { ids: payload.map(it => it.key) } })
      .then(({ error, data }) => {
        if (error) throw error
        setTemplateData((data.key.get as any[]).map(it => {
          schemas.current[it._id] = new Schema(it.schema)
          return { key: it._id }
        }))
      })
      .catch(e => {
        console.error(e)
        enqueueSnackbar('获取数据失败!', { variant: 'error' })
      })
  }, [data])

  if (error) throw error
  if (loading) return <CircularLoading loading />

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
        模板: {templateName} <IconButton onClick={() => setEditNameOpen(true)}><EditIcon /></IconButton>
      </Typography>
      <Card sx={{ margin: '1rem auto', maxWidth: 500 }}>
        <List>
          {templateData.map(it => (
            <ListItem
              key={it.key}
              secondaryAction={
                <IconButton edge='end' onClick={() => setTemplateData(templateData.filter(cur => cur.key !== it.key))}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={<>{it.key} <Chip label={(typeNameMap as any)[schemas.current[it.key].meta?.kind || 'text']} size='small' /></>}
              />
            </ListItem>
          ))}
        </List>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
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
        </CardActions>
      </Card>
      <Dialog
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
      >
        <DialogTitle>添加新字段</DialogTitle>
        <DialogContent>
          <DialogContentText>请选择需要添加的字段</DialogContentText>
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
                {option.localization?.['zh-CN'] || option._id}&nbsp;<Chip label={(typeNameMap as any)[option.schema.meta?.kind || 'text']} size='small' />
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
              setTemplateData(fieldsData.map(it => {
                schemas.current[it._id] = it.schema
                return { key: it._id }
              }))
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editNameOpen}
        onClose={() => setEditNameOpen(false)}
      >
        <DialogTitle>修改模板名</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='模板名'
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNameOpen(false)}>确定</Button>
        </DialogActions>
      </Dialog>
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => {
          client.mutate({ mutation: UPDATE_TEMPLATE, variables: { id, name: templateName, payload: templateData } }).then(({ errors }) => {
            if (errors?.[0]) throw errors[0]
            enqueueSnackbar('添加成功', { variant: 'success' })
          }).catch(err => {
            console.error(err)
            enqueueSnackbar('保存失败!', { variant: 'error' })
          })
        }}
      >
        <SaveIcon />
      </Fab>
    </Container>
  )
}

export default Template
