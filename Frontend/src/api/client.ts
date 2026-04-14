/**
    ============================================================
    CLIENTE HTTP - CONFIGURACION BASE DE AXIOS

    ¿Para que sirve este archivo?
    - Configura la URL base del backend (no se repite en cada llamada)
    - Agrega el token JWT automaticamente en cada peticion
    - Maneja errores globales (token expirado, sin conexion, etc)
    ============================================================

    en resumen es el archivo mas importante de toda la capa API. Es el "mensajero" que habla con mi backend.

    Sin este archivo tendria que escribir esto en cada llamada:

    axios.get('http://localhost:3000/api/posts', {
  headers: { Authorization: `Bearer ${token}` }
    })

 * 
 * 
 */

//local http://localhost:5173/

import axios from "axios";
const BASE_URL='http://localhost:3000/api';//URL DEL BACKEND - cuando se haga deploy cambiar solo esto

//aqui se crea la instancia de axios con configuracion base
const apiClient=axios.create(
{

    baseURL:BASE_URL,
    headers:{'Content-Type': 'application/json',}

})

/**
 * 
 * ==============================================================
 * INTERCEPTOR DE REQUEST (antes de enviar cada peticion)
 * Agarra el token del localstorage y lo agrega automaticamente
 * asi no se tiene q escribir el token en cada llamada
 * ==============================================================
 */

apiClient.interceptors.request.use(

    (config)=>
    {
        
        const token=localStorage.getItem('token');
        if(token)
        {

            config.headers.Authorization=`Bearer ${token}`

        }
        return config

    },
    (error)=>
    {

        return Promise.reject(error)

    }

)

/**
 * ==============================================================
 * INTERCEPTOR DE RESPONSE (cuando llega la respuesta)
 * si el token expiro(401), limpia la sesion y redirige el login
 * ==============================================================
 */

apiClient.interceptors.response.use(

    (response)=>
    {

        //aqui todo bien, retorna la respuesta normal
        return response

    },
    (error)=>
    {

        if(error.response?.status===401)
        {

            //token expirado o invalido - limpiar sesion
            const enAuthPage=window.location.pathname==='/login'||window.location.pathname==='/register'
            //solo limpiar y redirigir si NO estamos en login/register
            //en login el 401 significa credenciales incorrectas, no token expirado
            if(!enAuthPage)
            {

                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href='/login'

            }


        }
        return Promise.reject(error)

    }

)

export default apiClient