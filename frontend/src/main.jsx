import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import App from './App.jsx';
import axios from "axios";

axios.defaults.baseURL = mport.meta.env.BACKENDURL ;
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
