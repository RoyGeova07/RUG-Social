import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import'./AuthPages.css'
import Logo from'../../assets/RUG.png'
import GradientText from "../../components/GradientText";

const LoginPage=()=>
{

    
    const {login}=useAuth()//useAuth nos da la funcion login y el estado isLoading
    const[formData,setFormData]=useState({email:'',password:'',})//estado del formulario - guarda lo q escribe el usuario
    const[error,setError]=useState<string|null>(null) //estado para mostrar errores y loading del boton
    const[isLoading,setIsLoading]=useState(false)
    const[showPassword,setShowPassword]=useState(false)
    // --------------------------------------------------------
    // Cada vez que el usuario escribe en un input,
    // actualiza el campo correspondiente en formData
    // --------------------------------------------------------
    const handleChange=(e: React.ChangeEvent<HTMLInputElement>)=>
    {

        const{name,value}=e.target
        setFormData(prev=>({...prev,[name]:value}))
        if(error)setError(null)//limpiar error al escribir

    }
    // --------------------------------------------------------
    // Cuando el usuario hace click en "Iniciar sesion"
    // --------------------------------------------------------
    const handleSubmit=async(e:React.FormEvent)=>
    {

        e.preventDefault()//evita que recargue la pagina
        setError(null)
        setIsLoading(true)

        try
        {

            await login(formData)//llama el AuthContext, el navega el home

        }catch(err:unknown){

            let mensaje='Error al iniciar sesion'
            if(err&&typeof err==='object'&&'response'in err) 
            {

                const axiosErr=err as {response:{data:{message:string}}}
                mensaje=axiosErr.response?.data?.message||mensaje

            }
            setError(mensaje)

        }finally{

            setIsLoading(false)

        }

    }

    return(

        <div className="auth-container">

            {/**Lado izquierdo - decorativo */}
            <div className="auth-left">

                <div className="auth-brand" >

                    <img
                    
                        src={Logo}
                        alt="RUG Logo"
                        className='auth-logo'

                    />
                    <p className="auth-tagline">

                        <GradientText

                            colors={["#5227FF","#FF9FFC","#B19EEF"]}
                            animationSpeed={3}
                            showBorder={false}
                            
                        >
                            
                            Comparte tu mundo
                                                
                        </GradientText>

                    </p>
                </div>

                <div className="auth-circles">

                    <div className="circle circle-1"/>
                    <div className="circle circle-2"/>
                    <div className="circle circle-3"/>

                </div>

            </div>

               {/**Lado derecho - formulario */}
               <div className="auth-right">

                <div className="auth-card">

                    <div className="auth-header">

                        <h2 className="auth-header">

                            <GradientText

                                colors={["#5227FF","#FF9FFC","#B19EEF"]}
                                animationSpeed={3}
                                showBorder={false}

                            >
                                Bienvenido de vuelta
                        
                            </GradientText>

                        </h2>
                        <p>Inicia sesion para continuar</p>

                    </div>

                    {/**Mostrar error si hay */}
                    {error &&(

                        <div className="auth-error">

                            <span>⚠ {error}</span>
                            
                        </div>

                    )}

                    <form onSubmit={handleSubmit}className="auth-form">

                        <div className="form-group">

                            <label htmlFor="email">Correo electronico</label>
                            <input

                                id="email"
                                type="email"
                                name="email"
                                placeholder="tu@correo.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"

                            />

                        </div>

                        <div className="form-group">
                            

                            <label htmlFor="password">Contraseña</label>
                            <div className="input-with-status">

                                <input

                                    id="password"
                                    type={showPassword?'text':'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"

                                />

                                <button

                                    type="button"
                                    className="toggle-password"
                                    onClick={()=>setShowPassword(prev=>!prev)}
                                    tabIndex={-1}
                                    
                                >

                                    {showPassword?'🙈':'🙉'}

                                </button>


                            </div>
                    
                            
                           
                        </div>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={isLoading}
                        >

                            {isLoading?'Iniciando sesion...':'Iniciar sesion'}

                        </button>

                    </form>

                    <div className="auth-footer">

                        <p>

                            ¿No tienes cuenta{' '}
                            <Link to="/register">Registre aqui</Link>  

                        </p>

                    </div>

                </div>

            </div>
            
        </div>

    )

    

}

export default LoginPage