// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { Box, Button, Typography, Divider, Grid, CircularProgress, Container } from '@mui/material';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';
import Newsletter from '../components/NewsLetter'; // <-- 1. Import the new component
import { getAllEvents } from '../../helpers/apiCommunicators';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['All', 'Technology', 'Music', 'Sports', 'Art', 'Food', 'Travel', 'Health'];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const result = await getAllEvents();
      if (result.error) {
        setError(result.error);
      } else {
        setAllEvents(result.events);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = React.useMemo(() => allEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [allEvents, searchTerm, selectedCategory]);

  const now = dayjs();
  const getEventDateTime = (event) => {
    const datePart = dayjs(event.date);
    const [hourStr, minuteStr] = event.time.split(':');
    return datePart.hour(parseInt(hourStr)).minute(parseInt(minuteStr));
  };

  
  // Memoize liveEvents
  const liveEvents = React.useMemo(() => {
    return filteredEvents.filter((event) => {
      const eventDateTime = getEventDateTime(event);
      // Your existing logic here
      return !now.isBefore(eventDateTime) && now.isBefore(eventDateTime.add(1, 'hour'));
    });
  }, [filteredEvents, now]); // Recalculates only when filteredEvents or now changes

  // Memoize upcomingEvents
  const upcomingEvents = React.useMemo(() => {
    return filteredEvents.filter((event) => {
      const eventDateTime = getEventDateTime(event);
      return now.isBefore(eventDateTime);
    });
  }, [filteredEvents, now]); // Recalculates only when filteredEvents or now changes

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <Box sx={{ minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 1, 
              color: '#1E293B',
              fontSize: { xs: '2.5rem', sm: '3rem' } 
            }}
          >
            Find Your Next Experience
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              justifyContent: 'center', 
              mb: { xs: 4, md: 5 },
              mt: 2
            }}
          >
            {categories.map((cat) => (
              <Button 
                key={cat} 
                size="small" 
                variant={selectedCategory === cat || (cat === 'All' && !selectedCategory) ? 'contained' : 'outlined'} 
                onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)} 
                sx={{ 
                  borderRadius: '20px', 
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 600, 
                  backgroundColor: selectedCategory === cat || (cat === 'All' && !selectedCategory) ? '#B91C1C' : 'white', 
                  borderColor: '#E2E8F0', 
                  color: selectedCategory === cat || (cat === 'All' && !selectedCategory) ? 'white' : '#475569', 
                  '&:hover': { 
                    backgroundColor: selectedCategory === cat || (cat === 'All' && !selectedCategory) ? '#991B1B' : '#F1F5F9' 
                  } 
                }}
              >
                {cat}
              </Button>
            ))}
          </Box>

          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}
          {error && <Typography color="error" align="center" sx={{ py: 6 }}>{error}</Typography>}

          {!loading && !error && (
            <>
              {liveEvents.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#1E293B' }}>Live Now</Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {liveEvents.map((event) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}><EventCard event={event} /></Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {upcomingEvents.length > 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#1E293B' }}>Upcoming Events</Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    {upcomingEvents.map((event) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}><EventCard event={event} /></Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {filteredEvents.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="#64748B">No events found</Typography>
                    <Typography color="#94A3B8">Try adjusting your filters or search term.</Typography>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
      
      {/* 2. Place the Newsletter component here */}
      <Newsletter />
    </>
  );
}