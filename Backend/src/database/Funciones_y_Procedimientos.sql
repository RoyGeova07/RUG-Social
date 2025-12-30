
-----------------------------------------------------INICIO DE CRUD USUARIO-----------------------------------------------------
create or replace procedure sp_crear_usuario(in p_email varchar,in p_password_hash text,in p_username varchar,in p_full_name varchar,in p_nacimiento date)
language plpgsql
as $$
	declare v_user_id uuid;
begin 
	
	if exists(select 1 from users where email=p_email)then
		raise exception'El correo ya esta registrado chele';
	end if;

	if exists(select 1 from profiles where username=p_username)then
		raise exception'El nombre de usuario ya existe';
	end if;

	--insertar en usuarios
	insert into users(email,password_hash)values(p_email,p_password_hash)
	returning id into v_user_id;--returning inserta, devuelve el uuid generado y se guarda en la variable

	--insertar en perfiles
	insert into profiles(user_id,username,full_name,nacimiento)values(v_user_id,p_username,p_full_name,p_nacimiento);

	--insertar el usuario como activo
	insert into user_status(user_id,status)values(v_user_id,'online');
	
end;
$$;


create or replace procedure sp_desactivar_usuario_por_email(in p_email varchar)
language plpgsql
as $$
declare v_user_id uuid;
begin 
	
	select id
    into v_user_id
    from users
    where email=p_email and is_active=true;

	if v_user_id is null then
		raise exception'El usuario no existe o ya esta inactivo';
	end if;

	update users
	set is_active=false
	where id=v_user_id;
	
	delete from user_status
	where user_id=v_user_id;

end;
$$;

create or replace procedure sp_reactivar_usuario_por_email(in p_email varchar)
language plpgsql
as $$
declare v_user_id uuid;
begin 
	
	--se busca el usuario inactivo
	select id
    into v_user_id
    from users
    where email=p_email and is_active=false;

	if v_user_id is null then
		raise exception'El usuario no existe o ya esta activo';
	end if;

	update users
	set is_active=true
	where id=v_user_id;
	
	--volver a insertarlo en la tabla de user_status como online
	insert into user_status(user_id,status,last_seen)values(v_user_id,'online',current_timestamp);

end;
$$;


create or replace function sp_consultar_usuario(p_username varchar)
returns table 
(

	user_id UUID,
    email VARCHAR,
    is_active BOOLEAN,
    username VARCHAR,
    full_name VARCHAR,
    bio TEXT,
    nacimiento DATE,
    foto_perfil_url TEXT,
    status VARCHAR,
    last_seen TIMESTAMP

)
language plpgsql
as $$
begin 
	
	return query
	select 
		u.id, 
		u.email,
        u.is_active,
        p.username,
        p.full_name,
        p.bio,
        p.nacimiento,
        p.foto_perfil_url,
        us.status,
        us.last_seen
	from profiles p
	inner join users u on u.id=p.user_id
	left join user_status us on us.user_id=u.id
	where p.username=p_username;

end;
$$;
--									usuarios a traer | desde donde empiezo
create or replace function listar_usuarios(p_limit int,p_offset int)
returns table
(

	user_id uuid,
	email varchar,
	username varchar,
	full_name varchar,
	creado_en timestamp

)
language plpgsql
as $$
begin 
	
	return query
	select 
		u.id,
        u.email,
        p.username,
        p.full_name,
        u.creado_en
	from users u
	inner join profiles p on p.user_id=u.id
	where u.is_active=true
	order by u.creado_en desc
	limit p_limit
	offset p_offset;

end;
$$;

create or replace function fn_feed_usuario(p_user_id uuid,p_limit int,p_offset int)
returns table
(

	post_id uuid,
	auto_id uuid,
	username varchar,
	subtitulo text,
	creado_en timestamp

)
language plpgsql
as $$
begin 
	
	return query 
	select 
		po.id,
        po.user_id,
        pr.username,
        po.subtitulo,
        po.creado_en
	from follows f
	inner join posts po on po.user_id=f.following_id
	inner join profiles pr on pr.user_id=po.user_id
	where f.follower_id=p_user_id
	order by po.creado_en desc
	limit p_limit
	offset p_offset;

end;
$$;

-----------------------------------------------------TERMINADO CRUD DE USUARIO-----------------------------------------------------

--esta funcion y trigger me ayudara a registrar la ultima vez que un usuario fue modificado, sin que se tenga que hacer a mano en cada UPDATE.
create or replace function fn_set_actualizado_en()
returns trigger 
language plpgsql
as $$
begin
	
	new.actualizado_en=current_timestamp;
	return new;

end;
$$;

-----------------------------------------------------INICIO DE CRUD POST-----------------------------------------------------

create or replace procedure sp_crear_post(in p_user_id uuid,in p_subtitulo text,out p_post_id uuid)
language plpgsql
as $$
begin
	
	if not exists(select 1 from users where id=p_user_id and is_active=true)then
		raise exception'El usuario no existe o esta inactivo';
	end if;

	--insertar post
	insert into posts(user_id,subtitulo)values(p_user_id,p_subtitulo)
	returning id into p_post_id;

end;
$$;


create or replace procedure sp_eliminar_post(in p_post_id uuid,in p_user_id uuid)
language plpgsql
as $$
declare
	v_autor uuid;
begin


	select user_id
	into v_autor
	from posts
	where id=p_post_id;

	if v_autor is null then
		raise exception'El post no existe';
	end if;

	if v_autor<>p_user_id then
		raise exception'No tienes permiso para borrar este post';
	end if;

	delete from posts where id=p_post_id;

end;
$$;

create or replace function listar_posts_global(p_limit int,p_offset int)
returns table
(

	post_id uuid,
	autor_id uuid,
	username varchar,
	subtitulo text,
	creado_en timestamp,
	likes_count int,
	comments_count int,
	media_url text

)
language plpgsql
as $$
begin

	return query 
	select 
		po.id,
        po.user_id,
        pr.username,
        po.subtitulo,
        po.creado_en,
		
		--contar likes
		(select count(*)from likes l where l.post_id=po.id)as likes_count,

		--contar comentarios
		(select count(*)from comments c where c.post_id=po.id)as comments_count,

		--primer media
		(select media_url
		from post_media m
		where m.post_id=po.id
		order by  m.position asc
		limit 1)as media_url

	from posts po
	inner join profiles pr on pr.user_id=po.user_id
	order by po.creado_en desc
	limit p_limit offset p_offset;

end;
$$;

create or replace function listar_posts_usuario(p_user_id uuid,p_limit int,p_offset int)
returns table
(

	post_id uuid,
    autor_id uuid,
    username varchar,
    subtitulo text,
    creado_en timestamp,
    likes_count int,
    comments_count int,
    media_url text

)
language plpgsql
as $$
begin 
    
    return query
    select
        po.id,
        po.user_id,
        pr.username,
        po.subtitulo,
        po.creado_en,
		
		(select count(*)from likes l where l.post_id=po.id)as likes_count,
		(select count(*)from comments c where c.post_id=po.id)as comments_count,	

		  (select media_url 
          from post_media m 
          where m.post_id=po.id 
          order by m.position asc
          limit 1)
	
	from posts po
	inner join profiles pr on pr.user_id=po.user_id
	where po.user_id=p_user_id
	order by po.creado_en desc
	limit p_limit offset p_offset;

end;
$$;

create or replace procedure sp_editar_post_subtitulo(in p_post_id uuid,in p_user_id uuid,in p_subtitulo text)
language plpgsql
as $$
declare 
	v_autor uuid;
begin

	--validar que el post exista y obtener autor
	select user_id into v_autor
	from posts
	where id=p_post_id;

	if v_autor is null then
		raise exception'El post no existe';
	end if;

	--validar q el usuario q edita sea el autor
	if v_autor<>p_user_id then
		raise exception'No tiene permiso para editar este post';
	end if;

	--actualizar subtitulo
	 update posts
	 set subtitulo=p_subtitulo
	 where id=p_post_id;
end;
$$;

-----------------------------------------------------TERMINADO EL CRUD DE POST-----------------------------------------------------

-----------------------------------------------------INICIO DEL CRUD DE COMENTARIOS-----------------------------------------------------

create or replace procedure sp_crear_comentario(in p_user_id uuid,in p_post_id uuid, in p_contenido text)
language plpgsql
as $$
begin

	if p_contenido is null or trim(p_contenido)=' 'then
		raise exception'El comentario no puede estar vacio';
	end if;

	if not exists(select 1 from users where id=p_user_id and is_active=true)then
        raise exception'El usuario no existe o está inactivo';
    end if;

    
    if not exists(select 1 from posts where id=p_post_id)then
        raise exception'El post no existe';
    end if;

	insert into comments(user_id,post_id,contenido)values(p_user_id,p_post_id,p_contenido);

end;
$$;

create or replace procedure sp_borrar_comentario(in p_comment_id uuid,in p_user_id uuid)
language plpgsql
as $$
declare 
	v_autor_comentario uuid;
	v_autor_post uuid;
begin

	--obtener el auto del comentario
	select user_id,post_id into v_autor_comentario,v_autor_post
	from comments 
	where id=p_comment_id;

	if v_autor_comentario is null then
		raise exception'El comentario no existe';
	end if;


	--obtener autor del post
	select user_id into v_autor_post
	from posts 
	where id=v_autor_post;

	if p_user_id<>v_autor_comentario and p_user_id<>v_autor_post then
		raise exception'No tiene permiso para borrar este comentario';
	end if;

	delete from comments where id=p_comment_id;

end;
$$;

-----------------------------------------------------INICIO DE FOLLOWS-----------------------------------------------------
create or replace procedure sp_seguir_usuario(in p_follower_id uuid,in p_following_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from users where id=p_follower_id and is_active=true)then
		raise exception'El usuario seguidor no existe o esta inactivo';
	end if;

	if not exists(select 1 from users where id=p_following_id and is_active=true)then
		raise exception'El usuario seguidor no existe o esta inactivo';
	end if;

	if p_follower_id=p_following_id then
		raise exception'No puede seguirte a ti mismo';
	end if;

	--evitar duplicado
	if exists(select 1 from follows where follower_id=p_follower_id and following_id=p_following_id)then
		raise exception'Ya sigue a este usuario';
	end if;

	insert into follows(follower_id,following_id)values(p_follower_id,p_following_id);

end;
$$;


create or replace procedure sp_dejar_de_seguir(in p_follower_id uuid,in p_following_id uuid)
language plpgsql
as $$
begin

	delete from follows 
	where follower_id=p_follower_id
	and following_id=p_following_id;

end;
$$;


create or replace function fn_listar_seguidos(p_user_id uuid,p_limit int,p_offset int)
returns table
(

	user_id uuid,
	username varchar,
	full_name varchar,
	foto_de_perfil_url text,
	seguido_desde timestamp

)
language plpgsql
as $$
begin

	return query
	SELECT 
        u.id,
        p.username,
        p.full_name,
        p.foto_perfil_url,
        f.creado_en
	from follows f
	inner join users u on u.id=f.following_id
	inner join profiles p on p.user_id=u.id
	where f.follower_id=p_user_id
	order by f.creado_en desc
	limit p_limit offset p_offset;

end;
$$;

create or replace function fn_listar_seguidores(p_user_id uuid,p_limit int,p_offset int)
returns table 
(

	user_id uuid,
	username varchar,
	full_name varchar,
	foto_de_perfil_url text,
	seguido_desde timestamp
	
)
language plpgsql
as $$
begin

	return query
	SELECT 
        u.id,
        p.username,
        p.full_name,
        p.foto_perfil_url,
        f.creado_en
	from follows f
	inner join users u on u.id=f.follower_id
	inner join profiles p on p.user_id=u.id
	where f.following_id=p_user_id
	order by f.creado_en desc
	limit p_limit offset p_offset;

end;
$$;

-----------------------------------------------------TERMINADO FOLLOWS-----------------------------------------------------

-----------------------------------------------------INICIO CRUD DE STORIES-----------------------------------------------------
create or replace procedure sp_crear_story(in p_user_id uuid,in p_media_url text,in p_media_type varchar(40))
language plpgsql
as $$
begin

	if not exists(select 1 from users where id=p_user_id)then
		raise exception'El usuario no existe o esta inactivo';
	end if;

	--insertar historia con expiracion de 24 horas
	insert into stories(user_id,media_url,media_type,expirado_en)values(p_user_id,p_media_url,p_media_type,current_timestamp+interval'24 HOURS');

end;
$$;

create or replace procedure sp_eliminar_story(in p_story_id uuid,in p_user_id uuid)
language plpgsql
as $$
declare	
	v_autor uuid;
begin

	--obtener autorrrr
	select user_id into v_autor
	from stories
	where id=p_story_id;

	if v_autor is null then
		raise exception'La story no existe';
	end if;

	delete from stories
	where id=p_story_id;
	

end;
$$;

create or replace function fn_listar_stories_usuario(p_user_id uuid)
returns table
(

	user_id uuid,
	username varchar,
	foto_perfil_url text,
	story_id uuid,
	media_url text,
	media_type varchar,
	creado_en timestamp

)
language plpgsql
as $$
begin

	return query
	select
		s.user_id,
        pr.username,
        pr.foto_perfil_url,
        s.id,
        s.media_url,
        s.media_type,
        s.creado_en
	from stories s
	inner join profiles pr on pr.user_id=s.user_id
	where s.expirado_en>current_timestamp and(s.user_id=p_user_id
	or s.user_id in(select following_id from follows
	where follower_id=p_user_id))
	order by s.user_id,s.creado_en desc;

end;
$$;

-----------------------------------------------------TERMINADO CRUD DE STORIES-----------------------------------------------------

-----------------------------------------------------INICIO DE CRUD DE CHAT-----------------------------------------------------
create or replace procedure sp_crear_chat_privado(in p_user1_id uuid,in p_user2_id uuid,out p_chat_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from users where id=p_user1_id and is_active=true)then
		raise exception'El usuario 1 no existe o esta inactivo';
	end if;

	if not exists(select 1 from users where id=p_user2_id and is_active=true)then
		raise exception'El usuario 2 no existe o esta inactivo';
	end if;

	if p_user1_id=p_user2_id then
		raise exception'No podes crear char contigo mismo';
	end if;

	--se verifica si ya existe chat entre esos 2 usuarios
	select c.id into p_chat_id
	from chats c
	where c.is_group=false
	and exists(select 1 from chat_members cm1 where cm1.chat_id=c.id and cm1.user_id=p_user1_id)
	and exists(select 1 from chat_members cm2 where cm2.chat_id=c.id and cm2.user_id=p_user2_id)
	and(select count(*)from chat_members where chat_id=c.id)=2;

	--si ya existe, retornar el id del chat existente
	if p_chat_id is not null then
		return;
	end if;

	--si no existe, crear nuevo chat
	insert into chats(is_group)values(false)
	returning id into p_chat_id;

	--insertar ambos usuarios como miembros
	insert into chat_members(chat_id,user_id)values(p_chat_id,p_user1_id);
    insert into chat_members(chat_id,user_id)values(p_chat_id,p_user2_id);

	
end;
$$;


create or replace procedure sp_crear_chat_grupal(in p_creator_id uuid,in p_member_ids uuid[],out p_chat_id uuid)
language plpgsql
as $$
declare 
	v_member_id uuid;
begin

	 if not exists(select 1 from users where id=p_creator_id and is_active=true) then
        raise exception 'El creador no existe o esta inactivo';
    end if;

	--el grupo debe tener al menos 2 miembros, ademas del creador
	if array_length(p_member_ids,1)<2 then
		raise exception'Un grupo debe de tener al menos 3 miembros (incluyengo al creador)';
	end if;

	--crear chat grupal
	insert into chats(is_group)values(true)
	returning id into p_chat_id;
	
	--insertar al creador como miembro
	 insert into chat_members(chat_id,user_id)values(p_chat_id,p_creator_id);
	
	--insertar los demas miembros
	foreach v_member_id in array p_member_ids
	loop
		if exists(select 1 from user where id=v_member_id and is_active=true)then
			--se evita duplicados, por si el creador se incluyo en el array
			if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=v_member_id)then
				insert into chat_members(chat_id,user_id)values(p_chat_id,v_member_id);
			end if;
		end if;
	end loop;

end;
$$;

create or replace procedure sp_enviar_mensage_texto(in p_chat_id uuid,in p_remitente_id uuid,in p_contenido_texto text,out p_message_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from chats where id=p_chat_id)then
		raise exception'El chat no existe';
	end if;

	 if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_remitente_id)then
        raise exception 'No eres miembro de este chat';
    end if;

	if p_contenido_texto is null or trim(p_contenido_texto)=''then
		raise exception'El mensaje no puede estar vacio';
	end if;

	--enviar mensaje
	insert into messages(chat_id,remitente_id,message_type,contenido_texto)values(p_chat_id,p_remitente_id,'texto',p_contenido_texto)
	returning id into p_message_id;

end;
$$;

create or replace procedure sp_enviar_sticker(in p_chat_id uuid,in p_remitente_id uuid,in p_sticker_id uuid,out p_message_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from chats where id=p_chat_id)then
		raise exception'El chat no existe';
	end if;

	 if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_remitente_id)then
        raise exception 'No eres miembro de este chat';
    end if;

	if not exists(select 1 from stickers where id=p_sticker_id) then
		raise exception'El sticker no existe';
	end if;	

	--ahora de tipo sticker
	insert into messages(chat_id,remitente_id,message_type)values(p_chat_id,p_remitente_id,'sticker')
	returning id into p_message_id;

	--ahora vincular el sticker al mensaje
	insert into message_stickers(message_id,sticker_id)values(p_message_id,p_sticker_id);

end;
$$;

	
--																										 'audio', 'imagen', 'video'
create or replace procedure sp_enviar_mensaje_media(in p_chat_id uuid,in p_remitente_id uuid,in p_media_url text,in p_media_type varchar(40),in p_duracion_segundos int,out p_message_id uuid)
language plpgsql
as $$
begin
	
	if not exists(select 1 from chats where id=p_chat_id)then
		raise exception'El chat no existe';
	end if;

	 if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_remitente_id)then
        raise exception 'No eres miembro de este chat';
    end if;

	--siempre de tipo media
	if p_media_type not in('audio','imagen','video')then
		raise exception'Tipo de media invalido. Debe de ser: audio, imagen o video';
	end if;

	--insertar mensaje
	insert into messages(chat_id,remitente_id,message_type)values(p_chat_id,p_remitente_id,p_media_type)
    returning id into p_message_id;

	--insertar media
	insert into messages_media(message_id,media_url,media_type,duracion_segundos)values(p_message_id,p_media_url,p_media_type,p_duracion_segundos);

end;
$$;

create or replace procedure sp_eliminar_mensaje(in p_message_id uuid,in p_user_id uuid)
language plpgsql
as $$
declare
	v_remitente_id uuid;
    v_chat_id uuid;
begin

	--aqui obtengo el remitente del mensaje y el chat
	select remitente_id,chat_id into v_remitente_id,v_chat_id
	from messages
	where id=p_message_id;

	if v_remitente_id is null then
		raise exception'El mensaje no existe';
	end if;

	if v_remitente_id!=p_user_id then
		raise exception'Solo puedes eliminar tus propios mensajes';
	end if;

	delete from messages where id=p_message_id;

end;
$$;

create or replace procedure sp_marcar_mensajes_leidos(in p_chat_id uuid,in p_user_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_user_id)then
		raise exception'No eres miembro de este chat';
	end if;

	--marcar como leido todos los mensajes del chat que no sean del usuario
	update messages
	set is_read=true 
	where chat_id=p_chat_id and remitente_id!=p_user_id and is_read=false;

end;
$$;

create or replace function fn_listar_mensajes_chat(p_chat_id uuid,p_user_id uuid,p_limit int,p_offset int)
returns table
(

	message_id uuid,
    remitente_id uuid,
    username varchar,
    foto_perfil_url text,
    message_type varchar,
    contenido_texto text,
    media_url text,
    media_type varchar,
    duracion_segundos int,
    sticker_url text,
    is_read boolean,
    creado_en timestamp

)
language plpgsql
as $$
begin

	if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_user_id)then
        raise exception 'No eres miembro de este chat';
	end if;

	return query
	select
		m.id,
        m.remitente_id,
        pr.username,
        pr.foto_perfil_url,
        m.message_type,
        m.contenido_texto,
        mm.media_url,
        mm.media_type,
        mm.duracion_segundos,
        s.sticker_url,
        m.is_read,
        m.creado_en
	from messages m
	inner join profiles p on pr.user_id=m.remitente_id
	left join messages_media mm on mm.message_id=m.id
	left join message_stickers ms on ms.message_id=m.id
	left join stickers s on s.id=ms.sticker_id
	where m.chat_id=p_chat_id
	order by m.creado_en desc
	limit p_limit
	offset p_offset;

	
end;
$$;

create or replace function fn_listar_chats_usuario(p_user_id uuid,p_limit int,p_offset int)
returns table
(

	chat_id uuid,
    is_group boolean,
    otro_user_id uuid,
    otro_username varchar,
    otra_foto_perfil text,
    ultimo_mensaje text,
    ultimo_mensaje_creado timestamp,
    mensajes_no_leidos int

)
language plpgsql
as $$
begin

	return query
	select
		c.id,
		c.is_group,
		--si es chat privado,obtener el otro usuario
		case 
			when c.is_group=false then
				(select user_id from chat_members where chat_id=c.id and user_id!=p_user_id
				limit 1)
			else null
		end as otro_user_id,

		--username del otro usuario (si es privado)
		case 
			when c.is_group=false then
				(select pr.username from chat_members cm
				inner join profiles pr on pr.user_id=cm.user_id
				where cm.chat_id=c.id and cm.user_id!=p_user_id
				limit 1)
			else 'Grupo'::varchar
		end as otro_username,

		--foto del otro usuario(si es privado)
		case 
			when c.is_group=false then
				(select pr.foto_perfil_url from chat_members cm
				inner join profiles pr on pr.user_id=cm.user_id
				where cm.chat_id=c.id and cm.user_id!=p_user_id
				limit 1)
			else null
		end as otra_foto_perfil,
		

		--ultimo mensaje
		(select 
			case
				when m.message_type='texto'then m.contenido_texto
                when m.message_type='sticker'then'🎭 Sticker'
                when m.message_type='audio'then'🎵 Audio'
                when m.message_type='imagen'then'📷 Imagen'
                when m.message_type='video'then'🎥 Video'
                else 'Mensaje'
			end 
		 from messages m
 		 where m.chat_id=c.id
		 order by m.creado_en desc
		 limit 1
		 )as ultimo_mensaje,

		--fecha del ultimo mensaje
		(select m.creado_en from messages m	
		where m.chat_id=c.id
		order by m.creado_en desc
		limit 1
		)as ultimo_mensaje_creado,
		
		--contar mensajes no leidos
		(select count(*)::int from messages m
		where m.chat_id=c.id
		and m.remitente_id!=p_user_id
		and m.is_read=false
		)as mensajes_no_leidos

	from chats c	
	inner join chat_members cm on cm.chat_id=c.id
	where cm.user_id=p_user_id
	order by(
		select m.creado_en from messages m
		where m.chat_id=c.id
		order by m.creado_en desc
		limit 1
	)desc nulls last
	limit p_limit
	offset p_offset;

end;
$$;


-----------------------------------------------------TERMINADO CRUD DE CHAT-----------------------------------------------------

-----------------------------------------------------CRUD DE CHAT MEMBERS-----------------------------------------------------

create or replace procedure sp_agregar_miembro_grupo(in p_chat_id uuid,in p_admin_id uuid,in p_new_member_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from chats where id=p_chat_id and is_group=true)then
        raise exception 'El chat no existe o no es grupal';
    end if;

	if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_admin_id)then
		raise exception'No eres miembro de este grupo';
	end if;

	if not exists(select 1 from users where id=p_new_member_id and is_active=true)then
		raise exception'El usuario no existe o esta inactivo';
	end if;

	if exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_new_member_id)then
		raise exception'El usuario ya es miembro del grupo';
	end if;

	insert into chat_members(chat_id,user_id)values(p_chat_id,p_new_member_id);
	
	
end;
$$;

create or replace procedure sp_eliminar_miembro_grupo(in p_chat_id uuid,in p_admin_id uuid,in p_member_id uuid)
language plpgsql
as $$
begin
	
	if not exists(select 1 from chats where id=p_chat_id and is_group=true)then
		raise exception'El chat no existe o no es grupal';
	end if;
	
	 if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_admin_id)then
        raise exception 'No eres miembro de este grupo';
     end if;
	
	--eliminar miembro
	delete from chat_members 
	where chat_id=p_chat_id and user_id=p_member_id;
	
	--si el grupo queda con menos 2 de miembros, eliminarlo
	if(select count(*)from chat_members where chat_id=p_chat_id)<2 then
		delete from chats where id=p_chat_id;
	end if;
	 
end;
$$;

create or replace procedure sp_salir_de_grupo( in p_chat_id uuid,in p_user_id uuid)
language plpgsql
as $$
begin

	if not exists(select 1 from chats where id=p_chat_id and is_group=true)then
        raise exception'El chat no existe o no es grupal';
    end if;

	if not exists(select 1 from chat_members where chat_id=p_chat_id and user_id=p_user_id) then
        raise exception 'No eres miembro de este grupo';
    end if;

	--salir del grupo
	delete from chat_members
	where chat_id=p_chat_id and user_id=p_user_id;

	--si el grupo queda con menos 2 de miembros, eliminarlo
	if(select count(*)from chat_members where chat_id=p_chat_id)<2 then
		delete from chats where id=p_chat_id;
	end if;
	
end;
$$;



-----------------------------------------------------TERMINADO DE CRUD CHAT MEMBERS-----------------------------------------------------

-----------------------------------------------------INICIO DE CRUD NOTIFICATIONS-----------------------------------------------------
create or replace function fn_notificar_like()
returns trigger
language plpgsql
as $$
declare v_autor_id uuid;
begin
	
	--obtener autor del post
	select user_id into v_autor_id
	from posts 
	where id=new.post_id;
	
	--no notificar si se da like a si mismo
	if v_autor_id<>new.user_id then
		insert into notifications(user_id,type,reference_id)values(v_autor_id,'like',new.post_id);
	end if;

	return new;

end;
$$;

create or replace function fn_notificar_comentario()
returns trigger
language plpgsql
as $$
declare v_autor_id uuid;
begin
	
	select user_id into v_autor_id
	from posts 
	where id=new.post_id;

	if v_autor_id<>new.user_id then
		insert into notifications(user_id,type,reference_id)values(v_autor_id,'comment',new.post_id);
	end if;

	return new;	

end;
$$;

create or replace function fn_notificar_follow()
returns trigger
language plpgsql
as $$
begin

	if new.follower_id<>new.following_id then
		insert into notifications(user_id,type,reference_id)values(new.following_id,'follow',new.follower_id);
	end if;

	return new;

end;
$$;


-----------------------------------------------------TERMINADO CRUD DE NOTIFICATIONS-----------------------------------------------------

-----------------------------------------------------INICIO CRUD DE LIKES-----------------------------------------------------

/*
 * 
 * Un usuario solo puede dar un like una vez
 * si ya existe, no duplicar 
 * al darle like, crear notificacion
 * al quitar like, borrar like
 */


create or replace procedure sp_dar_like(in p_user_id uuid,in p_post_id uuid)
language plpgsql
as $$
begin
	
	if not exists(select 1 from posts where id=p_post_id)then
		raise exception'el post no existe';
	end if;

	--para evitar likes duplicados
	if exists(select 1 from likes where user_id=p_user_id and post_id=p_post_id)then
		raise exception'El usuario ya dio like a este post';
	end if;

	--insertar like
	insert into likes(user_id,post_id)values(p_user_id,p_post_id);

end;
$$;

create or replace procedure sp_quitar_like(in p_user_id uuid, in p_post_id uuid)
language plpgsql
as $$
begin
	
	delete from likes
	where user_id=p_user_id
	and post_id=p_post_id;

end;
$$;
-----------------------------------------------------TERMINADO CRUD DE LIKES-----------------------------------------------------

-----------------------------------------------------INICIO DE CRUD POST_MEDIA-----------------------------------------------------
create or replace procedure sp_agregar_post_media(in p_post_id uuid,in p_user_id uuid,in p_media_url text,in p_media_type varchar(40),in p_position int,out p_media_id uuid)
language plpgsql
as $$
declare 
	v_autor_id uuid;
begin
	
	select user_id into v_autor_id
	from posts
	where id=p_post_id;

	if v_autor_id is null then
        raise exception 'El post no existe';
    end if;

	if v_autor_id <> p_user_id then
        raise exception 'No tienes permiso para agregar media a este post';
    end if;

	if p_media_type not in ('imagen', 'video') then
        raise exception 'Tipo de media inválido. Debe ser: imagen o video';
    end if;

	if p_media_url is null or trim(p_media_url)=''then
        raise exception 'La URL de media no puede estar vacia';
    end if;

	insert into post_media(post_id,media_url,media_type,position)values(p_post_id,p_media_url,p_media_type,coalesce(p_position,1))
    returning id into p_media_id;

end;
$$;

create or replace procedure sp_eliminar_post_media(in p_media_id uuid,in p_user_id uuid)
language plpgsql
as $$
declare
    v_autor_id uuid;
    v_post_id uuid;
begin
	
	select post_id into v_post_id
    from post_media
    where id=p_media_id;
	  
    if v_post_id is null then
        raise exception'La media no existe';
    end if;
    
	select user_id into v_autor_id
    from posts
    where id=v_post_id;

	if v_autor_id <> p_user_id then
        raise exception 'No tienes permiso para eliminar esta media';
    end if;

	delete from post_media where id=p_media_id;

end;
$$;

create or replace function fn_listar_post_media(p_post_id uuid)
returns table
(

	media_id uuid,
    media_url text,
    media_type varchar,
    media_position int

)
language plpgsql
as $$
begin

	if not exists(select 1 from posts where id=p_post_id)then
        raise exception'El post no existe';
    end if;

	return query
	select
		pm.id,
        pm.media_url,
        pm.media_type,
        pm.position
	from post_media pm
	where pm.post_id=p_post_id
	order by pm.position asc;
	
end;
$$;

create or replace procedure sp_actualizar_posicion_media( in p_media_id uuid,in p_user_id uuid,in p_nueva_position int)
language plpgsql
as $$
declare 
	v_autor_id uuid;
    v_post_id uuid;
begin
	
	select post_id into v_post_id
    from post_media
    where id=p_media_id;
    
    if v_post_id is null then
        raise exception'La media no existe';
    end if;
    
    --Obtener el autor del post
    select user_id into v_autor_id
    from posts
    where id=v_post_id;
    
    --Validar que el usuario sea el autor
    if v_autor_id<>p_user_id then
        raise exception 'No tienes permiso para modificar esta media';
    end if;
    
    
    if p_nueva_position<1 then
        raise exception'La posicion debe ser mayor a 0';
    end if;
    
    -- Actualizar posicion
    update post_media
    set position=p_nueva_position
    where id=p_media_id;
    

end;
$$;
-----------------------------------------------------TERMINADO CRUD DE POST_MEDIA-----------------------------------------------------

-----------------------------------------------------INICIO CRUD DE STICKERS-----------------------------------------------------
create or replace procedure sp_crear_sticker(in p_name varchar(50),in p_sticker_url text,in p_category varchar(50),out p_sticker_id uuid)
language plpgsql
as $$
begin

	if p_sticker_url is null or trim(p_sticker_url)=''then
        raise exception 'La URL del sticker no puede estar vacía';
    end if;

	insert into stickers(name,sticker_url,category)values(p_name,p_sticker_url,p_category)
    returning id into p_sticker_id;

		
end;
$$;


create or replace procedure sp_eliminar_sticker(in p_sticker_id uuid)
language plpgsql
as $$
begin
    
    if not exists(select 1 from stickers where id=p_sticker_id)then
        raise exception'El sticker no existe';
    end if;
    
    -- Eliminar sticker (los message_stickers se eliminaran por CASCADE)
    delete from stickers where id=p_sticker_id;
    
end;
$$;

create or replace function fn_listar_stickers(p_category varchar default null,p_limit int default 50,p_offset int default 0)
returns table
(

    sticker_id uuid,
    name varchar,
    sticker_url text,
    category varchar,
    creado_en timestamp
    
)
language plpgsql
as $$
begin
    
    return query
    select
        s.id,
        s.name,
        s.sticker_url,
        s.category,
        s.creado_en
    from stickers s
    where(p_category is null or s.category=p_category)
    order by s.creado_en desc
    limit p_limit
    offset p_offset;
    
end;
$$;

create or replace function fn_obtener_sticker(p_sticker_id uuid)
returns table
(

    sticker_id uuid,
    name varchar,
    sticker_url text,
    category varchar,
    creado_en timestamp
    
)
language plpgsql
as $$
begin
    
    return query
    select
        s.id,
        s.name,
        s.sticker_url,
        s.category,
        s.creado_en
    from stickers s
    where s.id=p_sticker_id;
    
end;
$$;

create or replace function fn_listar_categorias_stickers()
returns table
(
    category varchar,
    cantidad int
)
language plpgsql
as $$
begin
    
    return query
    select
        s.category,
        count(*)::int as cantidad
    from stickers s
    where s.category is not null
    group by s.category
    order by s.category asc;
    
end;
$$;

create or replace procedure sp_actualizar_sticker(in p_sticker_id uuid,in p_name varchar(50),in p_category varchar(50))
language plpgsql
as $$
begin
    
    
    if not exists(select 1 from stickers where id=p_sticker_id)then
        raise exception'El sticker no existe';
    end if;
    
    --Actualizar sticker
    update stickers
    set 
        name=coalesce(p_name,name),
        category=coalesce(p_category,category)
    where id=p_sticker_id;
    
end;
$$;


--Buscar stickers por nombre
create or replace function fn_buscar_stickers(p_search_term varchar,p_limit int default 20)
returns table
(

    sticker_id uuid,
    name varchar,
    sticker_url text,
    category varchar
    
)
language plpgsql
as $$
begin
    
    return query
    select
        s.id,
        s.name,
        s.sticker_url,
        s.category
    from stickers s
    where s.name ilike '%' ||p_search_term|| '%'
    order by s.creado_en desc
    limit p_limit;
    
end;
$$;





