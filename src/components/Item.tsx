import React, { useMemo } from 'react'
import Schema from 'schemastery'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
import ItemCard from './ItemCard'
import fields from './fields'
import { CircularLoading } from './Loading'
import { GET_DATA } from '../api'

import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

const Item: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { loading, error, data } = useQuery(GET_DATA, { variables: { id } })

  const schema = useMemo(() => data && data.item.get.schema && new Schema(data.item.get.schema), [data && data.item.get.schema])

  if (error) throw error
  if (loading || !schema) return <CircularLoading loading />

  const { items } = data.item.get

  if (!items.length) throw new Error('Empty')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ title, description, _id, ...others }] = items

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Grid container spacing={4} sx={{ flexDirection: { md: 'row-reverse' } }}>
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, padding: '0!important' }} />
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, position: { md: 'fixed' }, width: '100%' }}>
          <ItemCard title={title} description={description} image={others.images[0]} id={id!} />
        </Grid>
        <Grid item sx={{ flex: '1', width: 0 }}>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{title}</Typography>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableBody>
              {Object.entries(others).map(([key, value], i) => {
                const ViewComponent = ((fields as any)[schema.dict[key]?.meta?.kind] || fields.text).ViewComponent
                return (
                  <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' }, '& th, & td': { verticalAlign: 'top' } }}>
                    <TableCell component='th' scope='row'>{key}</TableCell>
                    <TableCell><ViewComponent value={value} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Item
