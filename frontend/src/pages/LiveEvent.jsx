// src/pages/LiveEvent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Typography, Container, Button, Box, Paper, Grid, Chip, Card, CardContent } from '@mui/material';
import { PlayArrow, Visibility, ExitToApp, People } from '@mui/icons-material';
import { useAuth } from '../context/AuthProvider';
import socket from '../socket';
import Navbar from '../components/Navbar';
import LiveChat from '../components/LiveChat';
import { getEventDetailsAPI } from '../../helpers/apiCommunicators';

const pulseAnimation = {
  '@keyframes pulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
    '70%': { boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
  },
};

export default function LiveEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [liveUsers, setLiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!authUser) {
      navigate('/login', { replace: true });
    }
  }, [authUser, navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      const result = await getEventDetailsAPI(id);
      if (result.event) {
        setEvent(result.event);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const attendanceListener = (data) => {
      if (data.eventId === id) {
        setLiveUsers(data.attendance);
      }
    };
    socket.on("attendanceUpdate", attendanceListener);
    
    socket.emit("subscribeAttendance", id, (data) => {
      if (data && data.eventId === id) {
        setLiveUsers(data.attendance);
      }
    });

    return () => {
      socket.off("attendanceUpdate", attendanceListener);
    };
  }, [id]);

  const handleEnterLiveEvent = () => {
    setLoading(true);
    socket.emit("joinEventRoom", id);
    setJoined(true);
    setLoading(false);
  };

  const handleExitLiveEvent = () => {
    socket.emit("leaveEventRoom", id);
    setJoined(false);
    navigate(`/events/${id}`, { replace: true });
  };
  
  useEffect(() => {
    // This effect ensures that when the user navigates away, they leave the socket room.
    return () => {
      if(joined) {
        socket.emit("leaveEventRoom", id);
      }
    }
  }, [id, joined]);

  if (loading || !event) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 70px)' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', p: { xs: 2, md: 3 }, borderRadius: '12px 12px 0 0' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite', ...pulseAnimation }} />
                  <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>LIVE EVENT</Typography>
                </Box>
                <Chip icon={<People />} label={`${liveUsers} watching`} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 'bold' }} />
              </Box>
            </Box>
          </Card>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', minHeight: 500, display: 'flex', flexDirection: 'column' }}>
                {!joined ? (
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
                    <Box sx={{ width: 150, height: 150, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)' }}>
                      <PlayArrow sx={{ fontSize: 80, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" mb={1}>Ready to Join?</Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>Click the button below to enter the live event experience.</Typography>
                    <Button variant="contained" size="large" startIcon={<PlayArrow />} onClick={handleEnterLiveEvent} disabled={loading} sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, px: 5, py: 1.5, borderRadius: 3, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none' }}>
                      {loading ? 'Joining...' : 'Join Live Event'}
                    </Button>
                  </CardContent>
                ) : (
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Paper elevation={0} sx={{ width: '100%', height: { xs: 250, sm: 450 }, backgroundColor: '#1E293B', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', p: 2 }}>
                      <Visibility sx={{ fontSize: 60, color: '#475569' }} />
                      <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>You're Live!</Typography>
                      <Typography color="text.secondary">Welcome to {event.title}</Typography>
                    </Paper>
                    <Box sx={{ p: 2, display: { xs: 'block', md: 'none' } }}>
                      <LiveChat />
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                {joined ? (
                  <Box sx={{ height: { md: 500 } }}>
                    <LiveChat />
                  </Box>
                ) : (
                  <>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', mb: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Live Statistics</Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="text.secondary">Current Viewers</Typography>
                          <Typography variant="h5" fontWeight="bold" color="#16a34a">{liveUsers}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">Your Status</Typography>
                          <Chip label="Not Joined" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 'medium' }} />
                        </Box>
                      </CardContent>
                    </Card>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
                            <Button fullWidth variant="outlined" onClick={() => navigate(`/events/${id}`)} sx={{ mb: 1.5, borderColor: '#CBD5E1', color: '#475569' }}>View Event Details</Button>
                            <Button fullWidth variant="outlined" onClick={() => navigate('/home')} sx={{ borderColor: '#CBD5E1', color: '#475569' }}>Explore Other Events</Button>
                        </CardContent>
                    </Card>
                  </>
                )}
                {joined && (
                  <Button fullWidth variant="outlined" color="error" startIcon={<ExitToApp />} onClick={handleExitLiveEvent} sx={{ mt: 2 }}>
                    Leave Event
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
