import React, { useState } from 'react'

import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Collapse from '@mui/material/Collapse'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import SearchIcon from '@mui/icons-material/Search'
// import FavoriteIcon from '@mui/icons-material/Star'
import CardContent from '@mui/material/CardContent'
import { GET_ALL_COUNT, SEARCH } from '../api'
import { name, cover } from '../../config.json'

import { useQuery, useApolloClient } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { ItemType } from '../types'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [keyword, setKeyword] = useState('')
  const [searchData, setSearchData] = useState<ItemType[]>()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  // const [favorites, setFavorites] = useState<Record<string, FavoriteType>>(() => JSON.parse(localStorage.getItem('favorites') || '{}'))
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useQuery(GET_ALL_COUNT)

  const handleSearch = () => {
    setSearchData(undefined)
    client.query({ query: SEARCH, variables: { keyword } }).then(({ error, data }) => {
      if (error) throw error
      setSearchData(data.item.search.items)
    }).catch(e => {
      console.error(e)
      enqueueSnackbar('搜索发生错误!', { variant: 'error' })
    })
  }

  return (
    <>
      <Box
        sx={{
          background: 'no-repeat center',
          backgroundImage: searchData ? undefined : `url(${cover || 'https://api.oneneko.com/v1/bing_today'})`,
          backgroundSize: 'cover',
          minHeight: searchData ? undefined : '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px 100px',
          transition: '.3s',
          paddingTop: searchData ? 0 : '100px',
          backgroundAttachment: 'fixed'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: '.3s',
            position: searchData ? 'fixed' : undefined,
            top: theme => theme.spacing(2),
            left: 0,
            right: 0,
            zIndex: 1,
            pb: searchData ? 2 : 0,
            backdropFilter: searchData ? 'blur(6px)' : undefined
          }}
        >
          {searchData
            ? <Toolbar />
            : <Typography variant='h2' sx={{ mt: '-18vh', mb: 3, color: '#fff', fontWeight: 'bold', WebkitTextStroke: '1px #000' }}>{name}</Typography>}
          <Autocomplete
            freeSolo
            disableClearable
            options={[]}
            onInputChange={(_, val) => setKeyword(val)}
            inputValue={keyword}
            sx={{
              maxWidth: 700,
              width: '100%',
              '& .MuiInputLabel-root': { borderRadius: '4px' },
              '& .MuiInputBase-root, & .MuiInputLabel-root': { backgroundColor: theme => theme.palette.background.default }
            }}
            onKeyDown={(event: any) => {
              if (event.key === 'Enter') {
                event.defaultMuiPrevented = true
                handleSearch()
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label='搜索...'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Box>
        <Collapse in={!!searchData} sx={{ width: '100%', maxWidth: 700, marginTop: searchData ? '90px' : undefined }}>
          <Card sx={{ mt: 1 }}>
            {searchData?.length
              ? (
                <>
                  <List>
                    {searchData.map((it, i) => (
                      <React.Fragment key={it._id}>
                        {i ? <Divider /> : undefined}
                        <ListItem
                          disablePadding
                          alignItems='flex-start'
                          sx={{ minHeight: 72, alignItems: 'center' }}
                          secondaryAction={
                            <Checkbox
                              edge='start'
                              checked={selectedItems[0] === it._id || selectedItems[1] === it._id}
                              tabIndex={-1}
                              onChange={e => setSelectedItems(e.target.checked
                                ? [selectedItems[1], it._id]
                                : selectedItems[0] === it._id ? [selectedItems[1]] : [selectedItems[0]])}
                            />
                            // <IconButton
                            //   edge='end'
                            //   color={it._id in favorites ? 'warning' : undefined}
                            //   onClick={() => {
                            //     const obj = { ...favorites }
                            //     if (it._id in obj) delete (obj as any)[it._id]
                            //     else obj[it._id] = { title: it.title, image: it.images?.[0], description: it.description }
                            //     localStorage.setItem('favorites', JSON.stringify(obj))
                            //     setFavorites(obj)
                            //   }}
                            // >
                            //   <FavoriteIcon />
                            // </IconButton>
                          }
                        >
                          <ListItemButton onClick={() => navigate('/item/' + it._id)}>
                            <ListItemAvatar>
                              <Avatar alt={it.title} src={it.images?.[0]} variant='rounded'>{it.images?.[0] ? undefined : it.title?.[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={it.title}
                              secondary={it.description}
                              sx={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                  <Box sx={{ textAlign: 'right' }}>
                    <Button
                      disabled={!(selectedItems[0] && selectedItems[1])}
                      onClick={() => navigate(`/compare/${selectedItems[0]}/${selectedItems[1]}`)}
                    >
                      对比
                    </Button>
                  </Box>
                </>)
              : <CardContent>无结果</CardContent>}
          </Card>
        </Collapse>
        {!searchData && <Typography variant='overline' sx={{ mt: 0.5 }}>在上面输入内容以搜索...</Typography>}
      </Box>
      {!searchData && (
        <Box
          sx={{
            padding: 6,
            boxShadow: '0px -3px 3px -2px rgba(0, 0, 0, .15), 0px -3px 4px 0px rgba(0, 0, 0, .1), 0px -1px 8px 0px rgba(0, 0, 0, .09);'
          }}
        >
          <Container>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'center', borderRight: { sm: '1px solid #eee' } }}>
                <Typography variant='h3' color='primary' sx={{ fontWeight: 'bold' }}>{data?.item?.count || 0}</Typography>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mt: 1 }}>条目总数</Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'center', borderRight: { sm: '1px solid #eee' } }}>
                <Typography variant='h3' color='primary' sx={{ fontWeight: 'bold' }}>{data?.user?.count || 0}</Typography>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mt: 1 }}>用户总数</Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                <Typography variant='h3' color='primary' sx={{ fontWeight: 'bold' }}>{data?.key?.count || 0}</Typography>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mt: 1 }}>字段总数</Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}
      <Box sx={{ backgroundColor: theme => theme.palette.background.default, textAlign: 'center', padding: '30px 0' }}>
        Copyright © 2022 Shaanxi University of Science & Technology.
      </Box>
    </>
  )
}

export default Home
