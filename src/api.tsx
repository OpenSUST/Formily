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
