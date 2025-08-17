import React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'


const GoogleAuthProviderWrapper = ({children}) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}

export default GoogleAuthProviderWrapper
