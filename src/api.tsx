import { gql } from '@apollo/client'

export const token = localStorage.getItem('token') || ''
export const username = localStorage.getItem('username') || ''
export const isAdmin = localStorage.getItem('isAdmin') === 'true'
export const isLogin = !!token

export const GET_DATA = gql`
query Request ($id: String!) {
  item {
    get (id: $id) {
      items
      schema
    }
  }
}
`

export const UPDATE_DATA = gql`
query Request ($id: String!, $set: JSON!) {
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
    add (username: $username, password: $password, roles: [ADMIN,USER])
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
    search (name: "*") {
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
query {
  template {
    add (name: "新建模板", payload: "")
  }
}`

export const DELETE_TEMPLATE = gql`
query Request ($id: String!) {
  template {
    del (id: $id)
  }
}`
