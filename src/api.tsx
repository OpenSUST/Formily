import { gql } from '@apollo/client'

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
query{
  user {
    count
  }
  item {
    count
  }
}`
