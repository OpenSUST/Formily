import React, { useMemo, useState } from 'react'
import Schema from 'schemastery'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import ItemCard from './ItemCard'
import fields from './fields'
import Field from './fields/Field'
import { CircularLoading } from './Loading'
import { GET_DATA, defaultFieldsName } from '../api'
import { compareTitle, normalizeTitle } from '../utils'

import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

const Item: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [showAllFields, setShowAllFields] = useState(false)
  const { loading, error, data } = useQuery(GET_DATA, { variables: { id } })

  const [schema, localizations] = useMemo(() => {
    if (!data) return [null, { }]
    const localizations: Record<string, string> = { }
    data.key.get.forEach((it: any) => (localizations[it._id] = it.localization['zh-CN']))
    return [data.item.get.schema && new Schema(data.item.get.schema), localizations] as const
  }, [data && data.item.get.schema])

  if (error) throw error
  if (loading || !schema) return <CircularLoading loading />

  const { items } = data.item.get

  if (!items.length) throw new Error('找不到当前的物品')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ title, description, _id, ...others }] = items

  let entires = Object.entries(others)
  if (!showAllFields) entires = entires.filter(([key, value]) => !(fields[schema.dict[key]?.meta?.kind] || fields.text).isEmpty(value))

  return (
    <Container sx={{ mt: 4 }} maxWidth='xl'>
      <Grid container spacing={4} sx={{ flexDirection: { md: 'row-reverse' } }}>
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, padding: '0!important' }} />
        <Grid item xs={12} md={4} sx={{ maxWidth: { md: '300px' }, position: { md: 'fixed' }, width: '100%' }}>
          <ItemCard title={title} description={description} image={others.images?.[0]} id={id!} />
        </Grid>
        <Grid item sx={{ flex: '1', width: 0 }}>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{title}&nbsp;
            <FormControlLabel control={<Switch checked={showAllFields} onChange={e => setShowAllFields(e.target.checked)} />} label='显示全部字段' />
          </Typography>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableBody>
              {entires.sort((a, b) => compareTitle(a[0], b[0])).map(([key, value]) => {
                const meta = schema.dict[key]?.meta
                const kind: string = meta?.kind
                const ViewComponent: Field<any>['ViewComponent'] = (fields[kind] || fields.text).ViewComponent
                return (
                  <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 150 }, '& td': { pl: 0, textAlign: 'justify' }, '& th, & td': { verticalAlign: 'top' } }}>
                    <TableCell
                      component='th'
                      scope='row'
                      sx={{ fontWeight: kind === 'title' ? 'bold' : undefined }}
                    >
                      {normalizeTitle(localizations[key] || defaultFieldsName[key] || key)}
                    </TableCell>
                    <TableCell><ViewComponent value={value as any} keyName={key} key={key} meta={meta} /></TableCell>
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
