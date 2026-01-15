import { pool } from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

export class PostsService
{

    /**
     * crear un nuevo post
     */
    async createPost(userId:string,subtitulo?:string):Promise<any>
    {

        try
        {

            await pool.query('CALL sp_crear_post($1,$2,$3)',[userId,subtitulo||null,null])//el tercer parametro es el out p_post_id
        
            /**
             * el out parameter viene en result.rows[0]
             * pero como es un call, necesito obtener el id de otra forma
             * voy hacer un query separado para obtener el ultimo post creado
             */
            const postResultado=await pool.query(`SELECT 
                p.id,
                p.user_id,
                p.subtitulo,
                p.creado_en,
                pr.username,
                pr.full_name,
                pr.foto_perfil_url
                FROM posts p
                INNER JOIN profiles pr on pr.user_id=p.user_id
                WHERE p.user_id=$1
                ORDER BY p.creado_en DESC
                LIMIT 1`,
                [userId]
            );
            return postResultado.rows[0]

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Usuario no encontrado')

            }
            if(error.message?.includes('inactivo'))
            {

                throw new AppError(403,'Usuario inactivo')

            }
            throw new AppError(500,'Error al crear post')

        }

    }
    /**
     * listar posts globales con paginacion
     */
    async listGlobalPosts(page:number=1,limit:number=10):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit

            const result=await pool.query('SELECT * FROM listar_posts_global($1,$2)',[limit,offset]);

            //contar el total de posts
            const countResult=await pool.query('SELECT COUNT(*) FROM posts');
            const total=parseInt(countResult.rows[0].count)
            const totalPages=Math.ceil(total/limit)

            return{

                posts:result.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalPages,

                },

            };

        }catch(error){

            throw new AppError(500,'Error al listar posts');

        }

    }
    /**
     * listar posts de un usuario especifico
     */
    async getUserPosts(user_id:string,page:number=1,limit:number=10):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit;

            const result=await pool.query('SELECT * FROM listar_posts_usuario($1,$2,$3)',[user_id,limit,offset]);

            //contar total de posts del usuario
            const countResult=await pool.query('SELECT COUNT(*) FROM posts WHERE user_id=$1',[user_id]);
            const total=parseInt(countResult.rows[0].count)
            const totalPages=Math.ceil(total/limit)

            return{

                posts:result.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalPages,

                },

            };

        }catch(error){

            throw new AppError(500,'Error al listar posts del usuario')

        }

    }
    /**
     * obtener un post por ID
     */
    async getPostById(postId:string):Promise<any>
    {

        try
        {

            const result=await pool.query(`SELECT
                p.id as post_id,
                p.user_id as autor_id,
                pr.username,
                pr.full_name,
                pr.foto_perfil_url,
                p.subtitulo,
                p.creado_en,
                p.actualizado_en,
                (SELECT COUNT(*)FROM likes l WHERE l.post_id=p.id)as like_count,
                (SELECT COUNT(*)FROM comments c WHERE c.post_id=p.id)as comments_count
                FROM posts p
                INNER JOIN profiles pr on pr.user_id=p.user_id
                WHERE p.id=$1`,
                [postId]
            )
            if(result.rows.length===0)
            {

                throw new AppError(404,'Post no encontrado');

            }
            //obtener media del post
            const mediaResult=await pool.query(`SELECT id,media_url,media_type,position FROM post_media WHERE post_id=$1 ORDER BY position ASC`,[postId]);

            const post=result.rows[0]
            post.media=mediaResult.rows;

            return post;

        }catch(error){

            if(error instanceof AppError)
            {

                throw error;

            }
            throw new AppError(500,'Error al obtener post')

        }

    }
    /**
     * editar subtitulo de un post
     */
    async updatePost(post_id:string,user_id:string,subtitulo:string):Promise<any>
    {

        try
        {

            await pool.query('CALL sp_editar_post_subtitulo($1,$2,$3)',[post_id,user_id,subtitulo]);

            //obtener el post actualizado
            return await this.getPostById(post_id);

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Post no encontrado')

            }
            if(error.message?.includes('No tiene permiso'))
            {

                throw new AppError(403,'No tienes permiso para editar este post')

            }
            throw new AppError(500,'Error al actualizar post')

        }

    }
    /**
     * eliminar post
     */
    async deletePost(post_id:string,user_id:string):Promise<void>
    {

        try
        {

            await pool.query('CALL sp_eliminar_post($1,$2)',[post_id,user_id])

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Post no encontrado')

            }
            if(error.message?.includes('No tienes permiso'))
            {

                throw new AppError(403,'No tienes permiso para eliminar este post')

            }
            throw new AppError(500,'Error al eliminar post')

        }

    }
    /**
     * agregar media a un post
     */
    async addMedia(postId:string,userId:string,mediaUrl:string,mediaType:string,position?:number):Promise<any>
    {

        try
        {

            //el stored procedure espera:p_post_id, p_user_id, p_media_url, p_media_type, p_position, OUT p_media_id
            await pool.query('CALL sp_agregar_post_media($1,$2,$3,$4,$5,$6)',[postId,userId,mediaUrl,mediaType,position||1,null]);

            //obtener la media q recien se creooo
            const mediaResult=await pool.query(`SELECT id,post_id,media_url,media_type,position FROM post_media WHERE post_id=$1 AND media_url=$2 ORDER BY id DESC LIMIT 1`,[postId,mediaUrl]);

            return mediaResult.rows[0]

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Post no encontrado')

            }
            if(error.message?.includes('No tiene permiso'))
            {

                throw new AppError(403,'No tienes permiso para agregar media a este post')

            }
            throw new AppError(500,'Error al agregar media')

        }

    }
    /**
     * eliminar media de un post 
     */
    async deleteMedia(postId:string,mediaId:string,userId:string):Promise<void>
    {

        try
        {

            //aqui se verifica que la media pertenece al post
            const Chekeo_De_media=await pool.query('SELECT post_id FROM post_media WHERE id=$1',[mediaId]);

            if(Chekeo_De_media.rows.length===0)
            {

                throw new AppError(404,'Media no encontrada')

            }
            if(Chekeo_De_media.rows[0].post_id!==postId)
            {

                throw new AppError(400,'La media no pertenece a este post')

            }

            await pool.query('CALL sp_eliminar_post_media($1,$2)',[mediaId,userId]);

        }catch(error:any){

            if(error instanceof AppError)
            {

                throw error;

            }
            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'media no encontrada chele')

            }
            if(error.message?.includes('no tienes permiso'))
            {

                throw new AppError(403,'No tienes permiso para eliminar esta mediaaa')

            }
            throw new AppError(500,'Error al eliminar media')

        }

    }

}
