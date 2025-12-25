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