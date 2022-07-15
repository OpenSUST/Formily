import React, { useState, useMemo } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import AdbIcon from '@mui/icons-material/Adb'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { isLogin, username, isAdmin, AUTH, LOGOUT } from '../api'

const ResponsiveAppBar = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const loginData = useMemo(() => ({ username: '', password: '' }), [open])

  return (
    <AppBar position='fixed'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant='h6'
            noWrap
            component='a'
            href='/'
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            LOGO
          </Typography>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant='h5'
            noWrap
            component='a'
            href='/'
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 0, ml: 'auto' }}>
            <Tooltip title='显示我的收藏'>
              <IconButton
                size='large'
                color='inherit'
                sx={{ mr: 1 }}
              >
                <CollectionsBookmarkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isLogin ? '打开菜单' : '登录'}>
              <IconButton
                onClick={e => {
                  if (isLogin) setAnchorElUser(e.currentTarget)
                  else setOpen(true)
                }}
                sx={{ p: 0 }}
              >
                <Avatar alt={username}>{isLogin ? username : undefined}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id='menu-appbar'
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={!!anchorElUser}
              onClose={() => setAnchorElUser(null)}
            >
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null)
                    navigate('/users')
                  }}
                >
                  <Typography textAlign='center'>用户管理</Typography>
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    setAnchorElUser(null)
                    navigate('/templates')
                  }}
                >
                  <Typography textAlign='center'>模板管理</Typography>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  setAnchorElUser(null)
                  client.query({ query: LOGOUT }).catch(console.error).then(() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('username')
                    localStorage.removeItem('isAdmin')
                    enqueueSnackbar('操作成功!', { variant: 'success' })
                    setTimeout(() => location.reload(), 500)
                  })
                }}
              >
                <Typography textAlign='center'>退出登录</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>添加用户</DialogTitle>
        <DialogContent>
          <DialogContentText>请在下面输入新管理员用户的名字和密码</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='用户名'
            onChange={e => (loginData.username = e.target.value)}
          />
          <TextField
            autoFocus
            fullWidth
            margin='dense'
            variant='standard'
            label='密码'
            type='password'
            onChange={e => (loginData.password = e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            onClick={() => {
              setOpen(false)
              client.query({ query: AUTH, variables: loginData }).then(it => {
                if (it.error) throw it.error
                if (!it.data.user.auth) throw new Error('账号或密码错误!')
                enqueueSnackbar('登录成功!', { variant: 'success' })
                const { token, username, roles } = it.data.user.auth
                localStorage.setItem('token', token)
                localStorage.setItem('username', username)
                localStorage.setItem('isAdmin', roles.includes('ADMIN'))
                setTimeout(() => location.reload(), 500)
              }).catch(e => {
                console.error(e)
                enqueueSnackbar('登录失败, 可能是因为账号或密码错误.', { variant: 'error' })
              })
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}
export default ResponsiveAppBar
