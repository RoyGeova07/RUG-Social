import { Request }from"express";

declare global
{

    namespace Express
    {

        interface Request
        {

            user?:
            {

                id:string;//uuid
                email:string;
                username:string;
                is_active:boolean;

            };

        }

    }

}
export{};