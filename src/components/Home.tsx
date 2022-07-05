import React, { useState } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import SearchIcon from '@mui/icons-material/Search'
import { GET_ALL_COUNT } from '../api'

import { useQuery } from '@apollo/client'

const Home: React.FC = () => {
  const [value, setValue] = useState('')
  const { data } = useQuery(GET_ALL_COUNT)

  return (
    <>
      <Box
        sx={{
          background: 'url(https://api.oneneko.com/v1/bing_today) no-repeat center',
          backgroundSize: 'cover',
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px',
          backgroundAttachment: 'fixed'
        }}
      >
        <Typography variant='h2' sx={{ mt: '-18vh', mb: 3, color: '#fff', fontWeight: 'bold' }}>LOGO</Typography>
        <Autocomplete
          freeSolo
          disableClearable
          options={[]}
          onInputChange={(_, val) => setValue(val)}
          inputValue={value}
          sx={{
            maxWidth: 500,
            width: '100%',
            '& .MuiInputLabel-root': { borderRadius: '4px' },
            '& .MuiInputBase-root, & .MuiInputLabel-root': { backgroundColor: theme => theme.palette.background.default }
          }}
          renderInput={params => (
            <TextField
              {...params}
              label='搜索...'
              InputProps={{
                endAdornment: value
                  ? (
                    <InputAdornment position='end'>
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                    )
                  : undefined
              }}
            />
          )}
        />
        <Typography variant='overline' sx={{ mt: 0.5 }}>在上面输入内容以搜索...</Typography>
      </Box>
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
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mt: 1 }}>总条目数</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center', borderRight: { sm: '1px solid #eee' } }}>
              <Typography variant='h3' color='primary' sx={{ fontWeight: 'bold' }}>{data?.user?.count || 0}</Typography>
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mt: 1 }}>总用户数</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography variant='h3' color='primary' sx={{ fontWeight: 'bold' }}>100h+</Typography>
              <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mt: 1 }}>运行时间</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ backgroundColor: theme => theme.palette.background.default, textAlign: 'center', padding: '30px 0' }}>
        Copyright © 2022 Shaanxi University of Science & Technology.
      </Box>
    </>
  )
}

export default Home
