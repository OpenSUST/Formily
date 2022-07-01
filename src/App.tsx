import React from 'react'
import AppBar from './components/AppBar'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import fields from './components/fields'

import image from './image1.jpg'

const data = {
  name: '彩绘骆驼',
  考古信息: { type: 'Text', value: '1978 年在陕西陇县神泉村出土的唐代彩绘骆驼' },
  保存信息: { type: 'Text', value: '保存在陇县博物馆库房。彩绘骆驼脖子位置处有一圈白色装饰层，头部以及背部覆盖厚厚一层尘土，出现描绘和装饰的灰黑色物质以及少量的红色颜料层，腹部的白色打底层上有道黑色弧线，胎体疏松多孔，粉状颗粒物不断脱落；彩绘陶马表面颜料层完全脱落、整体支撑强度较低，现已无法站立。实验采集红色、白色和黑色颜料以及样品胎体呈层状或颗粒状粉化剥落物进行性能分析。' },
  资料图片: { type: 'Image', value: ['https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=164&h=164&fit=crop&auto=format&dpr=2', 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=164&h=164&fit=crop&auto=format&dpr=2', 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=242&h=121&fit=crop&auto=format&dpr=2', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=242&h=242&fit=crop&auto=format&dpr=2'] },
  一个表格: { type: 'LiveOffice', value: 'http://switch.apisium.cn/333.xlsx' }
}

function App () {
  const { name, ...others } = data

  return (
    <>
      <AppBar />
      <Container sx={{ mt: 4 }} maxWidth='xl'>
        <Grid container spacing={4} sx={{ flexDirection: { xs: 'column', md: 'row-reverse' } }}>
          <Grid item xs={4} sx={{ maxWidth: '300px' }}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar aria-label='recipe'>
                    R
                  </Avatar>
                }
                action={
                  <IconButton aria-label='settings'>
                    <MoreVertIcon />
                  </IconButton>
                }
                title='中科大 张教授'
                subheader='编辑于三天前'
              />
              <CardMedia
                component='img'
                height='200'
                image={image}
                alt='sss'
              />
              <CardContent>
                <Typography variant='body2' color='text.secondary'>
                  一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，一个简单的陶器，
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item sx={{ flex: '1', width: 0 }}>
            <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>{name}</Typography>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableBody>
                {Object.entries(others).map(([key, value], i) => {
                  const ViewComponent = ((fields as any)[value.type] || fields.Text).ViewComponent
                  return (
                    <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& th': { width: 120 }, '& th, & td': { verticalAlign: 'top' } }}>
                      <TableCell component='th' scope='row'>{key}</TableCell>
                      <TableCell><ViewComponent value={value.value} /></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default App
