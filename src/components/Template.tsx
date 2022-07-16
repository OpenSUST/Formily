import React, { useState } from 'react'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete'
import { typeNameMap } from './fields'
import { openDialog } from './EnsureDialog'
import { CircularLoading } from './Loading'
import { GET_DATA } from '../api'

import { useQuery, useApolloClient } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

const data2 = [{ title: '字段a', id: 'a' }, { title: '字段B', type: 'number', id: 'b' }, { title: '字段C', type: 'image', id: 'c' }]

const Template: React.FC = () => {
  const client = useApolloClient()
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id: string }>()
  const { loading, error, data } = useQuery(GET_DATA, { variables: { id } })

  if (error) throw error
  if (loading) return <CircularLoading loading />

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>模板: 模板名</Typography>
      <Card sx={{ margin: '1rem auto', maxWidth: 500 }}>
        <List>
          {data2.map(it => (
            <ListItem
              key={it.id}
              secondaryAction={
                <IconButton edge='end' onClick={() => { /* TODO: 删除模板字段 */ }}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={<>{it.title} <Chip label={(typeNameMap as any)[it.type || 'text']} size='small' /></>}
              />
            </ListItem>
          ))}
        </List>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>添加字段</DialogTitle>
        <DialogContent>
          <DialogContentText>请在下面输入新管理员用户的名字和密码</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='用户名'
            onChange={e => (addUserData.username = e.target.value)}
          />
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='密码'
            type='password'
            onChange={e => (addUserData.password = e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setOpen(false)
              client.query({ query: ADD_USER, variables: addUserData }).then(it => {
                if (it.error) throw it.error
                enqueueSnackbar('添加用户成功!', { variant: 'success' })
              }).catch(e => {
                console.error(e)
                enqueueSnackbar('添加用户失败!', { variant: 'error' })
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

export default Template
