import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import App from './App.jsx';
import axios from "axios";
import GoogleAuthProviderWrapper from './context/GoogleAuthProviderWrapper.jsx';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL ;
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleAuthProviderWrapper>
    <AuthProvider>
      <App />
    </AuthProvider>
    </GoogleAuthProviderWrapper>
  </BrowserRouter>
);
