

/**==================================================================
 * Para que sirve?
 * 
 * Guarda quien esta logueado y lo comparte con toda la app
 * cualquier componente puede saber si hay sesion activa,
 * quien es el usuario, hacer login o logout
 * 
 * 
 * Como funciona React Context?
 * Es como una variable pero de React
 * 
 * 1. se crea el contexto aqui
 * 2. se envuelve la app con el Provider (en main.tsx o App.tsx)
 * 3. cualquier componente hijo puede leer el contexto con useContext
 * ==================================================================
 * 
 * Este es clave porque guarda quien esta logueado y lo comparte con toda la app.
 * 
 */

import { createContext,useContext,useEffect,useState,ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthData,UserProfile } from "../types/Models";
import { login as loginApi, register as registeApi,getMe,LoginData,RegisterData } from "../api/auth.api";

//------------------------TIPOS DEL CONTEXTO------------------------
//esto define todo lo que va a estar disponible globalmente
interface AuthContextType
{

    user:AuthData['user']|null//datos basicos del usuario logueado
    profile:UserProfile|null;//perfil completo
    token:string|null;
    isAuthenticated:boolean;//true si hay sesion activa
    isLoading:boolean//true mientras verifica la sesion
    login:(data:LoginData)=>Promise<void>;
    register:(data:RegisterData)=>Promise<void>
    logout:()=>void

}

//------------------------CREAR EL CONTEXTO------------------------
const AuthContext=createContext<AuthContextType|null>(null)


//------------------------PROVIDER------------------------
//este componente envuelve la app y provee el estado
export const AuthProvider=({children}:{children:ReactNode})=>
{

    
    //----------------------PROVIDER-----------------------------------
    const navigate=useNavigate()//USARE NAVIGATE EN VEZ DE window.location.href


    const[user,setUser]=useState<AuthData['user']|null>(null)
    const[profile,setProfile]=useState<UserProfile|null>(null)
    const[token,setToken]=useState<string|null>(null)
    const[isLoading,setIsLoading]=useState(true)//empieza en true para verificar sesion guardada

    //--------------------------------------------------------
    //Al cargar la app, se revisa si habia una sesion guardada
    //en el localstorage(por si el usuario recargo la pagina)
    //-------------------------------------------------------
    useEffect(() => {
        const checkSession=async()=> 
        {
            const savedToken=localStorage.getItem('token');
            const savedUser=localStorage.getItem('user');

            if(savedToken&&savedUser) 
            {
                //se actualiza los estados iniciales
                setToken(savedToken);
                setUser(JSON.parse(savedUser));

                try 
                {
                    //se verifica si el token sigue siendo valido
                    const profileData=await getMe();
                    setProfile(profileData);
                }catch(error){

                    //si falla (token expirado),se limpia todo
                    console.log(error)
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);

                }
            }

            //IMPORTANTE: Esto ahora se ejecuta al final de todo el proceso,
            //ya sea que hubiera usuario o no, de forma asincrona.
            setIsLoading(false);
        };

        checkSession();
    }, []);

    //--------------------------LOGIN-----------------------------------
    const login=async(data:LoginData):Promise<void>=>
    {

        const authData=await loginApi(data)

        //guardar en el localstorage para persistir la sesion
        localStorage.setItem('token',authData.token)
        localStorage.setItem('user',JSON.stringify(authData.user))

        setToken(authData.token)
        setUser(authData.user)

        //cargar el perfil completo
        const profileData=await getMe();
        setProfile(profileData)

        navigate('/');

    }

    //----------------------------REGISTRO------------------------------
    const register=async(data:RegisterData):Promise<void>=>
    {

        const authData=await registeApi(data)

        localStorage.setItem('token',authData.token)
        localStorage.setItem('user',JSON.stringify(authData.user))

        setToken(authData.token)
        setUser(authData.user)

        const profileData=await getMe()
        setProfile(profileData)

        navigate('/')

    }

    //----------------------LOGOUT--------------------------------------
    const logout=():void=>
    {

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        setProfile(null)
        
        navigate('/login')

    }
    return(

        <AuthContext.Provider 
            value={{
                user,
                profile,
                token,
                isAuthenticated:!!token,
                isLoading,
                login,
                register,
                logout,

            }}
        >
            {children}
        </AuthContext.Provider>
        

    )

}

//===========================HOOK PERZONALIDADO========================
//En vez de escribir useContext(AuthContext)en cada componente,
//use userAuth() q es mas corto y limpio

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth=():AuthContextType=>
{

    const context=useContext(AuthContext);
    if(!context)
    {

        throw new Error('useAuth debe usarse dentro de AuthProvider')

    }
    return context

}