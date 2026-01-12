import { pool } from "../../../config/database";
import { AppError } from "../../../middlewares/error.middleware";


export class UsersService
{

    /**
     * 
     * Obtener perfil de usuario por username
     * 
    */

    async getUserbyUsername(username:string):Promise<any>
    {

        try
        {

            const resultado=await pool.query('SELECT * FROM sp_consultar_usuario($1)',[username]);

            if(resultado.rows.length===0)
            {

                throw new AppError(404,'Usuario no encontrado')

            }
            return resultado.rows[0]

        }catch(error){

            if(error instanceof AppError)
            {

                throw error;

            }
            throw new AppError(500,'Error al obtener usuario')

        }

    }

    /**
     * 
     * Listar usuarios con paginacion
     * 
     */
    async listUsers(page:number=1,limit:number=10):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit;

            const resultado=await pool.query('SELECT * FROM listar_usuarios($1,$2)',[limit,offset]);

            //contar total de usuarios activos
            const countResult=await pool.query('SELECT COUNT(*) FROM users WHERE is_active=true')
            const total=parseInt(countResult.rows[0].count);
            const totalPages=Math.ceil(total/limit)

            return{

                users:resultado.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalPages,

                },

            }


        }catch(error){

            throw new AppError(500,'Error al listar usuarios')

        }

    }

    /**
     * 
     * Actualizar perfil del usuario autencicado
     * 
    */
   async updateProfile(userId:string,data:any):Promise<any>
   {

        try
        {

            const{full_name,bio,foto_perfil_url,nacimiento}=data

            //aqui construir query diaámicamente solo con los campos proporcionados
            const updates:string[]=[];
            const values:any[]=[]
            let paramCounter=1

            if(full_name!==undefined)
            {

                updates.push(`full_name=$${paramCounter++}`);
                values.push(full_name)

            }
            if(bio!==undefined)
            {

                updates.push(`bio=$${paramCounter++}`)
                values.push(bio);

            }
            if(foto_perfil_url!==undefined)
            {

                updates.push(`foto_perfil_url=$${paramCounter++}`)
                values.push(foto_perfil_url)

            }
            if(nacimiento!==undefined)
            {

                updates.push(`nacimiento=$${paramCounter++}`)
                values.push(nacimiento)

            }
            if(updates.length===0)
            {

                throw new AppError(400,'No hay campos para actualizar')

            }
            values.push(userId)

            const query=`UPDATE profiles SET ${updates.join(', ')} WHERE user_id=$${paramCounter} RETURNING *`;

            const resultado=await pool.query(query,values);

            if(resultado.rows.length===0)
            {

                throw new AppError(404,'Usuario no encontrado')

            }
            return resultado.rows[0]

        }catch(error){

            console.error('updateProfile error: ',error)
            if(error instanceof AppError)
            {

                throw error

            }
            throw new AppError(500,'Error al actualizar perfil')

        }

   }
   /**
    * 
    * seguir a un usuario
    */
   async followUser(followerId:string,followingId:string):Promise<void>
   {

        try
        {

            await pool.query('CALL sp_seguir_usuario($1,$2)',[followerId,followingId]);

        }catch(error:any){

            if(error.message?.includes('Ya sigue'))
            {

                throw new AppError(400,'Ya sigues a este usuario')

            }
            if(error.message?.includes('No existe'))
            {

                throw new AppError(404,'Usuario no encontrado')

            }
            if(error.message?.includes('Ti mismo'))
            {

                throw new AppError(400,'No puedes seguirte a ti mismo')

            }
            throw new AppError(500,'Error al seguir usuario')

        }

    }

    /**
     * dejar de seguir a un usuario
    */
    async unfollowUser(followerId:string,followingId:string):Promise<void>
    {

        try
        {

            await pool.query('CALL sp_dejar_de_seguir($1,$2)',[followerId,followingId])

        }catch(error){

            throw new AppError(500,'Error al dejar de seguir usuario')

        }
        
    }
    /**
     * obtener lista de seguidores
    */
    async getFollowers(userId:string,page:number=1,limit:number=20):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit
            const resultado=await pool.query('SELECT * FROM fn_listar_seguidores($1,$2,$3)',[userId,limit,offset])

            //para contar el total de seguidores
            const countResult=await pool.query('SELECT COUNT(*) FROM follows WHERE following_id=$1',[userId])

            const total=parseInt(countResult.rows[0].count)
            const totalpages=Math.ceil(total/limit)

            return{

                followers:resultado.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalpages,

                },

            }

        }catch(error){

            throw new AppError(500,'Error al obtener seguidores')

        }

    }
    /**
     * obteneer lista de seguidos
    */
    async getFollowing(userId:string,page:number=1,limit:number=20):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit
            const resultado=await pool.query('SELECT * FROM fn_listar_seguidos($1,$2,$3)',[userId,limit,offset])

            //para contar el total de seguidores
            const countResult=await pool.query('SELECT COUNT(*) FROM follows WHERE follower_id=$1',[userId])

            const total=parseInt(countResult.rows[0].count)
            const totalpages=Math.ceil(total/limit)

            return{

                following:resultado.rows,
                pagination:
                {

                    page,
                    limit,
                    total,
                    totalpages,

                },

            }

        }catch(error){

            throw new AppError(500,'Error al obtener seguidos')

        }

    }





}

