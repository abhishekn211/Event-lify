// src/components/EventCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardActionArea, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import dayjs from 'dayjs';
import socket from '../socket';

export default function EventCard({ event }) {
  const eventDateTime = dayjs(event.date)
    .hour(parseInt(event.time.split(':')[0], 10))
    .minute(parseInt(event.time.split(':')[1], 10));


  return (
    <Card
      sx={{
        width: '100%', // The card will fill the grid column
        height: '100%', // The card will fill the grid row height
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardActionArea 
        component={Link} 
        to={`/events/${event._id}`} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1, 
          // Ensure action area itself does not have a min-width
          minWidth: 0,
        }}
      >
        <CardMedia
          component="div"
          sx={{
            width: '100%',
            paddingTop: '56.25%', // 16:9 Aspect Ratio for the image
            backgroundImage: `url(${event.coverimage || '/heavy-encaustic-paint-background.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5, width: '100%' }}>
          <Typography
            variant="h6"
            title={event.title}
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              minHeight: '2.6em', // Reserve space for two lines of text
              mb: 1,
              color: '#1E293B',
            }}
          >
            {event.title}
          </Typography>
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
              <CalendarToday sx={{ fontSize: 16, color: '#64748B' }} />
              <Typography variant="body2" color="#64748B">
                {format(new Date(event.date), 'PPP')}
              </Typography>
            </Box>
            {event.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, minWidth: 0 }}>
                <LocationOn sx={{ fontSize: 16, color: '#64748B', flexShrink: 0 }} />
                {/* noWrap is the key to preventing long locations from stretching the card */}
                <Typography variant="body2" color="#64748B" noWrap>
                  {event.location}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}