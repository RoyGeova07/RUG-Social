create database RUG_SOCIAL;

/*
 * 
 * para el id usare UUID, este significa 
 * Universally Unique Identifier
	(Identificador Universal unico)
	
	me sirve para dentificar una fila de forma unica.
	me generara id aleatorios
 * 
 */

create extension if not exists "pgcrypto";

create table users
(

	id uuid primary key default gen_random_uuid(),
	email varchar(120)unique not null,
	password_hash text not null,
	is_active boolean default true,
	creado_en timestamp default current_timestamp,
	actualizado_en timestamp default current_timestamp

);

SELECT datname FROM pg_database;


/*
 * 
 * creo una tabla aparte porque el estado del usuario es informacion temporal y muy cambiante,
	mientras que los datos del usuario son informacion estable.
 * 
 */
create table user_status
(

	user_id uuid primary key,
	status varchar(20)not null,--online, offline, away
	last_seen timestamp,
	
	constraint fk_status_user foreign key(user_id)references users(id)on delete cascade

);

create table profiles
(

	user_id uuid primary key,
	username varchar(50)unique not null,
	full_name varchar(120),
	bio text,
	nacimiento date,
	foto_perfil_url text,
	creado_en timestamp default current_timestamp,
	
	constraint f_profile_user foreign key(user_id)references users(id)on delete cascade 

);

create table follows
(

	follower_id uuid not null,
	following_id uuid not null,
	creado_en timestamp default current_timestamp,
	
	primary key(follower_id,following_id),
	constraint fk_follower foreign key(follower_id)references users(id)on delete cascade,
	constraint fk_following foreign key(following_id)references users(id)on delete cascade,
	--no se sigue asi mismo
	constraint no_self_following  check(follower_id<>following_id)

);


create table posts
(

	id uuid primary key default gen_random_uuid(),
	user_id uuid not null,
	subtitulo text,
	creado_en timestamp default current_timestamp,
	actualizado_en timestamp default current_timestamp,
	
	constraint fk_post_user foreign key(user_id)references users(id)on delete cascade 

);

create table post_media
(

	id uuid primary key default gen_random_uuid(),
	post_id uuid not null,
	media_url text not null,
	media_type varchar(20)not null, --imagen o video chele?
	position int default 1,
	
	constraint fk_media_post foreign key(post_id)references posts(id)on delete cascade

);

create table likes
(

	user_id uuid not null,
	post_id uuid not null,
	creado_en timestamp default current_timestamp,
	
	primary key(user_id,post_id),
	
	constraint fk_like_user foreign key(user_id)references users(id)on delete cascade,
	constraint fk_like_post foreign key(post_id)references posts(id)on delete cascade

);

create table comments
(

	id uuid primary key default gen_random_uuid(),
	post_id uuid not null,
	user_id uuid not null,
	contenido text not null,
	creado_en timestamp default current_timestamp,
	
	constraint fk_comment_post foreign key(post_id)references posts(id)on delete cascade,
	constraint fk_commnet_user foreign key(user_id)references users(id)on delete cascade

);

create table stories
(

	id uuid primary key default gen_random_uuid(),
	user_id uuid not null,
	media_url text not null,
	media_type varchar(20)not null,
	creado_en timestamp default current_timestamp,
	expirado_en timestamp not null,
	
	constraint fk_story_user foreign key(user_id)references users(id)on delete cascade

);


create table chats
(

	id uuid primary key default gen_random_uuid(),
	is_group boolean default false,
	creado_en timestamp default current_timestamp

);

create table chat_members
(

	chat_id uuid not null,
	user_id uuid not null,
	
	primary key(chat_id,user_id),
	constraint fk_chat_member_chat foreign key(chat_id)references chats(id)on delete cascade,
	constraint fk_chat_member_user foreign key(user_id)references users(id)on delete cascade
	

);


create table messages
(

	id uuid primary key default gen_random_uuid(),
	chat_id uuid not null,
	remitente_id uuid not null,
	message_type varchar(20)not null,--texto,audio,sticker,imagen,video
	contenido_texto text,--solo si es texto
	is_read boolean default false,
	creado_en timestamp default current_timestamp,
	
	constraint fk_message_chat foreign key(chat_id)references chats(id)on delete cascade,
	constraint fk_message_remitente foreign key(remitente_id)references users(id)on delete cascade

);

create table messages_media
(

	id uuid primary key default gen_random_uuid(),
	message_id uuid not null,
	media_url text not null,
	media_type varchar(20)not null,--audio,sticker,imagen,video
	duracion_segundos int,--solo para audio y video
	creado_en timestamp default current_timestamp,
	
	constraint fk_message_media foreign key(message_id)references messages(id)on delete cascade

);

create table stickers
(

	id uuid primary key default gen_random_uuid(),
	name varchar(50),
	sticker_url text not null,
	category varchar(50),
	creado_en timestamp default current_timestamp

);

create table message_stickers
(

	message_id uuid primary key,
	sticker_id uuid not null,
	
	constraint fk_msg_sticker_message foreign key(message_id)references messages(id)on delete cascade,
	constraint fk_msg_sticker_sticker foreign key(sticker_id)references stickers(id)on delete cascade

);

create table notifications
(

	id uuid primary key default gen_random_uuid(),
	user_id uuid not null,
	type varchar(30)not null,--like,follow,comment,message
	reference_id uuid,
	is_read boolean default false,
	creado_en timestamp default current_timestamp,
	
	constraint fk_notication_user foreign key(user_id)references users(id)on delete cascade

);


--indices necesarios, sin los indices tendria que leer toda la tabla, pero con los indices puedo ir directo al dato
--en mi red social, sin indices me moriria en el perfomance |si una columna aparece mucho en un where,join o order by -> se necesita indice|
create index idx_posts_user_id on posts(user_id);
create index idx_posts_created on posts(creado_en desc);
create index idx_likes_post_id on likes(post_id);
create index idx_comment_post_id on comments(post_id);
create index idx_follows_following on follows(following_id);
create index idx_messages_chat_id on messages(chat_id);
create index idx_messages_created on messages(creado_en);
create index idx_stories_expirado on stories(expirado_en);
create index idx_notifications_user_unread on notifications(user_id,is_read);
create index idx_follows_follower on follows(follower_id);






























































































