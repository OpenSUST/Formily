/* eslint-disable react/prop-types */
import React from 'react'
import Field, { createSchema } from './Field'

const components: Field<string> = {
  name: '标题',
  schema: createSchema('title'),
  getDefaultValue () { return '' },
  isEmpty () { return false },
  ViewComponent () {
    return <></>
  },
  EditorComponent () {
    return <></>
  }
}

export default components
