import React from 'react'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import Fab from '@mui/material/Fab'
import Container from '@mui/material/Container'
import ListItemButton from '@mui/material/ListItemButton'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { openDialog } from './EnsureDialog'
import { CircularLoading } from './Loading'
import { LIST_TEMPLATES, ADD_TEMPLATE, DELETE_TEMPLATE } from '../api'

import { useQuery, useApolloClient } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'

const Templates: React.FC = () => {
  const client = useApolloClient()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { loading, error, data } = useQuery(LIST_TEMPLATES)

  if (error) throw error
  if (loading) return <CircularLoading loading />

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>模板管理</Typography>
      <Card sx={{ margin: '1rem auto', maxWidth: 500 }}>
        <List>
          {data.template.search.map((it: { name: string, _id: string }) => (
            <ListItem
              key={it._id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge='end'
                  onClick={() => openDialog('确认要删除该模板?')
                    .then(res => res && client.query({ query: DELETE_TEMPLATE, variables: { id: it._id } })
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
              <ListItemButton onClick={() => navigate('/template/' + it._id)}>
                <ListItemText primary={it.name || ('未命名模板 ' + it._id)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => client.mutate({ mutation: ADD_TEMPLATE }).then(({ errors }) => { if (errors) throw errors }).catch(console.error)}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default Templates
