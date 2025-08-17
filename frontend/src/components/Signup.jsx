// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser, verifyOtp } from '../../helpers/apiCommunicators';
import { useAuth } from '../context/AuthProvider';
import Navbar from '../components/Navbar';
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';

export default function Signup() {
  const { setAuthUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await signupUser(name, email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setIsOtpSent(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    const res = await verifyOtp(formData.email, otp);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setAuthUser({ name: res.name, email: res.email, _id: res._id });
    navigate("/my-bookings", { replace: true });
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', p: 2, backgroundColor: '#F8FAFC' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, maxWidth: '400px', width: '100%', borderRadius: 4, border: '1px solid #E2E8F0' }}>
          <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3, color: '#1E293B' }}>
            {isOtpSent ? "Verify Your Email" : "Create an Account"}
          </Typography>

          {error && (
            <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontSize: '0.875rem' }}>
              {error}
            </Typography>
          )}

          {!isOtpSent ? (
            <Box component="form" onSubmit={handleSendOtp} noValidate sx={{ mt: 1 }}>
              <TextField margin="normal" size="small" required fullWidth id="name" label="Full Name" name="name" autoComplete="name" autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={loading} />
              <TextField margin="normal" size="small" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} />
              <TextField margin="normal" size="small" required fullWidth name="password" label="Password" type="password" id="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={loading} />
              <TextField margin="normal" size="small" required fullWidth name="confirmPassword" label="Confirm Password" type="password" id="confirmPassword" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} disabled={loading} />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, mb: 2, py: 1.25, borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', backgroundColor: '#B91C1C', '&:hover': { backgroundColor: '#991B1B' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyOtp} noValidate sx={{ mt: 1 }}>
              <Typography sx={{ textAlign: 'center', mb: 2, color: '#475569', fontSize: '0.875rem' }}>
                An OTP has been sent to {formData.email}.
              </Typography>
              <TextField margin="normal" size="small" required fullWidth name="otp" label="Enter OTP" type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, mb: 2, py: 1.25, borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', backgroundColor: '#10B981', '&:hover': { backgroundColor: '#059669' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Sign Up'}
              </Button>
            </Box>
          )}

          <Typography align="center" sx={{ mt: 3, color: '#64748B', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 'bold' }}>
              Sign In
            </Link>
          </Typography>
        </Paper>
      </Box>
    </>
  );
}