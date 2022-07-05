import React, { useMemo, useRef } from 'react'
import Schema from 'schemastery'

import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Fab from '@mui/material/Fab'
import Container from '@mui/material/Container'
import SaveIcon from '@mui/icons-material/Save'
import fields from './fields'
import { CircularLoading } from './Loading'
import { GET_DATA, UPDATE_DATA } from '../api'

import { useQuery, useApolloClient } from '@apollo/client'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const ItemCard: React.FC = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id: string }>()
  const { loading, error, data } = useQuery(GET_DATA, { variables: { id } })

  const schema = useMemo(() => data && data.item.get.schema && new Schema(data.item.get.schema), [data && data.item.get.schema])
  const formData = useRef<Record<string, any>>({})

  if (error) throw error
  if (loading || !schema) return <CircularLoading loading />

  const { items } = data.item.get

  if (!items.length) throw new Error('Empty')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ _id, ...others }] = items

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{others.title}</Typography>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableBody>
          {Object.entries(others).map(([key, value], i) => {
            const EditorComponent = ((fields as any)[schema.dict[key]?.meta?.kind] || fields.text).EditorComponent
            return (
              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' } }}>
                <TableCell component='th' scope='row'>{key}</TableCell>
                <TableCell><EditorComponent value={value} name={key} keyName={key} data={formData.current} /></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Fab
        color='primary'
        aria-label='save'
        sx={{ position: 'fixed', bottom: 36, right: 36 }}
        onClick={() => client.query({ query: UPDATE_DATA, variables: { id, set: formData.current } }).then(it => {
          if (it.error) throw it.error
          enqueueSnackbar('保存成功!', { variant: 'success' })
          navigate('/item/' + id)
        }).catch(e => {
          console.error(e)
          enqueueSnackbar('保存失败!', { variant: 'error' })
        })}
      >
        <SaveIcon />
      </Fab>
    </Container>
  )
}

export default ItemCard
