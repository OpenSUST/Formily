import React, { useMemo, useState } from 'react'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { skipFieldsList } from '../api'
import { typeNameMap } from './fields'
import { CircularLoading } from './Loading'

import { useQuery, useApolloClient, gql } from '@apollo/client'
import Schema from 'schemastery'
import { useSnackbar } from 'notistack'

const getTypeName = (type: string) => {
  const schema = new Schema(JSON.parse(type))
  if (schema.type === 'number') return typeNameMap.number
  return (typeNameMap as any)[schema.meta!.kind!] as string
}

const Schemas: React.FC = () => {
  const client = useApolloClient()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState('')
  const [newName, setNewName] = useState('')
  const { enqueueSnackbar } = useSnackbar()

  const addKeyData = useMemo(() => ({ key: '', type: '' }), [open])
  const { loading, error, data } = useQuery(gql`query { key { get { _id localization schema } } }`)

  if (error) throw error
  if (loading) return <CircularLoading loading />
  const rows = data.key.get

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>字段管理</Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>字段名</TableCell>
              <TableCell align='right'>类型</TableCell>
              <TableCell align='right'>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.filter((it: any) => !skipFieldsList[it._id]).map((row: any) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>{row.localization?.['zh-CN'] || row._id}</TableCell>
                <TableCell align='right'>{getTypeName(row.schema) || '文本'}</TableCell>
                <TableCell align='right'>
                  <IconButton edge='end' size='small' onClick={() => setEditId(row._id)}>
                    <EditIcon fontSize='small' />
                  </IconButton>
                  <IconButton
                    edge='end'
                    size='small'
                    onClick={() => {
                      client.mutate({
                        mutation: gql`
                          mutation ($key: String!) {
                            key { del(key: $key) }
                          }
                        `,
                        variables: { key: editId }
                      }).then(it => {
                        if (it.errors) throw it.errors
                        enqueueSnackbar('添加字段成功!', { variant: 'success' })
                      }).catch(e => {
                        console.error(e)
                        enqueueSnackbar('添加字段失败!', { variant: 'error' })
                      })
                    }}
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </TableCell>
              </TableRow>)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>添加字段</DialogTitle>
        <DialogContent>
          <DialogContentText>请在下面输入要创建字段的信息</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='字段名'
            onChange={e => (addKeyData.key = e.target.value)}
          />
          <FormControl fullWidth variant='standard' margin='dense'>
            <InputLabel id='schema-key-type'>字段类型</InputLabel>
            <Select
              labelId='schema-key-type'
              label='字段类型'
              defaultValue='text'
              onChange={e => (addKeyData.type = e.target.value)}
            >
              <MenuItem value='text'>文本</MenuItem>
              <MenuItem value='number'>数字</MenuItem>
              <MenuItem value='image'>图片</MenuItem>
              <MenuItem value='csv'>CSV</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setOpen(false)
              const schema = addKeyData.type === 'number' ? Schema.number() : Schema.string()
              schema.meta ||= {}
              if (addKeyData.type !== 'number') schema.meta.kind = addKeyData.type as any
              client.mutate({
                mutation: gql`
                  mutation ($key: String!, $schema: String!) {
                    key {
                      add(key: $key, schema: $schema)
                    }
                  }
                `,
                variables: { key: addKeyData.key, schema: JSON.stringify(schema.toJSON()) }
              }).then(it => {
                if (it.errors) throw it.errors
                enqueueSnackbar('添加字段成功!', { variant: 'success' })
              }).catch(e => {
                console.error(e)
                enqueueSnackbar('添加字段失败!', { variant: 'error' })
              })
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!editId} onClose={() => setEditId('')}>
        <DialogTitle>修改字段</DialogTitle>
        <DialogContent>
          <DialogContentText>请在下面输入要编辑字段的信息</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='字段名'
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false)
              setNewName('')
              setEditId('')
            }}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
              setNewName('')
              setEditId('')
              client.mutate({
                mutation: gql`
                  mutation ($key: String!, $name: String!) {
                    key {
                      setLocalization(key: $key, lang: "zh-CN", value: $name)
                    }
                  }
                `,
                variables: { key: editId, name: newName }
              }).then(it => {
                if (it.errors) throw it.errors[0]
                enqueueSnackbar('修改字段成功!', { variant: 'success' })
                setTimeout(() => window.location.reload(), 1000) // TODO
              }).catch(e => {
                console.error(e)
                enqueueSnackbar('修改字段失败!', { variant: 'error' })
              })
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default Schemas
