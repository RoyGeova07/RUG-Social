import { pool } from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

export class LikesService
{

    /**
     * dar like a un post
     */
    async likePost(userId:string,postId:string):Promise<void>
    {

        try
        {

            await pool.query('CALL sp_dar_like($1,$2)',[userId,postId]);

        }catch(error:any){

            if(error.message?.includes('no existe')) 
            {

                throw new AppError(404,'Post no encontrado');

            }
            if(error.message?.includes('ya dio like')) 
            {

                throw new AppError(400,'Ya diste like a este post');
                
            }
            throw new AppError(500,'Error al dar like');

        }

    }
    /**
     * quitar like de un post
     */
    async unlikePost(userId:string,postId:string):Promise<void>
    {

        try
        {

            await pool.query('CALL sp_quitar_like($1,$2)',[userId,postId])

        }catch(error){

            throw new AppError(500,'Error al quitar like')

        }

    }
    /**
     * listar usuarios que dieron like a un post
     */
    async getPostLike(postId:string,page:number=1,limit:number=20):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit;
            const result=await pool.query('SELECT * FROM fn_listar_likes_post($1,$2,$3)',[postId,limit,offset]);
            //contar total de likes
            const countResult=await pool.query('SELECT COUNT(*)FROM likes WHERE post_id=$1',[postId]);
            const total=parseInt(countResult.rows[0].count);
            const totalPages=Math.ceil(total/limit)

            return{

                likes:result.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalPages,

                },

            };

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Post no encontrado')

            }
            throw new AppError(500,'Error al obtener likes del post')

        }

    }
    /**
     * verificar si un usuario dio like a un post
     */
    async checkUserLike(userId:string,postId:string):Promise<boolean>
    {

        try
        {

            const result=await pool.query('SELECT fn_user_dio_like($1,$2)as has_liked',[userId,postId]);
            return result.rows[0].has_liked

        }catch(error){

            throw new AppError(500,'Error al verificar like')

        }

    }

}