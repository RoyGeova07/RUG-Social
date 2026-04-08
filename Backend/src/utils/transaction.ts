import{pool}from'../config/database'
import { PoolClient } from 'pg'

export async function withTransaction<T>(callBack:(client: PoolClient)=>Promise<T>):Promise<T>
{

    const client=await pool.connect()
    try
    {

        await client.query('BEGIN')
        const result=await callBack(client)
        await client.query('COMMIT')
        
        return result;

    }catch(e){

        try
        {

            await client.query('ROLLBACK')

        }catch{}
        throw e

    }finally{

        client.release()

    }

}