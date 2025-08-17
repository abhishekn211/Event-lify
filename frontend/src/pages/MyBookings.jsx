// src/pages/MyBookings.jsx
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { Container, Box, Typography, Grid, CircularProgress, Tabs, Tab } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthProvider';
import Navbar from '../components/Navbar';
import { getRegisteredEvents } from '../../helpers/apiCommunicators';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import UpcomingIcon from '@mui/icons-material/Upcoming'; // Corrected Icon import
import HistoryIcon from '@mui/icons-material/History';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MyBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { authUser } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (authUser) {
      const fetchRegisteredEvents = async () => {
        setLoading(true);
        const result = await getRegisteredEvents();
        if (result.error) {
          setError(result.error);
        } else {
          setRegisteredEvents(result.events);
        }
        setLoading(false);
      };
      fetchRegisteredEvents();
    }
  }, [authUser]);

  const filteredEvents = React.useMemo(() => 
    registeredEvents.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
  [registeredEvents, searchTerm]);

  const now = dayjs();
  const getEventDateTime = (event) => {
    if (!event?.time) return dayjs(event.date);
    const [hourStr, minuteStr] = event.time.split(':');
    return dayjs(event.date).hour(parseInt(hourStr, 10)).minute(parseInt(minuteStr, 10));
  };

  const liveEvents = filteredEvents.filter(event => {
    const eventDateTime = getEventDateTime(event);
    return !now.isBefore(eventDateTime) && now.isBefore(eventDateTime.add(1, 'hour'));
  });

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDateTime = getEventDateTime(event);
    return now.isBefore(eventDateTime);
  });

  const pastEvents = filteredEvents.filter(event => {
    const eventDateTime = getEventDateTime(event);
    return !now.isBefore(eventDateTime.add(1, 'hour'));
  });
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderEvents = (events, emptyMessage) => {
    if (events.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="#64748B">{emptyMessage}</Typography>
          <Typography color="#94A3B8">Check back here after you book an event!</Typography>
        </Box>
      );
    }
    return (
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {events.map(event => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Box sx={{ minHeight: 'calc(100vh - 70px)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center', mb: 3, color: '#1E293B', fontSize: { xs: '2.5rem', sm: '3rem' } }}>
            My Bookings
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab icon={<LiveTvIcon />} iconPosition="start" label="Live" />
              <Tab icon={<UpcomingIcon />} iconPosition="start" label="Upcoming" />
              <Tab icon={<HistoryIcon />} iconPosition="start" label="Past" />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ py: 8 }}>{error}</Typography>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                {renderEvents(liveEvents, "No events are live right now.")}
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {renderEvents(upcomingEvents, "You have no upcoming events.")}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {renderEvents(pastEvents, "You have no past events.")}
              </TabPanel>
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default MyBookings;
