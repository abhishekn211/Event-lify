// src/pages/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Grid, Card, CardContent, Avatar, Chip, Divider, IconButton } from '@mui/material';
import { CalendarToday, LocationOn, People, Share, Favorite, FavoriteBorder, Edit, PlayArrow, PersonAdd, PersonRemove } from '@mui/icons-material';
import { useAuth } from '../context/AuthProvider';
import dayjs from 'dayjs';
import socket from '../socket';
import Navbar from '../components/Navbar';
import QnaChat from '../components/QnaChat';
import { getEventDetailsAPI, registerForEvent, deregisterFromEvent } from '../../helpers/apiCommunicators';

const pulseAnimation = {
  '@keyframes pulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
    '70%': { boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
  },
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      const result = await getEventDetailsAPI(id);
      if (result.error) {
        setError(result.error);
      } else {
        setEvent(result.event);
        setLiveCount(result.liveCount || 0);
      }
      setLoading(false);
    };
    fetchEventDetails();
  }, [id, authUser]);

  useEffect(() => {
    socket.emit("subscribeAttendance", id, (data) => {
      if (data && data.eventId === id) setLiveCount(data.attendance);
    });
    const attendanceListener = (data) => {
      if (data.eventId === id) setLiveCount(data.attendance);
    };
    socket.on("attendanceUpdate", attendanceListener);
    return () => {
      socket.off("attendanceUpdate", attendanceListener);
    };
  }, [id]);

  const isRegistered = authUser && event?.registered_users?.some(regId => String(regId) === String(authUser._id));
  
  // KEY CHANGE: Corrected the check for the event creator.
  const isCreator = authUser && event && event.creator && String(event.creator._id) === String(authUser._id);
  
  const eventDateTime = event ? dayjs(event.date).hour(parseInt(event.time.split(':')[0], 10)).minute(parseInt(event.time.split(':')[1], 10)) : null;
  const isLiveEvent = eventDateTime ? dayjs().isAfter(eventDateTime) && dayjs().isBefore(eventDateTime.add(1, 'hour')) : false;
  const isPastEvent = eventDateTime ? dayjs().isAfter(eventDateTime.add(1, 'hour')) : false;

  const handleRegisterAction = async (action) => {
    if (!authUser) {
      navigate('/login', { replace: true });
      return;
    }
    setRegisterLoading(true);
    setRegisterError(null);
    const result = await action(id);
    if (result.error) {
      setRegisterError(result.error);
    } else {
      const updatedResult = await getEventDetailsAPI(id);
      if (updatedResult.event) setEvent(updatedResult.event);
    }
    setRegisterLoading(false);
  };

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({ title: event.title, text: event.description, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => setIsFavorited(!isFavorited);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error">{error || "Event not found."}</Typography>
        </Container>
      </>
    );
  }

  const ActionButtonBlock = () => {
    if (isPastEvent) {
      return (
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary" mb={2}>This event has ended</Typography>
          <Button variant="outlined" fullWidth disabled sx={{ py: 2, borderRadius: '12px' }}>Event Ended</Button>
        </Box>
      );
    }
    
    // KEY CHANGE: Updated logic for the event creator's view.
    if (isCreator) {
      return (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={3}>Manage Your Event</Typography>
          {isLiveEvent ? (
            <Button variant="outlined" fullWidth startIcon={<PlayArrow />} onClick={() => navigate(`/events/${id}/live`)} sx={{ borderColor: '#16a34a', color: '#16a34a', '&:hover': { borderColor: '#15803d', bgcolor: 'rgba(22, 163, 74, 0.04)' }, py: 2, borderRadius: '12px' }}>
              View Live Event
            </Button>
          ) : (
            <Button variant="contained" fullWidth startIcon={<Edit />} onClick={() => navigate(`/events/${id}/edit`)} sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, py: 2, borderRadius: '12px' }}>
              Edit Event
            </Button>
          )}
        </Box>
      );
    }
    
    if (isLiveEvent) {
      return (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2} color="#16a34a">🔴 Event is Live!</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>{liveCount} people are currently watching</Typography>
          <Button variant="contained" fullWidth startIcon={<PlayArrow />} onClick={() => navigate(`/events/${id}/live`)} sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, py: 2, borderRadius: '12px' }}>Join Live Event</Button>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={3}>{isRegistered ? "You're registered!" : 'Join this event'}</Typography>
        {registerError && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{registerError}</Typography>}
        {isRegistered ? (
          <Button variant="outlined" fullWidth startIcon={<PersonRemove />} onClick={() => handleRegisterAction(deregisterFromEvent)} disabled={registerLoading} sx={{ borderColor: '#dc2626', color: '#dc2626', '&:hover': { borderColor: '#b91c1c', bgcolor: 'rgba(220, 38, 38, 0.04)' }, py: 2, borderRadius: '12px' }}>
            {registerLoading ? <CircularProgress size={24} color="inherit" /> : 'Unregister'}
          </Button>
        ) : (
          <Button variant="contained" fullWidth startIcon={<PersonAdd />} onClick={() => handleRegisterAction(registerForEvent)} disabled={registerLoading} sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, py: 2, borderRadius: '12px' }}>
            {registerLoading ? <CircularProgress size={24} color="inherit" /> : 'Register for Event'}
          </Button>
        )}
      </Box>
    );
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#F8FAFC' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ height: { xs: 250, md: 400 }, backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${event.coverimage || '/heavy-encaustic-paint-background.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              {isLiveEvent && (
                <Box sx={{ position: 'absolute', top: 20, left: 20, bgcolor: '#dc2626', color: 'white', px: 2, py: 0.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite', ...pulseAnimation }} />
                  LIVE • {liveCount} watching
                </Box>
              )}
              <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1 }}>
                <IconButton onClick={handleFavorite} sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', '&:hover': { bgcolor: 'white' } }}>
                  {isFavorited ? <Favorite sx={{ color: '#dc2626' }} /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare} sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', '&:hover': { bgcolor: 'white' } }}>
                  <Share />
                </IconButton>
              </Box>
              <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
                <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.75rem' } }}>
                  {event.title}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip label={event.category} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 'medium' }} />
                  <Chip label={`${event.registered_users?.length || 0} attendees`} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 'medium' }} />
                </Box>
              </Box>
            </Box>
          </Card>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Typography variant="h5" fontWeight="bold" mb={2}>About This Event</Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3, color: '#334155' }}>{event.description}</Typography>
                  <Divider sx={{ my: 3 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" gap={2}><CalendarToday sx={{ color: '#dc2626' }} /><Box><Typography variant="body2" color="text.secondary">Date & Time</Typography><Typography variant="body1" fontWeight="medium">{dayjs(event.date).format('MMMM DD, YYYY')} at {event.time}</Typography></Box></Box></Grid>
                    <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" gap={2}><LocationOn sx={{ color: '#dc2626' }} /><Box><Typography variant="body2" color="text.secondary">Location</Typography><Typography variant="body1" fontWeight="medium">{event.location}</Typography></Box></Box></Grid>
                    <Grid item xs={12} sm={6}><Box display="flex" alignItems="center" gap={2}><People sx={{ color: '#dc2626' }} /><Box><Typography variant="body2" color="text.secondary">Attendees</Typography><Typography variant="body1" fontWeight="medium">{event.registered_users?.length || 0} people registered</Typography></Box></Box></Grid>
                  </Grid>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Organized by</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 60, height: 60, bgcolor: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {event.creator && event.creator.name ? event.creator.name.charAt(0).toUpperCase() : 'O'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">{event.creator && event.creator.name ? event.creator.name : 'Event Organizer'}</Typography>
                      <Typography variant="body2" color="text.secondary">Event Creator</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <QnaChat 
                initialQuestions={event.qna} 
                eventCreatorId={event.creator?._id} 
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', position: 'sticky', top: 100 }}>
                <CardContent sx={{ p: 3 }}>
                  <ActionButtonBlock />
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>Event Stats</Typography>
                    <Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="body2">Registered</Typography><Typography variant="body2" fontWeight="medium">{event.registered_users?.length || 0}</Typography></Box>
                    {isLiveEvent && <Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="body2">Live Now</Typography><Typography variant="body2" fontWeight="medium" color="#16a34a">{liveCount}</Typography></Box>}
                    <Box display="flex" justifyContent="space-between"><Typography variant="body2">Category</Typography><Typography variant="body2" fontWeight="medium">{event.category}</Typography></Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
