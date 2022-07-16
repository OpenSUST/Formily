import React, { useMemo, useState } from 'react'

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
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { openDialog } from './EnsureDialog'
import { CircularLoading } from './Loading'
import { LIST_USERS, ADD_USER } from '../api'

import { useQuery, useApolloClient } from '@apollo/client'
import { useSnackbar } from 'notistack'

const Users: React.FC = () => {
  const client = useApolloClient()
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { loading, error, data } = useQuery(LIST_USERS)

  const addUserData = useMemo(() => ({ username: '', password: '' }), [open])

  if (error) throw error
  if (loading) return <CircularLoading loading />

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>用户管理</Typography>
      <Card sx={{ margin: '1rem auto', maxWidth: 500 }}>
        <List>
          {data.user.list.map((it: { username: string, roles: string[] }) => (
            <ListItem
              key={it.username}
              secondaryAction={
                <IconButton
                  edge='end'
                  onClick={() => openDialog('确认要删除该用户?') // TODO: 删除用户
                    .then(res => res && client.query({ variables: { id: '' } })
                      .then(({ error }) => {
                        if (error) throw error
                        enqueueSnackbar('删除成功!', { variant: 'success' })
                      }) as any)
                    .catch(e => {
                      console.error(e)
                      enqueueSnackbar('删除失败!', { variant: 'error' })
                    })}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>{it.username[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={(
                  <>
                    {it.username} {it.roles.includes('ADMIN')
                      ? <Chip label='管理员' color='primary' size='small' />
                      : <Chip label='普通用户' size='small' />}
                  </>
                )}
              />
            </ListItem>
          ))}
        </List>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>添加用户</DialogTitle>
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

export default Users
