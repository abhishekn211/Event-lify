// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../helpers/apiCommunicators';
import { useAuth } from '../context/AuthProvider';
import Navbar from '../components/Navbar';
import { useGoogleLogin } from '@react-oauth/google';
import { Box, Typography, TextField, Button, Paper, Divider, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const { setAuthUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const res = await loginUser(formData.email, formData.password, null);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setAuthUser({ name: res.name, email: res.email, _id: res._id });
    navigate("/my-bookings", { replace: true });
  };

  const responseGoogle = async (authResult) => {
    setLoading(true);
    try {
      if (authResult['code']) {
        const res = await loginUser(null, null, authResult['code']);
        if (res.error) {
          setError(res.error);
        } else {
          setAuthUser({ name: res.name, email: res.email, _id: res._id });
          navigate("/my-bookings", { replace: true });
        }
      }
    } catch (error) {
      console.log(error);
      setError("Google login failed. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => setError("Google login failed. Please try again."),
    flow: 'auth-code',
  });

  const handleGuestLogin = () => {
    navigate("/home");
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', p: 2, backgroundColor: '#F8FAFC' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, maxWidth: '400px', width: '100%', borderRadius: 4, border: '1px solid #E2E8F0' }}>
          <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3, color: '#1E293B' }}>
            Sign in to Event-lify
          </Typography>

          {error && (
            <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontSize: '0.875rem' }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2, py: 1.25, borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', backgroundColor: '#B91C1C', '&:hover': { backgroundColor: '#991B1B' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2, fontSize: '0.8rem' }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ py: 1.25, borderRadius: '8px', borderColor: '#CBD5E1', color: '#475569', textTransform: 'none' }}
            >
              Sign in with Google
            </Button>
            
            <Typography align="center" sx={{ mt: 3, color: '#64748B', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 'bold' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </>
  );
}