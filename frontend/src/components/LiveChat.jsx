// src/components/LiveChat.jsx
import React from 'react';
import { Box, Typography, Paper, TextField, IconButton, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Message = ({ text, sender, isMe }) => (
  <Box sx={{ display: 'flex', mb: 2, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
    {!isMe && <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#CBD5E1' }}>{sender.charAt(0)}</Avatar>}
    <Box>
      {!isMe && <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{sender}</Typography>}
      <Paper 
        elevation={0}
        sx={{ 
          p: '8px 14px', 
          borderRadius: isMe ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
          backgroundColor: isMe ? '#B91C1C' : '#F1F5F9',
          color: isMe ? 'white' : '#1E293B',
          maxWidth: '100%'
        }}
      >
        <Typography variant="body2">{text}</Typography>
      </Paper>
    </Box>
  </Box>
);

export default function LiveChat() {
  // Dummy messages for UI design
  const messages = [
    { sender: 'Jane', text: 'Welcome everyone! So excited for this session.' },
    { sender: 'You', text: 'Hey! Glad to be here.', isMe: true },
    { sender: 'Mike', text: 'This is going to be great.' },
    { sender: 'You', text: "Can't wait to get started!", isMe: true },
    { sender: 'Sarah', text: 'Will there be a Q&A at the end?' },
  ];

  return (
    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E293B' }}>
          Live Chat
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} isMe={msg.isMe} />
        ))}
      </Box>
      <Box component="form" sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
        <TextField fullWidth size="small" placeholder="Say something..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: '9999px' } }} />
        <IconButton type="submit" sx={{ bgcolor: '#B91C1C', color: 'white', '&:hover': { bgcolor: '#991B1B'} }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
