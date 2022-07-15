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
import { FavoriteType } from '../types'
import { isAdmin } from '../api'
import { useNavigate } from 'react-router-dom'

const ItemCard: React.FC<{ image: string, title: string, description: string, id: string }> = ({ image, title, description, id }) => {
  const navigate = useNavigate()
  const [isFavorite, setFavorite] = useState(() => id in JSON.parse(localStorage.getItem('favorites') || '{}'))
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  return (
    <Card>
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
        {isAdmin && (
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
      </Menu>
    </Card>
  )
}

export default ItemCard
