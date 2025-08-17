// src/components/QnaChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TextField, Button, Avatar, CircularProgress, Alert, Divider, Chip, IconButton } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthProvider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { addQuestionToEvent, addAnswerToQuestion } from '../../helpers/apiCommunicators'; // Import your new functions

dayjs.extend(relativeTime);

// --- Sub-Components ---

const AnswerItem = ({ answer, eventCreatorId }) => {
    // Check if the answer author is the event creator
    const isCreator = answer.author === eventCreatorId;
    return (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: isCreator ? '#FEE2E2' : '#E2E8F0', color: isCreator ? '#B91C1C' : '#475569', fontSize: '1rem' }}>
                {answer.authorName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, bgcolor: isCreator ? '#FFFBEB' : 'transparent', p: isCreator ? 1.5 : 0, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{answer.authorName}</Typography>
                        {isCreator && <Chip label="Creator" size="small" color="error" variant="outlined" />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">{dayjs(answer.createdAt).fromNow()}</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ pt: 0.5 }}>{answer.text}</Typography>
            </Box>
        </Box>
    );
};

const QnaItem = ({ question, eventCreatorId, onSetReply }) => {
    const { authUser } = useAuth();

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#E2E8F0', color: '#475569' }}>
                    {question.authorName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{question.authorName}</Typography>
                        <Typography variant="caption" color="text.secondary">{dayjs(question.createdAt).fromNow()}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', py: 0.5 }}>{question.text}</Typography>
                    
                    {authUser && (
                        <Button size="small" startIcon={<ReplyIcon />} onClick={() => onSetReply(question)} sx={{ mt: 1, textTransform: 'none' }}>
                            Reply
                        </Button>
                    )}
                    
                    <Box sx={{ mt: 1, pl: '12px', borderLeft: '2px solid #F1F5F9' }}>
                        {question.answers.map(answer => (
                            <AnswerItem key={answer._id} answer={answer} eventCreatorId={eventCreatorId} />
                        ))}
                    </Box>
                </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
        </Box>
    );
};

// --- Main Q&A Component ---

export default function QnaChat({ initialQuestions = [], eventCreatorId }) {
    const { id: eventId } = useParams();
    const { authUser } = useAuth();
    const [questions, setQuestions] = useState(initialQuestions);
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const inputRef = useRef(null);

    // Sync state if the initial questions prop changes
    useEffect(() => {
        setQuestions(initialQuestions);
    }, [initialQuestions]);

    // Focus input when reply mode is activated
    useEffect(() => {
        if (replyingTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyingTo]);

    const handleUniversalSubmit = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !authUser) return;
        
        setIsPosting(true);
        setError(null);

        if (replyingTo) {
            // Posting an answer
            const result = await addAnswerToQuestion(eventId, replyingTo._id, { text: inputText });
            if (result.question) {
                // Find and update the question in the state with the new answer
                setQuestions(prev => prev.map(q => q._id === result.question._id ? result.question : q));
                setReplyingTo(null);
                setInputText('');
            } else {
                setError(result.error || 'Failed to post answer.');
            }
        } else {
            // Posting a new question
            const result = await addQuestionToEvent(eventId, { text: inputText });
            if (result.question) {
                setQuestions(prev => [...prev, result.question]);
                setInputText('');
            } else {
                setError(result.error || 'Failed to post question.');
            }
        }
        setIsPosting(false);
    };

    return (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>Event Q&A</Typography>
                
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

                <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2, pr: 1 }}>
                    {questions.length > 0 ? (
                        questions.map(q => (
                            <QnaItem key={q._id} question={q} eventCreatorId={eventCreatorId} onSetReply={setReplyingTo} />
                        ))
                    ) : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                            No questions yet. Be the first to ask!
                        </Typography>
                    )}
                </Box>
                
                {authUser ? (
                    <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 3 }}>
                        {replyingTo && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#F1F5F9', borderRadius: 1, mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    Replying to: "{replyingTo.text}"
                                </Typography>
                                <IconButton size="small" onClick={() => setReplyingTo(null)}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                        <Box component="form" onSubmit={handleUniversalSubmit} sx={{ display: 'flex', gap: 1 }}>
                            <Avatar sx={{ mt: 0.5 }}>{authUser.name.charAt(0).toUpperCase()}</Avatar>
                            <TextField
                                inputRef={inputRef}
                                fullWidth
                                size="small"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={replyingTo ? "Write your answer..." : "Ask a question..."}
                            />
                            <Button type="submit" variant="contained" disabled={isPosting} sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}>
                                {isPosting ? <CircularProgress size={24} color="inherit" /> : (replyingTo ? "Reply" : "Ask")}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2, borderTop: '1px solid #E2E8F0', pt: 3 }}>
                        Please <a href="/login" style={{color: '#dc2626'}}>log in</a> to ask or answer a question.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
