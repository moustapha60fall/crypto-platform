import axios from "axios";
import keycloak from "@/keycloak";

const axiosClient = axios.create({
    baseURL: "http://localhost:8082/api",
});

axiosClient.interceptors.request.use((config) => {
    if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
});

export default axiosClient;
