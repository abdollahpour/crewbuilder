import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

export default function Dashboard() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Welcome to your dashboard.
      </Typography>
      <Box>
        <Button variant="contained" onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </Button>
      </Box>
    </>
  )
}
