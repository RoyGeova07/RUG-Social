
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

create or replace procedure sp_eliminar_post(in p_post_id uuid,in p_user_post uuid)
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

create or replace procedure sp_dejar_de_seguir(in p_follower uuid,in p_following uuid)
language plpgsql
as $$
begin

	delete from follows where follower_id=p_follower_id
	and following_id=p_following_id;

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

create or replace function fn_listar_seguidos(p_user_id uuid,p_limit int,p_offset int)
returns table
(

	user_id uuid,
	username varchar,
	full_name timestamp,
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
	full_name timestamp,
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
create or replace procedure sp_crear_story(in p_user_id uuid,in p_media_url text,in p_media_type varchar(20))
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

create or replace procedure sp_eliminar_story(in p_story uuid,in p_user_id uuid)
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

-----------------------------------------------------TERMINADO CRUD DE STORIES-----------------------------------------------------


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






