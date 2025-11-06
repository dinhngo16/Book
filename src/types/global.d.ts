export {};

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        },
        result: T[]
    }

    interface ILogin{
        access_token:string,
        "user": {
            "email": string,
            "phone": string,
            "fullName": string,
            "role": string,
            "avatar": string,
            "password":string,
            "id": string
        }
    }
    interface iRegister{
        _id:string,
        "email": string,
        "phone": string,
        "fullName": string,
        "password":string
    }
    interface iUser{
        "email": string,
        "phone": string,
        "fullName": string,
        "role": string,
        "avatar": string,
        "password":string,
        "id": string
    }

    interface ifetchAccount{
        user: iUser
    }
    
    interface iUserTable{
        _id:string,
        "email": string,
        "phone": string,
        "fullName": string,
        "role": string,
        "avatar": string,
        "isActive": boolean,
        "createdAt": Date,
        "updatedAt": Date,
    }

    interface iResponImport{
        countSuccess: number,
        countError: number,
        detail: any
    }

    interface iBook{
        "thumbnail": string,
        "mainText": string,
        "author": string,
        "price": number,
        "quantity": number,
        "id": string
    }
    interface iBookTable{
        _id:string,
        "thumbnail": string,
        "mainText": string,
        slider: string[],
        "author": string,
        "price": number,
        "quantity": number,
        sold: number,
        "category": string,
        "createdAt": Date,
        "updatedAt": Date,
    }
    interface iResCart{
        _id:string,
        detail: iBookTable,
        "quantity": number,
    }

    interface iOrder{
        _id:string,
        "name": string,
        "type": string,
        "phone": number,
        "detail": string[],
        "totalPrice": number,
    }
    interface iOrderTable extends iOrder {
         "createdAt": Date,
    }
}
