import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from "@react-oauth/google"

import App from './App'
import './styles/globals.css'   // <-- make sure this is here
import { store } from './redux/store'
import ScrollToTop from './components/ScrollToTop'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID!}>
      <Provider store={store}>
        <BrowserRouter>

      <ScrollToTop />
          <App />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
