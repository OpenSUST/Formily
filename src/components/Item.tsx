import React, { useMemo } from 'react'
import Schema from 'schemastery'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import fields from './fields'
import { CircularLoading } from './Loading'

import { gql, useQuery } from '@apollo/client'

const GET_DATA = gql`
query {
  item {
    get (id:"1") {
      items
      schema
    }
  }
}
`

const Item: React.FC = () => {
  const { loading, error, data } = useQuery(GET_DATA)

  const schema = useMemo(() => data && data.item.get.schema && new Schema(data.item.get.schema), [data && data.item.get.schema])

  console.log(schema && schema.dict)

  if (error) throw error
  if (loading || !schema) return <CircularLoading loading />

  const { items } = data.item.get

  if (!items.length) throw new Error('Empty')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ title, description, _id, ...others }] = items

  console.log(items)

  return (
    <Grid container spacing={4} sx={{ flexDirection: { md: 'row-reverse' } }}>
      <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, padding: '0!important' }} />
      <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, position: { md: 'fixed' } }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar aria-label='recipe'>
                R
              </Avatar>
            }
            action={
              <IconButton aria-label='settings'>
                <MoreVertIcon />
              </IconButton>
            }
            title='中科大 张教授'
            subheader='编辑于三天前'
          />
          {others.images[0] && (
            <CardMedia
              component='img'
              height='200'
              image={others.images[0]}
              alt={title}
            />
          )}
          <CardContent>
            <Typography variant='body2' color='text.secondary'>{description}</Typography>
          </CardContent>
        </Card>
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
  )
}

export default Item
