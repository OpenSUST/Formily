import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useNavigate } from 'react-router-dom'

const ItemCard: React.FC<{ image: string, title: string, description: string, id: string }> = ({ image, title, description, id }) => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            R
          </Avatar>
        }
        action={
          <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        }
        title='中科大 张教授'
        subheader='编辑于三天前'
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
        <MenuItem
          onClick={() => {
            setAnchorEl(undefined)
            navigate('/update/' + id)
          }}
        >
          编辑
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default ItemCard
