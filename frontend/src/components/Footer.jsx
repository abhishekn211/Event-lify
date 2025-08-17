// src/components/Footer.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link as MuiLink } from '@mui/material'; // Only using Box for sx prop on divs

// Data for the footer links, tailored to Event-lify
const footerSections = [
  {
    title: 'Discover',
    links: [
      { text: 'All Events', url: '/home' },
      { text: 'Technology', url: '/home?category=Technology' },
      { text: 'Music', url: '/home?category=Music' },
      { text: 'Sports', url: '/home?category=Sports' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About Us', url: '/about' },
      { text: 'Contact', url: '/contact' },
      { text: 'Careers', url: '/careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { text: 'Help Center', url: '/help' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Privacy Policy', url: '/privacy' },
    ],
  },
];

export default function Footer() {
  return (
    // We use Box here as a direct replacement for `div` to leverage the `sx` prop easily
    <Box 
      component="div" 
      sx={{ 
        px: { xs: 3, md: 8, lg: 12 }, 
        mt: '1rem', 
        backgroundColor: '#F8FAFC' 
      }}
    >
      <Box 
        component="div" 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          gap: '40px', 
          py: '40px', 
          borderBottom: '1px solid rgba(107, 114, 128, 0.3)', 
          color: '#6B7280'
        }}
      >
        {/* Left Side: Logo and Description */}
        <Box component="div">
          <img 
            style={{ width: '128px' }} 
            src="/logobg.png" 
            alt="Logo" 
          />
          <p style={{ maxWidth: '380px', marginTop: '24px', fontSize: '0.875rem', lineHeight: 1.6 }}>
            The best place to discover, create, and share events that bring people together. Your next great experience is just a click away.
          </p>
        </Box>

        {/* Right Side: Links */}
        <Box 
          component="div" 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between', 
            width: { xs: '100%', md: '45%' }, 
            gap: '20px' 
          }}
        >
          {footerSections.map((section) => (
            <Box component="div" key={section.title}>
              <h3 style={{ fontWeight: 600, fontSize: '1rem', color: '#111827', marginBottom: '12px' }}>
                {section.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.links.map((link) => (
                  <li key={link.text}>
                    <MuiLink
                      component={RouterLink}
                      to={link.url}
                      sx={{
                        color: '#6B7280',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#B91C1C',
                        },
                      }}
                    >
                      {link.text}
                    </MuiLink>
                  </li>
                ))}
              </ul>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Copyright */}
      <p style={{ padding: '16px 0', textAlign: 'center', fontSize: '0.875rem', color: 'rgba(107, 114, 128, 0.8)' }}>
        Copyright © {new Date().getFullYear()} Event-lify. All Rights Reserved.
      </p>
    </Box>
  );
}