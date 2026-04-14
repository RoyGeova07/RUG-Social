/**
 * Este archivo es el punto de entrada de la aplicacion
 * 
 * Para que sirve?
 * 
 * Es el primer archivo que ejecuta React
 * aqui se evuelve toda la app con los providers globales
 * AuthProvider va aqui para que toda la app tenga acceso
 * al estado de sesion desde el inicio
 * ====================================================
 */


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'
import App from './App.tsx'

//que forma mas rara de comentar desde react usando las '{ }' que feo esto
createRoot(document.getElementById('root')!).render(
  <StrictMode>

    {/**BrowserRouter: habilita el sistema de rutas (URLS) en la app*/}
    <BrowserRouter>
    
      {/**AuthProvider: comparte el estado de sesion con toda la app */}
      <AuthProvider>

        <App/>

      </AuthProvider>

    </BrowserRouter>



  </StrictMode>,
)
