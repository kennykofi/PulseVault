import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001', // Backend URL
    withCredentials: true 
});

export default API;

