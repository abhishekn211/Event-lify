// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  TextField,
  InputAdornment,
  MenuItem,
  Divider,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Search,
  Add,
  Person,
  Event,
  Menu as MenuIcon,
  Close,
  Logout,
  Dashboard,
} from "@mui/icons-material";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
// ⛔ Removed CalendarMonthOutlinedIcon import
import { useAuth } from "../context/AuthProvider";
import { logoutUser } from "../../helpers/apiCommunicators";

export default function Navbar({ searchTerm, setSearchTerm }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
    navigate("/login", { replace: true });
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  // ✅ Updated navItems: replaced Calendar with My Bookings
  const navItems = [
    { label: "Explore", path: "/home", icon: Event },
    { label: "My Bookings", path: "/my-bookings", icon: ConfirmationNumberOutlinedIcon },
  ];

  // Hamburger drawer
  const mobileDrawer = (
    <Box sx={{ p: 2, bgcolor: "#F8FAFC", height: "100%", width: 280 }}>
      <List>
        {authUser ? (
          <>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon sx={{ mr: 1.5, color: "text.secondary" }} />
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {/* Create Event inside drawer */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate("/create")}>
                <Add sx={{ mr: 1.5, color: "text.secondary" }} />
                <ListItemText primary="Create Event" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate("/dashboard")}>
                <Dashboard sx={{ mr: 1.5, color: "text.secondary" }} />
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <Logout sx={{ mr: 1.5, color: "text.secondary" }} />
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/home">
                <Event sx={{ mr: 1.5, color: "text.secondary" }} />
                <ListItemText primary="Explore" />
              </ListItemButton>
            </ListItem>
            {/* Create Event for non-logged in too */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate("/create")}>
                <Add sx={{ mr: 1.5, color: "text.secondary" }} />
                <ListItemText primary="Create Event" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/signup"
                sx={{
                  backgroundColor: "#B91C1C",
                  color: "white",
                  "&:hover": { backgroundColor: "#991B1B" },
                  borderRadius: 2,
                }}
              >
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ backgroundColor: "white", color: "#1E293B" }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: { xs: 60, sm: 70 },
          }}
        >
          {/* Logo */}
          <Link to='/'>
            <img
              src="/logobg.png"
              alt="EventLify"
              style={{ height: 48, display: "block" }}
            />
          </Link>

          {/* Search (only on desktop & tablet, not phone) */}
          {setSearchTerm && (
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", sm: "flex" },
                justifyContent: "center",
                px: 3,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search events..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "9999px" },
                }}
                sx={{ maxWidth: 360 }}
              />
            </Box>
          )}

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: setSearchTerm ? 1 : 2,
              ml: "auto",
            }}
          >
            {authUser ? (
              <>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      startIcon={<item.icon />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: setSearchTerm ? 2 : 3,
                        color: isActive ? "#B91C1C" : "#334155",
                        backgroundColor: isActive ? "#FEE2E2" : "transparent",
                        "&:hover": { backgroundColor: "#FEE2E2" },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
                {/* Create Event Button */}
                <Button
                  component={Link}
                  to="/create"
                  startIcon={<Add />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    color: "white",
                    backgroundColor: "#B91C1C",
                    "&:hover": { backgroundColor: "#991B1B" },
                  }}
                >
                  Create Event
                </Button>
                {/* Profile */}
                <Box sx={{ position: "relative", ml: 2 }} ref={profileRef}>
                  <IconButton onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "#B91C1C" }}>
                      {authUser.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  {isProfileOpen && (
                    <Paper
                      sx={{
                        position: "absolute",
                        top: "120%",
                        right: 0,
                        width: 200,
                        boxShadow: 3,
                        borderRadius: 2,
                        zIndex: 10,
                      }}
                    >
                      <MenuItem onClick={() => handleNavigate("/my-bookings")}>
                        <ConfirmationNumberOutlinedIcon
                          sx={{ mr: 1.5, color: "text.secondary" }}
                        />{" "}
                        My Bookings
                      </MenuItem>
                      <MenuItem onClick={() => handleNavigate("/dashboard")}>
                        <Dashboard sx={{ mr: 1.5, color: "text.secondary" }} />{" "}
                        Dashboard
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <Logout sx={{ mr: 1.5, color: "text.secondary" }} />{" "}
                        Logout
                      </MenuItem>
                    </Paper>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Button
    component={Link}
    to="/home"
    startIcon={<Event />}
    sx={{
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 2,
      px: 2,
      color: location.pathname === "/home" ? "#B91C1C" : "#334155",
      backgroundColor: location.pathname === "/home" ? "#FEE2E2" : "transparent",
      "&:hover": { backgroundColor: "#FEE2E2" },
    }}
  >
    Explore
  </Button>

  <Button
    component={Link}
    to="/create"
    startIcon={<Add />}
    sx={{
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 2,
      px: 2,
      color: "white",
      backgroundColor: "#B91C1C",
      "&:hover": { backgroundColor: "#991B1B" },
    }}
  >
    Create Event
  </Button>

  <Button
    component={Link}
    to="/login"
    sx={{
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 2,
      px: 2,
      color: "#334155",
      backgroundColor: "transparent",
      "&:hover": { backgroundColor: "#F1F5F9" },
    }}
  >
    Login
  </Button>

  <Button
    component={Link}
    to="/signup"
    sx={{
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 2,
      px: 2,
      color: "white",
      backgroundColor: "#B91C1C",
      "&:hover": { backgroundColor: "#991B1B" },
    }}
  >
    Sign Up
  </Button>
</Box>

            )}
          </Box>

          {/* Hamburger (tablet + phone) */}
          <IconButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            sx={{ display: { md: "none" } }}
          >
            {isMobileMenuOpen ? <Close /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile/Tablet Drawer */}
      <Drawer
        anchor="right"
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sx={{ display: { md: "none" } }}
      >
        {mobileDrawer}
      </Drawer>
    </AppBar>
  );
}
