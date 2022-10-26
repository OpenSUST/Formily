/* eslint-disable react/prop-types */
import React, { useMemo } from 'react'
import Field, { createSchema } from './Field'
import CSV from './CSV'
import ReactECharts from 'echarts-for-react'

const components: Field<string> = {
  name: '图表',
  hasExtraData: true,
  schema: createSchema('chart'),
  getDefaultValue () { return '' },
  isEmpty (value) { return !value.length },
  ViewComponent ({ value, meta }) {
    const option = useMemo(() => {
      try {
        return meta.extraData
          // eslint-disable-next-line no-eval
          ? eval(`(function (data) { ${meta.extraData.includes('return') ? meta.extraData : 'return ' + meta.extraData} })`)(value.replace(/\r/g, '').split('\n').map(it => it.split(',')))
          : JSON.parse(value.endsWith(',') ? value.slice(0, -1) : value)
      } catch (err) {
        console.error(err)
        return {}
      }
    }, [value, meta])
    return (
      <div style={{ width: '100%' }}>
        <ReactECharts option={option} />
      </div>
    )
  },
  EditorComponent: CSV.EditorComponent
}

export default components
