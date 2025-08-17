// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, CircularProgress, Grid, Card, CardContent, Avatar, Chip, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Edit, Delete, Visibility, Event as EventIcon, PeopleAlt, BarChart } from '@mui/icons-material';
import { useAuth } from '../context/AuthProvider';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';
import { getCreatedEvents, deleteEvent } from '../../helpers/apiCommunicators';

// Helper to determine event status
const getEventStatus = (event) => {
  const eventDateTime = dayjs(event.date).hour(parseInt(event.time.split(':')[0], 10)).minute(parseInt(event.time.split(':')[1], 10));
  const isLive = dayjs().isAfter(eventDateTime) && dayjs().isBefore(eventDateTime.add(1, 'hour'));
  const isPast = dayjs().isAfter(eventDateTime.add(1, 'hour'));

  if (isLive) return { text: 'Live', color: 'success' };
  if (isPast) return { text: 'Past', color: 'default' };
  return { text: 'Upcoming', color: 'primary' };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0, upcomingEvents: 0 });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const result = await getCreatedEvents();
    if (result.error) {
      setError(result.error);
    } else {
      setEvents(result.events);
      // Calculate stats
      const totalEvents = result.events.length;
      const totalAttendees = result.events.reduce((acc, event) => acc + event.registered_users.length, 0);
      const upcomingEvents = result.events.filter(event => getEventStatus(event).text === 'Upcoming').length;
      setStats({ totalEvents, totalAttendees, upcomingEvents });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authUser) {
      fetchDashboardData();
    }
  }, [authUser]);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      const result = await deleteEvent(eventToDelete._id);
      if (result.error) {
        setError(result.error);
      } else {
        // Refresh data after deletion
        fetchDashboardData();
      }
      setEventToDelete(null);
    }
    setOpenDeleteDialog(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error">{error}</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 70px)' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#dc2626', fontSize: '2rem' }}>
              {authUser?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">Welcome, {authUser?.name}!</Typography>
              <Typography variant="body1" color="text.secondary">Here's your event dashboard.</Typography>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6' }}><EventIcon /></Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{stats.totalEvents}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Events Created</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#F0FDF4', color: '#22C55E' }}><PeopleAlt /></Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{stats.totalAttendees}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Registrations</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#FEFCE8', color: '#EAB308' }}><BarChart /></Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{stats.upcomingEvents}</Typography>
                    <Typography variant="body2" color="text.secondary">Upcoming Events</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Events Table */}
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Your Events</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Event Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Registrations</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <TableRow key={event._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="medium">{event.title}</Typography>
                      </TableCell>
                      <TableCell>{dayjs(event.date).format('MMM DD, YYYY')}</TableCell>
                      <TableCell align="center">{event.registered_users.length}</TableCell>
                      <TableCell align="center">
                        <Chip label={status.text} color={status.color} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Event">
                          <IconButton onClick={() => navigate(`/events/${event._id}`)}><Visibility /></IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Event">
                          <IconButton onClick={() => navigate(`/events/${event._id}/edit`)}><Edit /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Event">
                          <IconButton onClick={() => handleDeleteClick(event)} color="error"><Delete /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event "{eventToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
