/**===================================================================
 * Aqui se hace la configuracion de rutas de la app
 * 
 * Para que sirve?
 * 
 * Define q pagina se muestra segun la URL
 * Ejemplo: si el usuario va a /login => muestra LoginPage
 *          si va a /   => muestra HomePage
 * 
 * Hay 2 tipos de rutas: 
 * 
 * - Rutas Publicas: cualquiera puede entrar (login, register)
 * - Rutas Privadas: solo si hay 1 sesion activa (home,perfil, etc)
 * ==================================================================
 */

import{Routes,Route,Navigate}from'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// --- Paginas (las creare despues, por ahora placeholders) ---
// import HomePage from './pages/HomePage'
// import ProfilePage from './pages/ProfilePage'
 
// ============================================================
// COMPONENTE: PrivateRoute
// Si el usuario NOOOO esta autenticado, lo manda al login.
// Si SIIIII esta autenticado, muestra el componente hijo.
// ============================================================


const PrivateRoute=({children}:{children:React.ReactNode})=>
{

  const{isAuthenticated,isLoading}=useAuth()

  //mientras verifica si hay sesion guardada, no redirige todavia
  if(isLoading)
  {

    return(

      <div style=
      {{

        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        height:'100vh',
        fontSize:'18px'

      }}>

        Cargando...

      </div>

    )

  }

  //si no esta autenticado,redirige el login
  if(!isAuthenticated)
  {

    return<Navigate to="/login"replace/>

  }
  return<>{children}</>

}

// ============================================================
// COMPONENTE: PublicRoute
// Si el usuario YA esta autenticado y trata de ir al login,
// lo manda al home (no tiene sentido volver a loguearse).
// ============================================================
const PublicRoute=({children}:{children:React.ReactNode})=>
{

  const{isAuthenticated,isLoading}=useAuth()

  if(isLoading)
  {

    return(

      <div style=
      {{

        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        height:'100vh',
        fontSize:'18px'

      }}>

        Cargando...

      </div>

    )

  }

  //si ya esta logueado,no ira al login, se mandara al home
  if(isAuthenticated)
  {

    return<Navigate to="/"replace/>

  }
  return<>{children}</>

}

// ============================================================
// COMPONENTE PRINCIPAL - Define todas las rutas
// ============================================================
const App=()=>
{

  return(

    <Routes>

      {/**----RUTAS PUBLICAS (sin sesion)-------*/}

      <Route

        path="/login"
        element=
        {

          <PublicRoute>

            {/**loginpage */}
            <LoginPage/>

          </PublicRoute>

        }

      />
      <Route

        path="/register"
        element=
        {

          <PublicRoute>

            {/**register page */}
            <RegisterPage/>

          </PublicRoute>

        }
      
      />


      {/**-----RUTAS PRIVADAS---------------- (requieren sesion) */}
      <Route
        path="/"
        element=
        {

          <PrivateRoute>

            {/**HOME PAGE */}
            <div>Home Page - proximamente</div>

          </PrivateRoute>

        }
      />


      <Route
        path="/profile/:username"
        element=
        {

          <PrivateRoute>

            {/**PROFILE PAGE */}
            <div>Profile Page - PROXIMAMENTE</div>

          </PrivateRoute>

        }
      />

      <Route
        path="/post/:postId"
        element=
        {

          <PrivateRoute>

            {/**POST DETAIL PAGE */}
            <div>Post detail - proximamente</div>

          </PrivateRoute>

        }
      />


      <Route
        path="/chat/:chatId"
        element=
        {

          <PrivateRoute>

            {/** ChatPage */}
            <div>Chat Room - PROXIMAMENTE</div>

          </PrivateRoute>

        }
      />


      {/**Cualquier ruta que no existe, manda al homee */}
      <Route path="*"element={<Navigate to="/"replace/>}/>

    </Routes>

  )

}


export default App
