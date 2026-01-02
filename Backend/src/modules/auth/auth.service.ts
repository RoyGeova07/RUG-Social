import { pool } from '../../config/database'
import { hashPassword,comparePassword } from '../../utils/bcrypt';
import { GenerarToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error.middleware';
import { CreateUser,Login } from '../../types/model';

export class AuthService
{

    /**
   * Registra un nuevo usuario
   * 
   * @param userData - Datos del usuario a registrar
   * @returns Token JWT del usuario registrado
   * 
   * Pasos:
   * 1. Hashea la contraseña
   * 2. Llama al stored procedure sp_crear_usuario
   * 3. Si todo sale bien, genera un token JWT
   * 4. Si hay error (email o username duplicado), lanza excepcion
   */

    async registrar(userData:CreateUser):Promise<{token:string;user:any}>
    {

        const{email,password,username,full_name,nacimiento}=userData;

        try
        {

            //hashear contra
            const password_hash=await hashPassword(password);

            //llamar stores procedure
            //sp_crear_usuario(email, password_hash, username, full_name, nacimiento)
            await pool.query('CALL sp_crear_usuario($1,$2,$3,$4,$5)',[email,password_hash,username,full_name,nacimiento]);

            //obtener el usuario recien creado
            const resultado=await pool.query('SELECT*FROM sp_consultar_usuario($1)',[username]);

            if(resultado.rows.length===0)
            {

                throw new AppError(500,'Error al crear usuario');

            }
            const user=resultado.rows[0];

            //generar token JWT
            const token=GenerarToken
            ({

                id:user.user_id,
                email:user.email,
                username:user.username,

            });

            return{

                token,
                user:
                {

                    id:user.user_id,
                    email:user.email,
                    username:user.username,
                    full_name:user.full_name,
                    foto_perfil_url:user.foto_perfil_url,

                },

            };

        }catch(error:any){

            //para manejar errores especificos 
            if(error.message?.includes('Ya esta registrado'))
            {

                throw new AppError(400,'El correo ya esta registrado');

            }
            if(error.message?.includes('Ya existe'))
            {

                throw new AppError(400,'El nombre de usuario ya existe');

            }
            throw error;

        }
        

    }


  /**
   * Inicia sesion de un usuario
   * 
   * @param credentials - Email y contraseña
   * @returns Token JWT y datos del usuario
   * 
   * Pasos:
   * 1. Busca el usuario por email
   * 2. Verifica que exista y esté activo
   * 3. Compara la contraseña
   * 4. Si todo es correcto, genera token JWT
    */

    async login(credentials:Login):Promise<{token:string;user:any}>
    {

        const{email,password}=credentials;

        try
        {

            //buscar usuario por email
            const userResult=await pool.query('SELECT id,email,password_hash,is_active FROM users where email=$1',[email]);

            if(userResult.rows.length===0)
            {

                throw new AppError(401,'Credenciale invalidas');

            }
            const user=userResult.rows[0];

            //se verifica q si el usuario esta activa
            if(!user.is_active)
            {

                throw new AppError(403,'Tu cuenta ha sido desactivada. Contacta a Roy el MERO MERO')

            }
            //comparar la contra
            const isPasswordValid=await comparePassword(password,user.password_hash);

            if(!isPasswordValid)
            {

                throw new AppError(401,'Credenciales invalidas');

            }
            //obtener el perfil completo
            const profileResult=await pool.query('SELECT username,full_name,foto_perfil_url FROM profiles where user_id=$1',[user.id]);

            const profile=profileResult.rows[0];

            await pool.query(`
            INSERT INTO user_status(user_id, status, last_seen)
            VALUES ($1, 'online', CURRENT_TIMESTAMP)
            ON CONFLICT (user_id)
            DO UPDATE SET status='online', last_seen=CURRENT_TIMESTAMP
            `,[user.id]);


            //generar token
            const token=GenerarToken
            ({
                
                id:user.id,email:user.email,username:profile.username

            })

            return{

                token,
                user:
                {

                    id:user.id,
                    email:user.email,
                    username:profile.username,
                    full_name:profile.full_name,
                    foto_perfil_url:profile.foto_perfil_url,

                },

            };

        }catch(error){

            if(error instanceof AppError)
            {

                throw error;

            }
            throw new AppError(500,'Error al iniciar sesion');

        }

    }

    /**
   * Obtiene el perfil del usuario autenticado
   * 
   * @param userId - ID del usuario
   * @returns Datos completos del usuario
   */

    async getProfile(userId:string):Promise<any>
    {

        try
        {

            const result=await pool.query
            (

                `SELECT
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
                FROM users u
                INNER JOIN profiles p ON p.user_id=u.id
                LEFT JOIN user_status us ON us.user_id=u.id
                WHERE u.id=$1`,
                [userId]

            );

            if(result.rows.length===0)
            {

                throw new AppError(404,'Usuario no encontrado');

            }
            return result.rows[0];

        }catch(error){

            if(error instanceof AppError)
            {

                throw error;

            }
            throw new AppError(500,'Error al obtener el perfil');

        }

    }

}