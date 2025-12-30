export interface User
{

    id:string;
    email:string;
    password_hash:string;
    creado_en:Date;
    actualizado_en:Date;

}

export interface UserStatus
{

    user_id:string;
    status:'online'|'offline'|'away';
    last_seen:Date|null;

}

export interface Profile
{

    user_id:string;
    username:string;
    full_name:string;
    bio:string|null;
    nacimiento:Date|null;
    foto_perfil_url:string|null;
    creado_en:Date;

}

export interface Follow
{

    follower_id:string;
    following_id:string;
    creado_en:Date;

}

export interface Post
{

    id:string;
    user_id:string;
    subtitulo:string|null;
    creado_en:Date;
    actualizado_en:Date;

}

export interface PostMedia
{

    id:string;
    post_id:string; 
    media_url:string;
    media_type:'imagen'|'video';
    position:number;

}

export interface Like 
{

    user_id:string;
    post_id:string;
    creado_en:Date;
    
}


export interface Comment 
{
    id:string;
    post_id:string;
    user_id:string;
    contenido:string;
    creado_en:Date;
}


export interface Story 
{

    id:string;
    user_id:string;
    media_url:string;
    media_type:string;
    creado_en:Date;
    expirado_en:Date;

}


export interface Chat 
{

    id:string;
    is_group:boolean;
    creado_en:Date;

}

export interface ChatMember 
{
    chat_id:string;
    user_id:string;
}

export interface Message 
{

    id:string;
    chat_id:string;
    remitente_id:string;
    message_type:'texto'|'audio'|'sticker'|'imagen'|'video';
    contenido_texto:string|null;
    is_read:boolean;
    creado_en:Date;

}

export interface MessageMedia 
{
    id:string;
    message_id:string;
    media_url:string;
    media_type:'audio'|'imagen'|'video';
    duracion_segundos:number|null;
    creado_en:Date;
}

export interface Sticker
{

    id:string;
    name:string|null;
    sticker_url:string;
    category:string|null;
    creado_en:Date;

}

export interface MessageSticker
{

    message_id:string;
    sticker_id:string;

}


export interface Notification 
{

    id:string;
    user_id:string;
    type:'like'|'follow'|'comment'|'message';
    reference_id:string|null;
    is_read:boolean;
    creado_en:Date;

}

// ==================== DTOs (Data Transfer Objects) ====================

//para el registro de cada usuario
export interface CreateUser
{

    email:string;
    password:string;
    username:string;
    full_name:string;
    nacimiento:Date;

}

//para el login
export interface Login
{

    email:string;
    password:string;

}

//para crear post
export interface CreatePost
{

    user_id:string;
    subtitulo?:string;

}   

//para crear comentario
export interface CrearComment
{

    user_id:string;
    post_id:string;
    contenido:string;

}

//usuario completo con perfil
export interface UserWithProfiles extends User
{

    profile:Profile;
    status?:UserStatus;

}