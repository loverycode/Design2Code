import axios from 'axios';
const API_BASE = 'http://localhost:3001/api/auth';

export const register = async (email: string, firstName: string, lastName: string, password: string)=>{
    const res = await axios.post(`${API_BASE}/register`, {
        email,
        first_name: firstName,
        last_name: lastName,
        password
    });
    return res.data;
}

export const login = async (email: string, password: string)=>{
    const res = await axios.post(`${API_BASE}/login`, {
        email,
        password
    });
    if (res.data.accessToken){
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    return res.data;
};
export const logout =  ()=>{
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
export const getAccessToken=()=>localStorage.getItem('accessToken');
export const isAuthenticated=()=>{
    const token = getAccessToken();
    return !!token;
};
