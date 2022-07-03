import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'react-medium-image-zoom/dist/styles.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { zhCN as dataGridLang } from '@mui/x-data-grid'
import { zhCN } from '@mui/material/locale'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

const theme = createTheme(
  {},
  dataGridLang,
  zhCN
)

const client = new ApolloClient({
  uri: 'http://106.52.43.12:9977/',
  cache: new InMemoryCache()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <ApolloProvider client={client}><ThemeProvider theme={theme}><App /></ThemeProvider></ApolloProvider>
  </React.StrictMode>
)
