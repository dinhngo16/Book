import axios from "services/axios.customize"
export const loginAPI = (username:string,password:string) => {
    const urlBE = "/api/v1/auth/login";
    return axios.post<IBackendRes<ILogin>>(urlBE,{username,password})
};
export const registerAPI = (fullName:string,email:string,password:string,phone:string) => {
    const urlBE = "/api/v1/user/register";
    return axios.post<IBackendRes<iRegister>>(urlBE,{fullName,email,password,phone})
}
export const fetchAccountAPI = () => {
    const urlBE = "/api/v1/auth/account";
    return axios.get<IBackendRes<ifetchAccount>>(urlBE,{
        headers: {
            delay: 1000
        }
    })
}
export const logOutAPI = () => {
    const urlBE = "/api/v1/auth/logout";
    return axios.post<IBackendRes<iRegister>>(urlBE)
}
export const getUserAPI = (query: string) => {
    const urlBE = `/api/v1/user?${query}`;
    return axios.get<IBackendRes<IModelPaginate<iUserTable>>>(urlBE)
}
export const addUserAPI = (fullName:string,email:string,password:string,phone:string) => {
    const urlBE = "/api/v1/user";
    return axios.post<IBackendRes<iRegister>>(urlBE,{fullName,email,password,phone})
}
export const bulkCreatUserAPI = (data:{password:string,fullName:string,email:string,phone:string}[]) => {
    const urlBE = "/api/v1/user/bulk-create";
    return axios.post<IBackendRes<iResponImport>>(urlBE,data)
}
export const editUserAPI = (_id:string,fullName:string,phone:string) => {
    const urlBE = "/api/v1/user";
    return axios.put<IBackendRes<iRegister>>(urlBE,{_id,fullName,phone})
}
export const deleteUserAPI = (_id:string) => {
    const urlBE = `/api/v1/user/${_id}`;
    return axios.delete<IBackendRes<iRegister>>(urlBE)
}
export const getBookAPI = (query: string) => {
    const urlBE = `/api/v1/book?${query}`;
    return axios.get<IBackendRes<IModelPaginate<iBookTable>>>(urlBE)
}
export const getBookOneAPI = (id: string) => {
    const urlBE = `/api/v1/book/${id}`;
    return axios.get<IBackendRes<IModelPaginate<iBookTable>>>(urlBE)
}
export const dataSL = () => {
    const urlBE = `/api/v1/database/category`;
    return axios.get<IBackendRes<string[]>>(urlBE)
}
export const uploadFile = (fileImg:any,folder:any) => {
    const bodyFormData = new FormData();
    bodyFormData.append('fileImg', fileImg);
    return axios<IBackendRes<{
        fileUploaded: string
    }>>({
        method: 'post',
        url: '/api/v1/file/upload',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "upload-type": folder
        },
    });
}
export const creatBook = (data:{author:string, category:string, price:number, mainText:string, quantity:number, thumbnail:string, slider:string[]}) => {
    const urlBE = `/api/v1/book`;
    return axios.post<IBackendRes<iRegister>>(urlBE,data)
}
export const editBookAPI = (_id:string,data:{author:string, category:string, price:number, mainText:string, quantity:number, thumbnail:string, slider:string[]}) => {
    const urlBE = `/api/v1/book/${_id}`;
    return axios.put<IBackendRes<iRegister>>(urlBE,data)
}
export const deleteBookAPI = (_id:string) => {
    const urlBE = `/api/v1/book/${_id}`;
    return axios.delete<IBackendRes<iRegister>>(urlBE)
}

export const creatOrder = (data:{name:string, type:string, phone:number, mainText:string, totalPrice:number, detail:string[]}) => {
    const urlBE = `/api/v1/order`;
    return axios.post<IBackendRes<iOrder>>(urlBE,data)
}

export const getHistory = () => {
    const urlBE = `/api/v1/history`;
    return axios.get<IBackendRes<string[]>>(urlBE)
}

export const editUserIFAPI = (data:{_id:string,fullName:string,phone:string,avatar:string}) => {
    const urlBE = "/api/v1/user";
    return axios.put<IBackendRes<iUser>>(urlBE,data)
}

export const editPWAPI = (data:{email:string,oldpw:string,newpw:string}) => {
    const urlBE = "/api/v1/user/change-password";
    return axios.post<IBackendRes<iRegister>>(urlBE,data)
}

export const getOrderAPI = (query: string) => {
    const urlBE = `/api/v1/order?${query}`;
    return axios.get<IBackendRes<IModelPaginate<string[]>>>(urlBE)
}

export const getDBAPI = () => {
    const urlBE = `/api/v1/database/dashboard`;
    return axios.get<IBackendRes<{
        countOrder:number,
        countUser:number,
        countBook:number
    }>>(urlBE)
}