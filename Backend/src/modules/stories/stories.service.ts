import { pool } from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

export class StoriesService
{

    /**
     * crear un nueva story, la story expira en 24 horas
     */
    async createStory(userId:string,mediaUrl:string,mediaType:string):Promise<any>
    {

        try
        {

            await pool.query('CALL sp_crear_story($1,$2,$3)',[userId,mediaUrl,mediaType])

            //aqui se obtiene la story recien creada 
            const result=await pool.query(
                `SELECT 
                    s.id,
                    s.user_id,
                    s.media_url,
                    s.media_type,
                    s.creado_en,
                    s.expirado_en,
                    pr.username,
                    pr.full_name,
                    pr.foto_perfil_url
                FROM stories s
                INNER JOIN profiles pr ON pr.user_id=s.user_id
                WHERE s.user_id=$1
                ORDER BY s.creado_en DESC
                LIMIT 1`,
                [userId]
            )
            return result.rows[0];


        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Usuario no encontrado')

            }
            if(error.message?.includes('inactivo'))
            {

                throw new AppError(403,'Usuario inactivo')

            }
            throw new AppError(500,'Error al crear story')

        }

    }
    /**
     * me servira para obtener las stories de usuarios que sigo y mis prpias stories
     * solo muestra stories que no han expirado
     */
    async getStoriesFeed(userId:string):Promise<any>
    {

        try
        {

            const result=await pool.query('SELECT * FROM fn_listar_stories_usuario($1)',[userId])

            //agrupar stories por usuario, en resumen creo un mapa, donde la clave es el userId, valor objeto con info del usuario + sus stories
            //me permite agrupar stories sin haces multiples queries
            const storiesByUser:{[key:string]:any}={};

            //recorrer cada story devuelta por la bd, cada story representa una fila del resultado sql, UN USUARIO PUEDE TENER VARIAS STORIES
            result.rows.forEach((story)=>
            {

                const userKey=story.user_id;//se identifica a que usuario pertenece la story, se usa como clave del grupo
                //se crea el grupo del usuario, si aun no existe
                //esto se hace porque, la primera story de un usuario crea su contenedor
                //las siguientes stories del mismo usuario se agregan al arreglo

                //el resultado -> un usuario aparece una sola vez, con todas sus stories juntas
                if(!storiesByUser[userKey])
                {

                    storiesByUser[userKey]=
                    {

                        userId:story.user_id,
                        username:story.username,
                        foto_perfil_url:story.foto_perfil_url,
                        stories:[],

                    };

                }
                //se agrega la storie al usuario correspondiente
                //aqui solo se guarda los datos de la historia, no del usuario
                storiesByUser[userKey].stories.push(
                {

                    story_id:story.story_id,
                    media_url:story.media_url,
                    media_type:story.media_type,
                    creado_en:story.creado_en,

                })

            })
            //convertir el objeto a un arreglo
            //esto se hace porque el frontend espera arreglos, no objetos
            //Object.values() elimina las claves (user_id)
            //devuelve solo los valores agrupados
            const groupedStories=Object.values(storiesByUser)
            return groupedStories

        }catch(error){

            console.log(error)
            throw new AppError(500,'Error al obtener stories ')

        }

    }
    /**
     * Eliminar una story
     * solo el auto puede eliminarla
     */
    async deleteStory(storyId:string,userId:string):Promise<void>
    {

        try
        {

            await pool.query('CALL sp_eliminar_story($1,$2)',[storyId,userId])

        }catch(error:any){

            if(error.message?.includes('no existe'))
            {

                throw new AppError(404,'Story no encontrada')

            }
            throw new AppError(500,'Error al eliminar story')

        }

    }
    /**
     * obtener mis stories (sola las activas)
     */
    async getMyStories(userId:string):Promise<any>
    {

        try
        {

            const result=await pool.query(
                `SELECT
                    s.id,
                    s.user_id,
                    s.media_url,
                    s.media_type,
                    s.creado_en,
                    s.expirado_en
                FROM stories s
                WHERE s.user_id=$1 AND s.expirado_en>CURRENT_TIMESTAMP
                ORDER BY s.creado_en DESC`,
                [userId]
            )
            return result.rows;

        }catch(error){

            console.log(error)
            throw new AppError(500,'Error al obtener tus stories')

        }

    }

}