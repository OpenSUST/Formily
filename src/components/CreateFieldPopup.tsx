import React from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { useApolloClient, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { typeNameMap, defaultSchemas } from './fields'
import { Kind } from '../types'

export default React.forwardRef(function CreateFieldPopup (_, ref) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [key, setKey] = React.useState('')
  const [keyType, setType] = React.useState('')
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()

  React.useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true)
  }))

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogTitle>添加字段</DialogTitle>
      <DialogContent>
        <DialogContentText>请在下面输入要创建字段的信息</DialogContentText>
        <TextField
          autoFocus
          fullWidth
          margin='dense'
          variant='standard'
          label='字段名'
          onChange={e => setKey(e.target.value)}
        />
        <FormControl fullWidth variant='standard' margin='dense'>
          <InputLabel id='schema-key-type'>字段类型</InputLabel>
          <Select
            labelId='schema-key-type'
            label='字段类型'
            defaultValue='text'
            onChange={e => setType(e.target.value)}
          >
            {Object.entries(typeNameMap).filter(([key]) => !!key).map(([key, value]) => <MenuItem value={key} key={key}>{value}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>取消</Button>
        <Button
          onClick={() => {
            setIsOpen(false)
            client.mutate({
              mutation: gql`
                mutation ($key: String!, $schema: String!) {
                  key {
                    add(key: $key, schema: $schema)
                  }
                }
              `,
              variables: { key, schema: JSON.stringify(defaultSchemas[keyType as Kind].toJSON()) }
            }).then(it => {
              if (it.errors) throw it.errors
              enqueueSnackbar('添加字段成功!', { variant: 'success' })
              setTimeout(() => location.reload(), 50)
            }).catch(e => {
              console.error(e)
              enqueueSnackbar('添加字段失败!', { variant: 'error' })
            })
          }}
        >
          确定
        </Button>
      </DialogActions>
    </Dialog>
  )
})
