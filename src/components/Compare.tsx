import React, { useMemo } from 'react'
import Schema from 'schemastery'

import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
import ItemCard from './ItemCard'
import fields from './fields'
import { compareTitle } from '../utils'
import { CircularLoading } from './Loading'
import { GET_TWO_ITEMS, defaultFieldsName } from '../api'

import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

const styles = { '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' }, '& th, & td': { verticalAlign: 'top' } }

const Compare: React.FC = () => {
  const { left, right } = useParams<{ left: string, right: string }>()
  const { loading, error, data } = useQuery(GET_TWO_ITEMS, { variables: { left, right } })

  const schemas = useMemo(() => data && data.item.itemLeft.schema && data.item.itemRight.schema &&
    [new Schema(data.item.itemLeft.schema), new Schema(data.item.itemRight.schema)],
  data ? [data.item.itemLeft.schema, data.item.itemRight.schema] : [undefined, undefined])

  if (error) throw error
  if (loading || !schemas) return <CircularLoading loading />
  const keys = data.key.get

  const { items: itemsLeft } = data.item.itemLeft
  const { items: itemsRight } = data.item.itemRight

  if (!itemsLeft.length || !itemsRight.length) throw new Error('Empty')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ title: titleLeft, description: descriptionLeft, _id: idLeft, ...othersLeft }] = itemsLeft
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ title: titleRight, description: descriptionRight, _id: idRight, ...othersRight }] = itemsRight

  const arr: JSX.Element[] = []
  const leftHas: JSX.Element[] = []
  const rightHas: JSX.Element[] = []

  for (const key in othersLeft) {
    const ViewComponent = ((fields as any)[schemas[0].dict[key]?.meta?.kind] || fields.text).ViewComponent
      ; (key in othersRight ? arr : leftHas).push(
        <TableRow key={key} sx={styles}>
          <TableCell component='th' scope='row'>{keys.find((i: any) => i._id === key)?.localization?.['zh-CN'] || defaultFieldsName[key] || key}</TableCell>
          <TableCell><ViewComponent value={othersLeft[key]} /></TableCell>
          <TableCell>{key in othersRight && <ViewComponent value={othersRight[key]} />}</TableCell>
        </TableRow>
    )
  }
  for (const key in othersRight) {
    if (key in othersLeft) continue
    const ViewComponent = ((fields as any)[schemas[1].dict[key]?.meta?.kind] || fields.text).ViewComponent
    rightHas.push((
      <TableRow key={key} sx={styles}>
        <TableCell component='th' scope='row'>{keys.find((i: any) => i._id === key)?.localization?.['zh-CN'] || defaultFieldsName[key] || key}</TableCell>
        <TableCell />
        <TableCell><ViewComponent value={othersRight[key]} /></TableCell>
      </TableRow>
    ))
  }

  arr.sort((a, b) => compareTitle(a.key as string, b.key as string))
  leftHas.sort((a, b) => compareTitle(a.key as string, b.key as string))
  rightHas.sort((a, b) => compareTitle(a.key as string, b.key as string))

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Grid container spacing={4} sx={{ flexDirection: { md: 'row-reverse' } }}>
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, padding: '0!important' }} />
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, position: { md: 'fixed' }, width: '100%' }}>
          <ItemCard title={titleLeft} description={descriptionLeft} image={othersLeft.images[0]} id={left!} />
          <ItemCard title={titleRight} description={descriptionRight} image={othersRight.images[0]} id={right!} />
        </Grid>
        <Grid item sx={{ flex: '1', width: 0 }}>
          <Table sx={{ tableLayout: 'fixed', '& th': { width: 100 } }}>
            <TableBody>
              <TableRow>
                <TableCell component='th' scope='row'>字段名</TableCell>
                <TableCell>{titleLeft}</TableCell>
                <TableCell>{titleRight}</TableCell>
              </TableRow>
              {arr}{leftHas}{rightHas}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Compare
