import React, { useCallback, useMemo, useRef } from 'react'
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

const ItemCard: React.FC = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const { id } = useParams<{ id?: string }>()
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
    schema = Schema.object(Object.fromEntries(rows.map(row => [row._id, new Schema(JSON.parse(row.schema))])))
    others = Object.fromEntries(rows.filter(i => i._id !== '_id').map(row => [row._id, defaultValue[schema.dict[row._id]?.meta?.kind] || '']))
  }

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{others.title || ''}</Typography>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableBody>
          {Object.entries(others).map(([key, value], i) => {
            const EditorComponent = ((fields as any)[schema.dict[key]?.meta?.kind] || fields.text).EditorComponent as Field<any>['EditorComponent']
            return (
              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' } }}>
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
    </Container>
  )
}

export default ItemCard
