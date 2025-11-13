import axios from 'axios'

export interface LoginData{

    email:string;
    password:string;
}

export const loginUser = async  (data:LoginData) =>{

    const response = axios.post("http://localhost:5000/login",data);
    return response;
}

