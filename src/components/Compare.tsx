import React, { useMemo } from 'react'
import Schema from 'schemastery'

// import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
// import ItemCard from './ItemCard'
import fields from './fields'
import { compareTitle, normalizeTitle } from '../utils'
import { CircularLoading } from './Loading'
import { GET_MULTI_ITEMS, defaultFieldsName } from '../api'

import { useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'

const styles = { '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 100 }, '& td': { pl: 0, textAlign: 'justify' }, '& th, & td': { verticalAlign: 'top' } }

const Compare: React.FC = () => {
  const { pathname } = useLocation()
  const { loading, error, data } = useQuery(GET_MULTI_ITEMS, { variables: { ids: pathname.slice(pathname.lastIndexOf('/compare/') + 9).split('/') } })

  const schema = useMemo(() => data && new Schema(data.item.get.schema), [data?.item?.get?.schema])

  if (error) throw error
  if (loading || !schema) return <CircularLoading loading />
  const keys = data.key.get

  const obj: Record<string, any[]> = { }
  const arr: JSX.Element[] = []
  const names: JSX.Element[] = []

  data.item.get.items.map(({ title, _id, ...others }: { title: string, _id: string }, i: number) => {
    for (const key in others) (obj[key] || (obj[key] = []))[i] = (others as any)[key]
    names.push(<TableCell key={_id}>{title}</TableCell>)
  })
  for (const key in obj) {
    const kind: string = schema.dict[key]?.meta?.kind
    const ViewComponent = (fields[kind] || fields.text).ViewComponent
    const fieldsArray: JSX.Element[] = []
    for (let i = 0; i < data.item.get.items.length; i++) {
      fieldsArray.push(<TableCell key={i}>{obj[key][i] != null && <ViewComponent value={obj[key][i]} keyName={key} />}</TableCell>)
    }
    arr.push(
      <TableRow key={key} sx={styles}>
        <TableCell
          component='th'
          scope='row'
          sx={{ fontWeight: kind === 'title' ? 'bold' : undefined }}
        >
          {normalizeTitle(keys.find((i: any) => i._id === key)?.localization?.['zh-CN'] || defaultFieldsName[key] || key)}
        </TableCell>
        {fieldsArray}
      </TableRow>
    )
  }
  // for (const key in othersRight) {
  //   if (key in othersLeft) continue
  //   const kind: string = schema.dict[key]?.meta?.kind
  //   const ViewComponent = ((fields as any)[kind] || fields.text).ViewComponent
  //   rightHas.push((
  //     <TableRow key={key} sx={styles}>
  //       <TableCell
  //         component='th'
  //         scope='row'
  //         sx={{ fontWeight: kind === 'title' ? 'bold' : undefined }}
  //       >
  //         {keys.find((i: any) => i._id === key)?.localization?.['zh-CN'] || defaultFieldsName[key] || key}
  //       </TableCell>
  //       <TableCell />
  //       <TableCell><ViewComponent value={othersRight[key]} /></TableCell>
  //     </TableRow>
  //   ))
  // }

  arr.sort((a, b) => compareTitle(a.key as string, b.key as string))
  // leftHas.sort((a, b) => compareTitle(a.key as string, b.key as string))
  // rightHas.sort((a, b) => compareTitle(a.key as string, b.key as string))

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      {/* <Grid container spacing={4} sx={{ flexDirection: { md: 'row-reverse' } }}>
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, padding: '0!important' }} />
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, position: { md: 'fixed' }, width: '100%' }}>
          {/* <ItemCard title={titleLeft} description={descriptionLeft} image={othersLeft.images[0]} id={left!} />
          <ItemCard title={titleRight} description={descriptionRight} image={othersRight.images[0]} id={right!} />}
        </Grid>
        <Grid item sx={{ flex: '1', width: 0 }}>
        </Grid>
      </Grid> */}
      <Table sx={{ tableLayout: 'fixed', '& th': { width: 150 } }}>
        <TableBody>
          <TableRow sx={{ '& th, & td': { fontWeight: 'bold' } }}>
            <TableCell component='th' scope='row'>字段名</TableCell>
            {names}
          </TableRow>
          {arr}{/* leftHas}{rightHas */}
        </TableBody>
      </Table>
    </Container>
  )
}

export default Compare
