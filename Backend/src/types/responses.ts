/*

En esta carpeta de types se definen los tipos y las interfaces globales que se usan en toda la aplicacion

ejemplos: 
Tipos de respuestas HTTP
Interfaces generales
Tipos de sesion de usuario

*/

export interface ApiResponse<T=any>
{

    success:boolean;
    message:string;
    data?:T;
    error?:string;
    timestamp?:string;

}

export interface PaginatedResponse<T>
{

    succes:boolean;
    message:string;
    data:T[];
    pagination:
    {

        page:number;
        limit:number;
        total:number;
        totalPages:number;

    };

}

export interface ErrorResponse
{

    success:boolean;
    message:string;
    error?:string;
    stack?:string;
    timestamp?:string;

}