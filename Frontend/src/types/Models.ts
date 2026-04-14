//interfaces typescript, todas las interfaces

/**
 * tipos espejo del BACKEND
 * estos tipos coinciden exactamente con lo que retorna la API
 * 
 * se empieza el front primero con este archivo porque TypeScript necesita saber la "forma" 
 * de los datos antes de usarlos. si se define los tipos primero, VSCode va a autocompletar 
 * y avisar los errores en todo el resto del codigo.
 * 
 */



export interface User
{

    id:string;
    email:string;
    is_active:boolean;
    creado_en:string;
    actualizado_en:string;
}



//lo que retorna /api/auth/me y /api/users/:username
export interface UserProfile
{

    id:string;
    email:string;
    is_active:boolean;
    username:string;
    full_name:string;
    bio:string|null;
    nacimiento:string|null;
    foto_perfil_url:string|null;
    status:'online'|'offline'|'away'|null;
    last_seen:string|null;

}


//lo que retorna login y register 
export interface AuthState
{

    id:string;
    email:string;
    is_active:boolean;
    username:string;
    full_name:string;
    bio:string|null;
    nacimiento:string|null;
    foto_perfil_url:string|null;
    status:'online'|'offline'|'away'|null;
    last_seen:string|null;

}

//lo que retorna login y register
export interface AuthData
{

    token:string;
    user:
    {

        id:string;
        email:string;
        username:string;
        full_name:string;
        foto_perfil_url:string|null;

    }

}

//------------------------------POSTS------------------------------
export interface PostMedia
{

    id:string;
    post_id:string;
    media_url:string;
    media_type:'imagen'|'video';
    position:number;

}

export interface Post
{

    post_id:string;
    autor_id:string;
    username:string;
    full_name:string;
    foto_perfil_url:string|null;
    subtitulo:string|null;
    creado_en:string;
    actualizado_en:string;
    like_count:number;
    comments_count:number;
    media:PostMedia[];

}

//------------------------------COMENTARIOS------------------------------
export interface Comment 
{
    id:string;
    post_id:string;
    user_id:string;
    contenido:string;
    creado_en:string;
    username:string;
    full_name:string;
    foto_perfil_url:string|null;
}

//------------------------------LIKES------------------------------

export interface LikeUser
{

    user_id:string;
    username:string;
    full_name:string;
    foto_perfil_url:string|null;
    creado_en:string;

}

//------------------------------STORIES------------------------------
export interface Story
{

    story_id:string;
    media_url:string;
    media_type:string;
    creado_en:string;

}


//stories agrupadas por usuario (lo que retorna el feed)
export interface StoryGroup 
{

  userId:string;
  username:string;
  foto_perfil_url:string|null;
  stories:Story[];

}
 
//mi propia story
export interface MyStory 
{

    id:string;
    user_id:string;
    media_url:string;
    media_type:string;
    creado_en:string;
    expirado_en:string;

}

//--------------------CHAT--------------------
export interface Chat 
{
    id:string;
    is_group:boolean;
    nombre:string|null;
    descripcion:string|null;
    creado_en:string;
}
 
export interface Message
{
    id:string;
    chat_id:string;
    remitente_id:string;
    username:string;
    message_type:'texto'|'audio'|'sticker'|'imagen' |'video';
    contenido_texto: string|null;
    is_read:boolean;
    creado_en:string;
    media?: 
    {

        media_url:string;
        media_type:string;
        duracion_segundos:number|null;

    };
}
 
export interface Sticker 
{
    id:string;
    name:string|null;
    sticker_url:string;
    category:string|null;
}

//--------------------NOTIFICACIONES--------------------
export interface Notification 
{

    id:string;
    user_id:string;
    type:'like'|'follow'|'comment'|'message';
    reference_id:string|null;
    is_read:boolean;
    creado_en:string;

}
 
//--------------------PAGINACION--------------------
export interface Pagination 
{

    page:number;
    limit:number;
    total:number;
    totalPages:number;

}