import { pool } from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

export class CommentsService
{

    /**
     * crear un comentario en un post
     */
    async createComment(userId:string,postId:string,contenido:string):Promise<any>
    {

        try
        {

            await pool.query('CALL sp_crear_comentario($1,$2,$3)',[userId,postId,contenido]);
            //obtener el comentario recien creado
            const result=await pool.query(
                `SELECT
                    c.id,
                    c.post_id,
                    c.user_id,
                    c.contenido,
                    c.creado_en,
                    pr.username,
                    pr.full_name,
                    pr.foto_perfil_url
                FROM comments c
                INNER JOIN profiles pr on pr.user_id=c.user_id
                WHERE c.user_id=$1 AND c.post_id=$2
                ORDER BY c.creado_en DESC
                LIMIT 1`,[userId,postId]);

            return result.rows[0]
            
        }catch(error:any){

            if(error.message?.includes('no puede estar vacio'))
            {

                throw new AppError(400,'El comentario no puede estar vacio');

            }
            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Usuario o post no encontrado')

            }
            if(error.message?.includes('inactivo'))
            {

                throw new AppError(403,'Usuario inactivo')

            }
            throw new AppError(500,'Error al crear comentario')

        }

    }
    /**
     * listar comentarios de un post con paginacion
     */
    async getPostComments(postId:string,page:number=1,limit:number=20):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit;

            //aqui se verifica q el post existe
            const Chekeo_de_post=await pool.query('SELECT id FROM posts WHERE id=$1',[postId]);

            if(Chekeo_de_post.rows.length===0)
            {

                throw new AppError(404,'Post no encontrado')

            }
            //aqui se obtiene los comentarios
            const result=await pool.query(
                `SELECT 
                    c.id,
                    c.post_id,
                    c.user_id,
                    c.contenido,
                    c.creado_en,
                    pr.username,
                    pr.full_name,
                    pr.foto_perfil_url
                FROM comments c
                INNER JOIN profiles pr ON pr.user_id=c.user_id
                WHERE c.post_id=$1
                ORDER BY c.creado_en ASC
                LIMIT $2 OFFSET $3`,[postId,limit,offset]);
            
            //contar total de comentarios
            const countResult=await pool.query('SELECT COUNT(*) FROM comments WHERE post_id=$1',[postId]);
            const total=parseInt(countResult.rows[0].count)
            const totalPages=Math.ceil(total/limit)

            return{

                comments:result.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalPages,

                },

            };

        }catch(error){

            if(error instanceof AppError)
            {

                throw error;

            }
            throw new AppError(500,'Error al obtener comentarios')

        }

    }
    /**
     * eliminar un comentario, solo lo puede eliminar el autor del comentario y el dueño del post
     */
    async deleteComment(commentId:string,userId:string):Promise<void>
    {

        try
        {

            await pool.query('CALL sp_borrar_comentario($1,$2)',[commentId,userId])

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Comentario no encontrado')

            }
            if(error.message?.includes('No tiene permiso'))
            {

                throw new AppError(403,'No tienes permiso para eliminar este comentario')

            }
            throw new AppError(500,'Error al eliminar el comentario');

        }

    }
    

}