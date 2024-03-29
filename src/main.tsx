import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'handsontable/dist/handsontable.full.css'
import 'react-medium-image-zoom/dist/styles.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CssBaseline from '@mui/material/CssBaseline'
import * as colors from '@mui/material/colors'
import { name, color } from '../config.json'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { zhCN as dataGridLang } from '@mui/x-data-grid'
import { zhCN } from '@mui/material/locale'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { registerLanguageDictionary, zhCN as HandsonTableZHCN } from 'handsontable/i18n'
import { registerPlugin, UndoRedo } from 'handsontable/plugins'

if (name) document.title = name

registerPlugin(UndoRedo)
registerLanguageDictionary(HandsonTableZHCN)

const theme = createTheme(
  {
    palette: {
      primary: (colors as any)[color || 'blue']
    }
  },
  dataGridLang,
  zhCN
)

const httpLink = createHttpLink({
  // @ts-ignore
  uri: process.env.NODE_ENV === 'development'
    ? location.protocol === 'https:' ? 'https://kr.hydro.ac/opensust/api' : 'http://8.130.110.136:8082/api'
    : '/api'
})
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: localStorage.getItem('token')
  }
}))

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <CssBaseline />
    <ApolloProvider client={client}><ThemeProvider theme={theme}><App /></ThemeProvider></ApolloProvider>
  </>
)
