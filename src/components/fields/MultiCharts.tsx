/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo } from 'react'
import Schema from 'schemastery'
import Pagination from '@mui/material/Pagination'
import MultiCSV from './MultiCSV'
import ReactECharts from 'echarts-for-react'
import Field, { createSchema } from './Field'

const components: Field<string[]> = {
  name: '多图表',
  hasExtraData: true,
  schema: createSchema('multiCharts', Schema.array(Schema.string())),
  getDefaultValue () { return [] },
  isEmpty (value) { return !value.length || (value.length === 1 && !value[0]) },
  ViewComponent ({ value, meta }) {
    if (!value.length) value = ['']
    const [index, setIndex] = useState(0)
    const [option, events] = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const events: Record<string, Function> = { }
      try {
        return [meta.extraData
          // eslint-disable-next-line no-eval
          ? eval(`(function (data, events) { ${meta.extraData.includes('return') ? meta.extraData : 'return ' + meta.extraData} })`)(value[index].replace(/\r/g, '').split('\n').map(it => it.split(',')), events)
          : JSON.parse(value[index].endsWith(',') ? value[index].slice(0, -1) : value[index]), events]
      } catch (err) {
        console.error(err)
        return [{}, events]
      }
    }, [value, meta, index])
    useEffect(() => {
      value![index].replace(/\r/g, '').split('\n').map(it => it.split(','))
    }, [index])
    return (
      <div style={{ width: '100%' }}>
        <ReactECharts option={option} onEvents={events} />
        <Pagination
          page={index + 1}
          count={value.length}
          onChange={(_, page) => setIndex(page - 1)}
        />
      </div>
    )
  },
  EditorComponent: MultiCSV.EditorComponent
}

export default components
