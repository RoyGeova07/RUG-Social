import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import'./AuthPages.css'
import Logo from'../../assets/RUG.png'
import GradientText from "../../components/GradientText";
import apiClient from "../../api/client";

//tips para el estado de validacio del username
type UsernameStatus='idle'|'checking'|'available'|'taken'

//funcion: cuantos dias tiene un mes/año
const getDaysInMonth=(month:string,year:string):number=>
{

    if(!month||!year)return 31
    return new Date(parseInt(year),parseInt(month),0).getDate()

}

const RegisterPage=()=>
{

    const{register}=useAuth()
    const[formData,setFormData]=useState({email:'',password:'',username:'',full_name:'',nacimiento:'',})
    const[error,setError]=useState<string|null>(null)
    const[isLoading,setIsLoading]=useState(false)
    const[passwordError,setPasswordError]=useState<string|null>(null)
    const[usernameStatus,setUsernameStatus]=useState<UsernameStatus>('idle')
    const[birthDay,setBirthDay]=useState('')
    const[birthMonth,setBirthMonth]=useState('')
    const[birthYear,setBirthYear]=useState('')
    const[showPassword,setShowPassword]=useState(false)
    const daysInMonth=getDaysInMonth(birthMonth,birthYear)//dias disponibles segun mes y anio
    const days=Array.from({length:daysInMonth},(_,i)=>i+1)//opciones para los select
    const months=[{value:'01',label:'Enero' },{value:'02',label:'Febrero'},{value:'03',label:'Marzo'},{ value:'04',label:'Abril'},{ value:'05',label:'Mayo'},{value:'06',label:'Junio'},{ value:'07',label:'Julio'},{value:'08',label:'Agosto'},{value:'09',label:'Septiembre'},{value:'10',label:'Octubre'},{value: '11',label:'Noviembre'},{value:'12',label:'Diciembre'},]
    const currentYear=new Date().getFullYear()
    const years=Array.from({length:100},(_,i)=>currentYear-13-i)//menor de 13 años restriccion
    const birdayR=React.useRef(birthDay)//puto slint stricto
    birdayR.current=birthDay

    // ---- Cuando cambia el mes o año, ajustar el dia si se paso ----
    // Ejemplo: tenia dia 31, cambia a Febrero (28 dias) -> se ajusta a 28
    useEffect(()=>
    {

        if(birdayR&&birthMonth&&birthYear)
        {

            const maxDays=getDaysInMonth(birthMonth,birthYear)
            if(parseInt(birdayR.current)>maxDays)
            {

                setBirthDay(String(maxDays))//ajustar al maximo del nuevo mes

            }

        }

    },[birthMonth,birthYear])//solo se ejecuta cuando cambia mes o anio

    //cuando cambian dia/mes/anio,construir la fecha YYYY-MM-DD
    useEffect(()=>
    {

        if(birthDay&&birthMonth&&birthYear)
        {

            const day=birthDay.padStart(2,'0')
            setFormData(prev=>({...prev,nacimiento:`${birthYear}-${birthMonth}-${day}`}))

        }

    },[birthDay,birthMonth,birthYear])

    //validar contra en tiempo real
    const validatePassword=(value:string)=>
    {

        if(value.length===0){setPasswordError(null);return}
        if(value.length<6){setPasswordError('Minimo 6 caracteres');return}
        if(!/\d/.test(value)){setPasswordError('Debe contener al menos un numero');return}
        setPasswordError(null)

    }

    //se verifica el username con debounce (espera 600ms antes de llamar al BACKEND)
    useEffect(()=>
    {

        if(formData.username.length<3){setUsernameStatus('idle');return}
        setUsernameStatus('checking')
        const timer=setTimeout(async()=>
        {

            try
            {

                await apiClient.get(`/users/${formData.username}`)
                setUsernameStatus('taken')//200=usuario ya existe

            }catch{

                setUsernameStatus('available')//404 = username libre

            }

        },600)
        return()=>clearTimeout(timer)

    },[formData.username])


    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>
    {

        const{name,value}=e.target
        setFormData(prev=>({...prev,[name]:value}))
        setError(null)
        if(name==='password')validatePassword(value)

    }

    const handleSubmit=async(e:React.FormEvent)=>
    {

        e.preventDefault()
        if(passwordError)return
        if(usernameStatus==='taken'){setError('El nombre de usuario no esta disponible');return}
        if(!formData.nacimiento){setError('Selecciona tu fecha de nacimiento');return}
        setError(null)
        setIsLoading(true)

        try
        {

            await register(formData)//authContext guarda el token y navega al homeeee

        }catch(e:unknown){

            let mensaje='Error al registrarse'
            if(e&&typeof e==='object'&&'response'in e)
            {

                const axios_e=e as{response:{data:{message:string}}}
                mensaje=axios_e.response?.data?.message||mensaje

            }
            setError(mensaje)

        }finally{

            setIsLoading(false)

        }

    }

    //---------FRONT---------------------------------
    return(

        <div className="auth-container">

            {/**Lado izquierdo - decorativo */}

            <div className="auth-left">

                <div className="auth-brand">

                    <img src={Logo}alt="RUG logo"className="auth-logo"/>
                    <p className="auth-tagline">
                        <GradientText

                            colors={["#5227FF","#FF9FFC","#B19EEF"]}
                            animationSpeed={3}
                            showBorder={false}
                        >
                            {/**textooo a mostrar front */}
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

                        <h2 className="auth-tagline">

                           Crea tu cuenta

                        </h2>
                        <p className="auth-tagline">
                            <GradientText

                                colors={["#5227FF","#FF9FFC","#B19EEF"]}
                                animationSpeed={3}
                                showBorder={false}
                            >
                                
                                Unete a la comunidad de RUG

                            </GradientText>
                        </p>

                    </div>

                    {/**MENSAJE DE ERRORRRRRR */}
                    {error&&<div className="auth-error"><span>⚠ {error}</span></div>}

                    <form onSubmit={handleSubmit}className="auth-form">

                        {/**Nombre completo y username en la misma fila */}
                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="full_name">Nombre</label>
                                <input

                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    placeholder="Nombre completo"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    autoComplete="name"

                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="username">Nombre de usuario</label>

                                {/* Wrapper para posicionar el icono dentro del input */}
                                <div className="input-with-status">

                                    <input

                                        id="username"
                                        type="text"
                                        name="username"
                                        placeholder="tu_usuario"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        autoComplete="username"
                                        className={usernameStatus==='taken'?'input-invalid':usernameStatus==='available'?'input-valid':''}
                                        
                                    />

                                    {usernameStatus==='checking'&&<span className="status-icon checking">⟳</span>}
                                    {usernameStatus==='available'&&<span className="status-icon valid">✓</span>}
                                    {usernameStatus==='taken'&&<span className="status-icon invalid">✗</span>}

                                </div>

                                {/**mensaje debajo del input de username */}
                                {usernameStatus==='taken'&&<span className="field-error">No disponible ✗</span>}
                                {usernameStatus==='available'&&<span className="field-success">Disponible ✓</span>}

                                

                            </div>


                        </div>

                        {/**EMAIL */}
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

                        {/**contra con validacion */}
                        <div className="form-group">

                            <label htmlFor="password">Contraseña</label>
                            <div className="input-with-status">

                                <input

                                    id="password"
                                    type={showPassword?'text':'password'}
                                    name="password"
                                    placeholder="Minimo 6 caracteres y un numero"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className={passwordError?'input-invalid':formData.password.length>=6&&/\d/.test(formData.password)?'input-valid':''}

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
                            
                            {passwordError&&<span className="field-error">{passwordError}</span>}

                        </div>

                        {/**fecha de nacimiento con 3 selects */}
                        <div className="form-group">

                            <label>Fecha de nacimiento</label>
                            <div className="date-selects">

                                {/**DIA, SE USA DISABLED, PARA QUE EL USUARIO NO ESCOJA EL TEXT */}
                                <select 

                                    value={birthDay} 
                                    onChange={e=>setBirthDay(e.target.value)}
                                    required 
                                    className="date-select">
                                    <option value=""disabled>Dia</option>
                                    {days.map(d=><option key={d}value={String(d)}>{d}</option>)}

                                </select>

                                {/**MES */}
                                <select 

                                    value={birthMonth}
                                    onChange={e=>setBirthMonth(e.target.value)}
                                    required
                                    className="date-select">
                                    <option value=""disabled>Mes</option>
                                    {months.map(m=><option key={m.value}value={m.value}>{m.label}</option>)}
                                    

                                </select>

                                {/**AÑO */}
                                <select 

                                    value={birthYear}
                                    onChange={e=>setBirthYear(e.target.value)}
                                    required
                                    className="date-select">
                                    <option value=""disabled>Año</option>
                                    {years.map(y=><option key={y}value={String(y)}>{y}</option>)}

                                </select>


                            </div>

                        </div>

                        <button

                            type="submit"
                            className="auth-btn"
                            disabled={isLoading||usernameStatus==='taken'||!!passwordError}

                        >
                            {isLoading?'Creando cuenta...':'Crear cuenta'}

                        </button>
                        

                    </form>

                    <div className="auth-footer">

                        <p>

                            ¿Ya tienes cuenta?{' '}
                            <Link to='/login'>Inicia sesion aqui</Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>

    )

}

export default RegisterPage