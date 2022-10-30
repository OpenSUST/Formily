import React from 'react'
import AppBar from './components/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import EnsureDialog from './components/EnsureDialog'
import Home from './components/Home'
import Item from './components/Item'
import Update from './components/Update'
import Users from './components/Users'
import Template from './components/Template'
import Templates from './components/Templates'
import Schemas from './components/Schemas'
import Compare from './components/Compare'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'

const JumpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const navigate = useNavigate()
  return (
    <Button
      sx={{ mt: 4 }}
      variant='contained'
      onClick={() => {
        navigate('/')
        onClick()
      }}
    >
      回到主页
    </Button>
  )
}

class ErrorBoundary extends React.Component<{ children: any }> {
  state = { error: '' }
  public static getDerivedStateFromError (error: any) { return { error: error?.message || error + '' } }
  public render () {
    if (!this.state.error) return this.props.children
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>发生了错误!</Typography>
        <Typography>可能是因为网络问题或你没有权限, 错误信息: {this.state.error}</Typography>
        <JumpButton onClick={() => this.setState({ error: '' })} />
      </Container>
    )
  }
}

function App () {
  return (
    <BrowserRouter>
      <SnackbarProvider maxSnack={5}>
        <AppBar />
        <Toolbar />
        <EnsureDialog />
        <ErrorBoundary>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='home' element={<Home />} />
            <Route path='item/:id' element={<Item />} />
            <Route path='create' element={<Update />} />
            <Route path='update/:id' element={<Update />} />
            <Route path='compare/*' element={<Compare />} />
            <Route path='template/:id' element={<Template />} />
            <Route path='templates' element={<Templates />} />
            <Route path='users' element={<Users />} />
            <Route path='schemas' element={<Schemas />} />
          </Routes>
        </ErrorBoundary>
      </SnackbarProvider>
    </BrowserRouter>
  )
}

export default App
