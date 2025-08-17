// src/pages/CreateEvent.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Container, Grid, Paper, TextField, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert, Tabs, Tab, Card, CardMedia, CardContent, Chip, Avatar, Divider, Fab, IconButton
} from "@mui/material";
import {
  CalendarToday, LocationOn, PhotoCamera, Title, Visibility as VisibilityIcon, Close as CloseIcon
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { createEvent } from "../../helpers/apiCommunicators";

// --- Preview Components (unchanged) ---
const EventCardPreview = ({ eventData }) => {
  const { title, category, location, date, image } = eventData;
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : '/heavy-encaustic-paint-background.jpg'), [image]);

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)', transform: 'scale(0.95)', transformOrigin: 'top center' }}>
      <CardMedia
        component="div"
        sx={{
          paddingTop: '56.25%',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip label={category || "Category"} size="small" sx={{ backgroundColor: '#F59E0B1A', color: '#D97706', fontWeight: 'bold' }} />
          <Chip label="0 going" size="small" sx={{ backgroundColor: '#3B82F61A', color: '#2563EB', fontWeight: 'bold' }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            lineHeight: 1.3, minHeight: '2.6em', color: '#1E293B',
          }}
        >
          {title || "Your Event Title"}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CalendarToday sx={{ fontSize: 16, color: '#64748B' }} />
            <Typography variant="body2" color="#64748B">
              {date ? dayjs(date).format('MMM DD, YYYY') : "Date"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: '#64748B' }} />
            <Typography variant="body2" color="#64748B" noWrap>
              {location || "Event Location"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const EventDetailPagePreview = ({ eventData }) => {
  const { title, description, date, time, location, category, image } = eventData;
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : '/heavy-encaustic-paint-background.jpg'), [image]);

  return (
    <Box sx={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
      <Card sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', boxShadow: 'none' }}>
        <Box sx={{ height: 200, backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', p: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
              {title || "Your Event Title"}
            </Typography>
            <Chip label={category || "Category"} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', mt: 1 }} />
          </Box>
        </Box>
      </Card>
      <Card sx={{ borderRadius: 3, boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>About This Event</Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap', minHeight: '60px' }}>
            {description || "Your event description will appear here. Write something engaging to attract attendees!"}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <CalendarToday sx={{ color: '#dc2626' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                  <Typography fontWeight="medium">{date ? dayjs(date).format('MMMM DD, YYYY') : 'Date'} at {time || 'Time'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <LocationOn sx={{ color: '#dc2626' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography fontWeight="medium">{location || 'Location'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// --- Main Create Event Component ---
export default function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", date: "", time: "", location: "", category: "", image: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const categories = ["Technology", "Music", "Sports", "Art", "Food"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date, time, image } = formData;

    const eventDateTime = dayjs(`${date} ${time}`);
    if (date && time && !eventDateTime.isAfter(dayjs())) {
      setError("Please select a future date and time for the event.");
      return;
    }
    if (!image) {
      setError("A cover image is required.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });

    setLoading(true);
    setError(null);
    const result = await createEvent(data);
    setLoading(false);

    if (result.error) setError(result.error);
    else navigate("/my-bookings");
  };

  // --- Preview Panel ---
  const PreviewPanel = ({ isMobile = false }) => (
    <Box sx={{ position: 'sticky', top: 100 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
          Live Preview
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setShowMobilePreview(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Paper sx={{ borderRadius: 4, p: 2.5, bgcolor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs value={previewTab} onChange={(e, newValue) => setPreviewTab(newValue)} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Card Preview" />
          <Tab label="Page Preview" />
        </Tabs>
        {previewTab === 0 && <EventCardPreview eventData={formData} />}
        {previewTab === 1 && <EventDetailPagePreview eventData={formData} />}
      </Paper>
    </Box>
  );

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh', bgcolor: '#F9FAFB' }}>

        {/* --- Left Column: Form --- */}
        <Box sx={{
          width: { xs: '100%', md: '55%' },
          bgcolor: 'white',
          overflowY: 'auto',
          px: { xs: 2, sm: 4, md: 6 }, // more left/right padding
          display: { xs: showMobilePreview ? 'none' : 'block', md: 'block' }
        }}>
          <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 1, color: '#1E293B' }}>Create Your Event</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Fill in the details below to get started.</Typography>

              <Section icon={<Title />} title="Event Details">
                <TextField fullWidth required label="Event Title" name="title" value={formData.title} onChange={handleInputChange} />
                <TextField fullWidth required multiline rows={5} label="Description" name="description" value={formData.description} onChange={handleInputChange} helperText="Describe your event in detail. What makes it special?" />
              </Section>

              <Section icon={<CalendarToday />} title="Date & Time">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required type="date" label="Event Date" name="date" value={formData.date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} inputProps={{ min: dayjs().format("YYYY-MM-DD") }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required type="time" label="Event Time" name="time" value={formData.time} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </Section>

              <Section icon={<LocationOn />} title="Location & Category">
                <TextField fullWidth required label="Location or Venue" name="location" value={formData.location} onChange={handleInputChange} />
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" name="category" value={formData.category} onChange={handleInputChange}>
                    <MenuItem value=""><em>Select a category</em></MenuItem>
                    {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
              </Section>

              <Section icon={<PhotoCamera />} title="Cover Image">
                <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5, textTransform: 'none', color: '#334155', borderColor: '#CBD5E1' }}>
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {formData.image && <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>{formData.image.name}</Typography>}
              </Section>

              {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ bgcolor: '#B91C1C', '&:hover': { bgcolor: '#991B1B' }, py: 1.5, px: 5, borderRadius: '12px' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create Event"}
                </Button>
              </Box>
            </form>
          </Container>
        </Box>

        {/* --- Right Column: Desktop Preview --- */}
        <Box sx={{ width: '45%', bgcolor: '#F8FAFC', p: 4, display: { xs: 'none', md: 'block' } }}>
          <PreviewPanel />
        </Box>

        {/* --- Mobile Preview (Overlay) --- */}
        {showMobilePreview && (
          <Box sx={{ width: '100%', bgcolor: '#F8FAFC', p: 2, display: { xs: 'block', md: 'none' } }}>
            <PreviewPanel isMobile={true} />
          </Box>
        )}

        {/* --- Mobile FAB to show preview --- */}
        <Fab
          color="primary"
          onClick={() => setShowMobilePreview(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: showMobilePreview ? 'none' : 'flex', md: 'none' },
            bgcolor: '#B91C1C', '&:hover': { bgcolor: '#991B1B' }
          }}
        >
          <VisibilityIcon />
        </Fab>
      </Box>
    </>
  );
}

// Helper component for form sections
const Section = ({ icon, title, children }) => (
  <Box sx={{ my: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Avatar sx={{ bgcolor: '#F1F5F9', color: '#334155' }}>{icon}</Avatar>
      <Typography variant="h6" fontWeight={600} color="#1E293B">{title}</Typography>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {children}
    </Box>
  </Box>
);
