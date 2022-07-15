import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

// eslint-disable-next-line @typescript-eslint/ban-types
let solve: ((val: boolean) => void) | undefined
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
let _setOpen = (_val: boolean) => { }
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
let _setText = (_val: string) => { }
export const openDialog = (text: string) => new Promise<boolean>(resolve => {
  if (solve) solve(false)
  solve = resolve as any
  _setText(text)
  _setOpen(true)
})

const EnsureDialog: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  _setOpen = setOpen
  _setText = setText
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false)
        if (solve) {
          solve(false)
          solve = undefined
        }
      }}
    >
      <DialogTitle>提示</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpen(false)
            if (solve) {
              solve(false)
              solve = undefined
            }
          }}
        >
          取消
        </Button>
        <Button
          onClick={() => {
            setOpen(false)
            if (solve) {
              solve(true)
              solve = undefined
            }
          }}
        >
          确定
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EnsureDialog
