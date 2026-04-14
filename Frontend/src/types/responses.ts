//tipos de la respuestas de la API

/**
 * Respuesta estandar del BACKEND
 * el <T> es un "generico": se le dice que tipo va en la "data"
 * 
 * Ejemplo: ApiResponse<Post>= respuesta donde data es un post
 * 
 */

export interface ApiResponse<T=unknown>
{

    success:boolean;
    message:string;
    data?:T;
    error?:string;
    timestamp?:string;

}

//respuesta con paginacion
export interface PaginatedResponse<T>
{

    succes:boolean;
    message:string;
    data:
    {

        items:T[];//los datos
        pagination:
        {

            page:number;
            limit:number;
            total:number;
            totalPages:number;

        }

    }

}

