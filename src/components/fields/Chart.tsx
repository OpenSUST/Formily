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
    const [option, events] = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const events: Record<string, Function> = { }
      try {
        return [meta.extraData
          // eslint-disable-next-line no-eval
          ? eval(`(function (data, events) { ${meta.extraData.includes('return ') ? meta.extraData : 'return ' + meta.extraData}; })`)(value.replace(/\r/g, '').split('\n').map(it => it.split(',')), events)
          : JSON.parse(value.endsWith(',') ? value.slice(0, -1) : value), events]
      } catch (err) {
        console.error(err)
        return [{}, events]
      }
    }, [value, meta])
    return (
      <div style={{ width: '100%' }}>
        <ReactECharts option={option} onEvents={events} />
      </div>
    )
  },
  EditorComponent: CSV.EditorComponent
}

export default components
