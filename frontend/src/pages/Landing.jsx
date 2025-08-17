// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Button, Typography, Box, Container, Grid, Card, CardContent, Avatar, AppBar, Toolbar } from '@mui/material';
import { ArrowForward, Event, People, Schedule } from '@mui/icons-material';

const backgroundImages = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80"
];

const features = [
    {
      icon: Event,
      title: "Create Events",
      description: "Easily create and manage your events with our intuitive interface"
    },
    {
      icon: People,
      title: "Connect People",
      description: "Bring people together and build amazing communities"
    },
    {
      icon: Schedule,
      title: "Live Tracking",
      description: "Real-time attendance tracking and live event updates"
    }
];

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { authUser } = useAuth();

  useEffect(() => {
    // Preload images
    backgroundImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
        <Container maxWidth="lg" className='mt-6'>
          <Toolbar disableGutters>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logobg.png" alt="EventLify" style={{ height: 78 }} />
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            {authUser ? (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button component={Link} to="/home" sx={{ color: 'white', fontWeight: 'medium' }}>Explore Events</Button>
                    <Button component={Link} to="/my-bookings" variant="contained" sx={{ bgcolor: '#B91C1C', '&:hover': { bgcolor: '#991B1B' }, borderRadius: '20px' }}>
                        My Bookings
                    </Button>
                 </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button component={Link} to="/home" sx={{ color: 'white', fontWeight: 'medium' }}>Browse Events</Button>
                    <Button component={Link} to="/login" sx={{ color: 'white', fontWeight: 'medium' }}>Login</Button>
                    <Button component={Link} to="/signup" variant="contained" sx={{ bgcolor: '#B91C1C', '&:hover': { bgcolor: '#991B1B' }, borderRadius: '20px' }}>
                        Sign Up
                    </Button>
                </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* Background Images */}
        {backgroundImages.map((src, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute', inset: 0, transition: 'opacity 1s ease-in-out',
              opacity: index === currentIndex ? 1 : 0,
              backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
            }}
          />
        ))}
        {/* Overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4))' }} />
        {/* Content */}
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', px: 4, color: 'white' }}>
          <Typography variant="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' }, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Discover Amazing <Box component="span" sx={{ color: '#F87171' }}>Events</Box>
          </Typography>
          <Typography sx={{ mt: 3, maxWidth: '600px', fontSize: '1.25rem' }}>
            {authUser ? `Welcome back, ${authUser?.name || 'friend'}! Let's discover what's next.` : "Create, discover, and join incredible events in your area. Connect with like-minded people and make memories that last."}
          </Typography>
          <Box sx={{ mt: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button component={Link} to={authUser ? "/home" : "/signup"} variant="contained" size="large" endIcon={<ArrowForward />} sx={{ bgcolor: '#B91C1C', '&:hover': { bgcolor: '#991B1B' }, borderRadius: '20px', px: 4, py: 1.5 }}>
              {authUser ? "Explore Events" : "Get Started"}
            </Button>
            <Button component={Link} to={authUser ? "/my-bookings" : "/home"} variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: '20px', px: 4, py: 1.5 }}>
              {authUser ? "My Bookings" : "Browse Events"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box component="section" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Why Choose EventLify?</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              We make event management simple, engaging, and effective for everyone.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ textAlign: 'center', p: 3, borderRadius: 4, boxShadow: 'none', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.1)' } }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: '#FEE2E2', mx: 'auto', mb: 3 }}>
                      <Icon sx={{ fontSize: 32, color: '#DC2626' }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>{feature.title}</Typography>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box component="section" sx={{ py: 10, background: 'linear-gradient(to right, #DC2626, #B91C1C)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>Ready to Start Your Event Journey?</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
            Join thousands of event creators and attendees who trust EventLify.
          </Typography>
          <Button component={Link} to="/signup" variant="contained" size="large" endIcon={<ArrowForward />} sx={{ bgcolor: 'white', color: '#B91C1C', '&:hover': { bgcolor: '#F3F4F6' }, borderRadius: '20px', px: 4, py: 1.5 }}>
            Create Your Account
          </Button>
        </Container>
      </Box>

      
    </Box>
  );
}
