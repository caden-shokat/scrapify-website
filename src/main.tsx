import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client'
import React from 'react'
import { AuthProvider } from './hooks/useAuth'
import App from './App.tsx'
import './index.css'
import { RegionProvider } from './hooks/useRegion'

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RegionProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </RegionProvider>
    </React.StrictMode>
    );
