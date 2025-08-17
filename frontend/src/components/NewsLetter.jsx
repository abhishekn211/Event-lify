// src/components/Newsletter.jsx
import React from 'react';
import { Box, Typography, TextField, Button, Container } from '@mui/material';

const Newsletter = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Newsletter subscription submitted');
  };

  return (
    <Box sx={{  py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            px: 2
          }}
        >
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 700, 
              color: '#1E293B',
              fontSize: { xs: '1.75rem', sm: '2.25rem' }
            }}
          >
            Never Miss an Event!
          </Typography>
          <Typography 
            sx={{ 
              mt: 1, 
              mb: 4,
              maxWidth: '500px',
              color: '#64748B',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Subscribe to get the latest updates on new events, special offers, and exclusive discounts delivered right to your inbox.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 0 },
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              type="email"
              placeholder="Enter your email address"
              required
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderTopRightRadius: { sm: 0 },
                  borderBottomRightRadius: { sm: 0 },
                  borderRadius: '12px',
                  backgroundColor: 'white',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                py: 1.5,
                px: { xs: 4, sm: 6 },
                backgroundColor: '#B91C1C',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: { xs: '12px', sm: '0 12px 12px 0' },
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#991B1B' },
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Newsletter;
