/**
 * ===================================================
 * AUTH API - Funciones para hablar con /api/auth
 * 
 * Para que sirve?
 * Cada funcion corresponde a un endpoint del BACKEND
 * los componentes y pages llaman a esta funcion
 * nunca llaman axios directamente
 * ====================================================
 * 
 */

import apiClient from "./client";
import { ApiResponse } from "../types/responses";
import { AuthData,UserProfile } from "../types/Models";


//-------------------REGISTRO-------------------
// POST /api/auth/register
// Datos que necesita el backend para registrar
export interface RegisterData
{

    email:string;
    password:string;
    username:string;
    full_name:string;
    nacimiento:string//formato: "YYYY-MM-DD"

}

export const register=async(data:RegisterData):Promise<AuthData>=>
{

    const response=await apiClient.post<ApiResponse<AuthData>>('/auth/register',data);
    return response.data.data!;

}

//-------------------LOGIN-------------------
//POST /api/auth/login
export interface LoginData
{

    email:string;
    password:string;

}

export const login=async(data:LoginData):Promise<AuthData>=>
{

    const response=await apiClient.post<ApiResponse<AuthData>>('/auth/login',data)
    return response.data.data!;

}

//-------------------YOOOO-------------------
//GET /api/auth/me (este requiere token JWT)
//retorna el perfil completo del usuario autenicado
export const getMe=async():Promise<UserProfile>=>
{

    const response=await apiClient.post<ApiResponse<UserProfile>>('/auth/Me')
    return response.data.data!;

}