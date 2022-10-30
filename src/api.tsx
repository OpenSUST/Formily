import { gql, useApolloClient } from '@apollo/client'
import { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'

export const token = localStorage.getItem('token') || ''
export const username = localStorage.getItem('username') || ''
export const isAdmin = localStorage.getItem('isAdmin') === 'true'
export const isLogin = !!token

export const skipFieldsList: Record<string, true | undefined> = {
  _id: true,
  description: true,
  images: true,
  title: true
  // model: true
}

export const defaultFieldsName: Record<string, string> = {
  _id: 'ID',
  description: '描述',
  images: '图片',
  title: '标题',
  model: '模型'
}

export const GET_DATA = gql`
query Request ($id: String!) {
  item {
    get (id: $id) {
      items
      schema
    }
  }
  key { get { _id localization } }
}
`

export const ADD_DATA = gql`
mutation ($set: JSON!) {
  item {
    add (payload: $set)
  }
}
`

export const UPDATE_DATA = gql`
mutation ($id: String!, $set: JSON!) {
  item {
    update (id: $id, set: $set)
  }
}
`

export const LIST_USERS = gql`
query {
  user {
    list {
      username
      roles
    }
  }
}`

export const ADD_USER = gql`
query Request ($username: String!, $password: String!) {
  user {
    add (username: $username, password: $password, roles: [USER])
  }
}`

export const GET_ALL_COUNT = gql`
query {
  user {
    count
  }
  item {
    count
  }
  key {
    count
  }
}`

export const AUTH = gql`
query Request ($username: String!, $password: String!)  {
  user {
    auth (username: $username, password: $password) {
      token
      username
      roles
    }
  }
}`

export const LOGOUT = gql`
query {
  user { logout }
}`

export const UPLOAD = gql`
query Request ($ext: String!, $size: Int!) {
  file {
    requestUpload (ext: $ext, size: $size) {
      postURL
      formData
    }
  }
}`

export const SEARCH = gql`
query Request ($keyword: String!) {
  item {
    search (keyword: $keyword) {
      items
    }
  }
}`

export const LIST_TEMPLATES = gql`
query {
  template {
    search (name: "") {
      _id
      name
    }
  }
}`

export const GET_TEMPLATES = gql`
query Request ($id: String!) {
  template {
    get (id: "") {
      name
      payload
    }
  }
}`

export const ADD_TEMPLATE = gql`
mutation ($name: String!) {
  template {
    add (name: $name, payload: {})
  }
}`

export const DELETE_TEMPLATE = gql`
query Request ($id: String!) {
  template {
    del (id: $id)
  }
}`

export const LIST_SCHEMAS = gql`
query {
  key {
    get {
      username
      roles
    }
  }
}`

export const GET_MULTI_ITEMS = gql`
query ($ids: [String]) {
  item {
    get (ids: $ids) {
      items
      schema
    }
  }
  key { get { _id localization } }
}`

export const LIST_KEYS = gql`query {
  key {
    get {
      _id
      localization
      schema
    }
  }
}`

export const GET_KEYS_LOCALIZATION = gql`
query ($ids: [String]) {
  key {
    get (ids: $ids) {
      _id
      localization
    }
  }
}`

export const GET_KEYS_DATA = gql`
query ($ids: [String]) {
  key {
    get (ids: $ids) {
      _id
      localization
      schema
    }
  }
}`

export const GET_TEMPLATE_DATA = gql`
query ($id: String!) {
  template{
    get (id: $id) {
      keys {
        _id
        localization
        schema
      }
    }
  }
}`

export const GET_TEMPLATE = gql`
query ($id: String!) {
  template {
    get (id: $id) {
      name
      payload
    }
  }
}`

export const UPDATE_TEMPLATE = gql`
mutation ($id: String!, $name: String!, $payload: JSON!) {
  template { update (id: $id, name: $name, payload: $payload) }
}
`

export const UPDATE_KEY_LOCALIZATION = gql`
mutation ($key: String!, $value: String!) {
  key { setLocalization(key: $key, lang: "zh-CN", value: $value) }
}
`

export const UPDATE_KEY_META = gql`
mutation ($key: String!, $value: JSON!) {
  key { setMeta(key: $key, meta: $value) }
}
`

export const getLocalizations = (obj: any) => {
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const [localizations, setLocalizations] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!obj) return
    client.query({ query: GET_KEYS_LOCALIZATION, variables: { ids: Object.keys(obj) } })
      .then(({ error, data }) => {
        if (error) throw error
        const localizations: Record<string, string> = { }
        data.key.get.forEach((it: any) => (localizations[it._id] = it.localization['zh-CN']))
        setLocalizations(localizations)
      })
      .catch(e => {
        console.error(e)
        enqueueSnackbar('获取数据失败!', { variant: 'error' })
      })
  }, [obj])
  return localizations
}
