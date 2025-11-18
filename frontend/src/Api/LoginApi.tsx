import axios from 'axios'
import API_URL from "../config";

export interface LoginData{

    email:string;
    password:string;
}

export const loginUser = async  (data:LoginData) =>{

    const response = axios.post(`${API_URL}/login`, data);
    return response;
}

