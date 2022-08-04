import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
// import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { openDialog } from './EnsureDialog'
import { FavoriteType } from '../types'
import { isLogin } from '../api'
import { useNavigate } from 'react-router-dom'
import { gql, useApolloClient } from '@apollo/client'
import { useSnackbar } from 'notistack'

const ItemCard: React.FC<{ image: string, title: string, description: string, id: string }> = ({ image, title, description, id }) => {
  const navigate = useNavigate()
  const [isFavorite, setFavorite] = useState(() => {
    const data = JSON.parse(localStorage.getItem('favorites') || '{}')
    const res = id in data
    if (res) {
      data[id] = { title, image, description }
      localStorage.setItem('favorites', JSON.stringify(data))
    }
    return res
  })
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        action={
          <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        }
        title={title}
      />
      {image && (
        <CardMedia
          component='img'
          height='200'
          image={image}
          alt={title}
        />
      )}
      <CardContent>
        <Typography variant='body2' color='text.secondary'>{description}</Typography>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(undefined)}
      >
        {isLogin && (
          <MenuItem
            onClick={() => {
              setAnchorEl(undefined)
              navigate('/update/' + id)
            }}
          >
            编辑
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setFavorite(!isFavorite)
            const obj = JSON.parse(localStorage.getItem('favorites') || '{}') as Record<string, FavoriteType>
            if (isFavorite) delete obj[id]
            else obj[id] = { title, image, description }
            localStorage.setItem('favorites', JSON.stringify(obj))
          }}
        >
          {isFavorite ? '取消收藏' : '收藏'}
        </MenuItem>
        {isLogin && (
          <MenuItem
            onClick={async () => {
              setAnchorEl(undefined)
              const confirm = await openDialog('确定要删除项目?')
              if (!confirm) return
              client.mutate({
                mutation: gql`mutation ($id: String!){ item{ del(id: $id) } }`,
                variables: { id }
              }).then(res => {
                if (res.errors) throw res.errors[0]
                enqueueSnackbar('删除成功', { variant: 'success' })
              }).catch(e => {
                enqueueSnackbar(e.message, { variant: 'error' })
              })
            }}
          >
            <Typography color='error'>删除</Typography>
          </MenuItem>
        )}
      </Menu>
    </Card>
  )
}

export default ItemCard
