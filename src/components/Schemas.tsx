import React, { useRef, useState, useEffect } from 'react'

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
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import fields from './fields'
import { skipFieldsList, UPDATE_KEY_META, UPDATE_KEY_LOCALIZATION } from '../api'
import { openDialog } from './EnsureDialog'
import { CircularLoading } from './Loading'

import { useQuery, useApolloClient, gql } from '@apollo/client'
import Schema from 'schemastery'
import { useSnackbar } from 'notistack'
import CreateFieldPopup from './CreateFieldPopup'
import { normalizeTitle } from '../utils'

const getTypeName = (type: string) => {
  const schema = new Schema(JSON.parse(type))
  if (schema.type === 'number') return fields.number.name
  return fields[schema.meta!.kind! || 'text'].name as string
}

const Schemas: React.FC = () => {
  const client = useApolloClient()
  const [editId, setEditId] = useState('')
  const [newName, setNewName] = useState('')
  const [extraData, setExtraData] = useState('')
  const [hasExtraData, setHasExtraData] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const createFieldPopup = useRef<{ open(): void }>()

  const { loading, error, data } = useQuery(gql`query { key { get { _id localization schema } } }`)

  useEffect(() => {
    if (!editId || !data?.key?.get) return
    const cur = data.key.get.find((item: any) => item._id === editId)
    if (!cur) return

    setNewName(normalizeTitle(cur.localization?.['zh-CN'] || editId))
    const schema = new Schema(JSON.parse(cur.schema))
    console.log(fields[schema.meta!.kind!])
    if (fields[schema.meta!.kind!]?.hasExtraData) {
      setHasExtraData(true)
      setExtraData(schema.meta!.extraData! || '')
    } else setHasExtraData(false)
  }, [editId])

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
                <TableCell component='th' scope='row'>{normalizeTitle(row.localization?.['zh-CN'] || row._id)}</TableCell>
                <TableCell align='right'>{getTypeName(row.schema) || '文本'}</TableCell>
                <TableCell align='right'>
                  <IconButton edge='end' size='small' onClick={() => setEditId(row._id)}>
                    <EditIcon fontSize='small' />
                  </IconButton>
                  <IconButton
                    edge='end'
                    size='small'
                    onClick={() => openDialog('确认删除该字段?').then(res => res && client.mutate({
                      mutation: gql`
                        mutation ($key: String!) {
                          key { del(key: $key) }
                        }
                      `,
                      variables: { key: row._id }
                    }).then(it => {
                      if (it.errors) throw it.errors
                      enqueueSnackbar('删除字段成功!', { variant: 'success' })
                      setTimeout(() => location.reload(), 100)
                    }).catch(e => {
                      console.error(e)
                      enqueueSnackbar('删除字段失败!', { variant: 'error' })
                    }) as any)}
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </TableCell>
              </TableRow>)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <CreateFieldPopup ref={createFieldPopup as any} />
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
          {hasExtraData && (
            <TextField
              fullWidth
              multiline
              margin='dense'
              variant='standard'
              label='额外数据'
              value={extraData}
              onChange={e => setExtraData(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNewName('')
              setEditId('')
            }}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              setNewName('')
              setEditId('')
              const current = data.key.get.find((item: any) => item._id === editId)
              if (!current) return
              const promises = []
              if ((current.localization?.['zh-CN'] || editId) !== newName) {
                promises.push(client.mutate({
                  mutation: UPDATE_KEY_LOCALIZATION,
                  variables: { key: editId, value: newName }
                }))
              }
              if (hasExtraData) {
                const schema = new Schema(JSON.parse(current.schema))
                if (schema.meta!.extraData !== extraData) {
                  promises.push(client.mutate({
                    mutation: UPDATE_KEY_META,
                    variables: { key: editId, value: { extraData } }
                  }).then(it => {
                    if (!it.data?.key?.setMeta) throw new Error('Failed to update key meta!')
                    return it
                  }))
                }
              }
              Promise.all(promises).then(it => {
                const ret = it.find(i => i.errors)
                if (ret) throw ret.errors![0]
                enqueueSnackbar('修改字段成功!', { variant: 'success' })
                setTimeout(() => window.location.reload(), 1000) // TODO
              }, e => {
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
        onClick={() => createFieldPopup.current!.open()}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default Schemas
