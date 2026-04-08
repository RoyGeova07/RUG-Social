create trigger trg_users_actualizado
before update on users
for each row 
execute function fn_set_actualizado_en();

create trigger trg_notificar_like
after insert on likes
for each row 
execute function fn_notificar_like();

create trigger trg_notificar_comentario
after insert on comments
for each row 
execute function fn_notificar_comentario();

create trigger trg_notificar_follow
after insert on follows
for each row
execute function fn_notificar_follow();

create trigger trg_posts_actualizado
before update on posts
for each row
execute function fn_set_actualizado_en();

--insertare un sticker random en la tabla, ya que no tengo xd
INSERT INTO stickers(name, sticker_url, category)
VALUES('Feliz', 'https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif', 'emociones')
RETURNING id;