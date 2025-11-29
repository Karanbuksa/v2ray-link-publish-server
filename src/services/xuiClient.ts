import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { PanelConfig, XUILoginResponse, XUIInboundResponse, XUIInbound } from '../types';

export class XUIClient {
    private axiosInstance: AxiosInstance;
    private config: PanelConfig;
    private isAuthenticated: boolean = false;

    constructor(config: PanelConfig) {
        this.config = config;

        const jar = new CookieJar();
        this.axiosInstance = wrapper(axios.create({
            baseURL: config.url,
            jar,
            withCredentials: true,
            timeout: 10000,
        }));
    }

    async login(): Promise<boolean> {
        try {
            const response = await this.axiosInstance.post<XUILoginResponse>(
                '/login',
                new URLSearchParams({
                    username: this.config.username,
                    password: this.config.password,
                })
            );

            this.isAuthenticated = response.data.success;

            if (!this.isAuthenticated) {
                console.error('Login failed:', response.data.msg);
            }

            return this.isAuthenticated;
        } catch (error) {
            console.error('Login error:', error);
            this.isAuthenticated = false;
            return false;
        }
    }

    async ensureAuthenticated(): Promise<void> {
        if (!this.isAuthenticated) {
            const success = await this.login();
            if (!success) {
                throw new Error('Failed to authenticate with 3x-ui panel');
            }
        }
    }

    async getInbounds(): Promise<XUIInbound[]> {
        await this.ensureAuthenticated();

        try {
            const response = await this.axiosInstance.get<XUIInboundResponse>(
                '/panel/api/inbounds/list'
            );

            if (!response.data.success) {
                throw new Error(response.data.msg || 'Failed to fetch inbounds');
            }

            return response.data.obj || [];
        } catch (error) {
            console.error('Error fetching inbounds:', error);
            // Попробуем переавторизоваться
            this.isAuthenticated = false;
            await this.ensureAuthenticated();

            // Повторная попытка
            const response = await this.axiosInstance.get<XUIInboundResponse>(
                '/panel/api/inbounds/list'
            );

            if (!response.data.success) {
                throw new Error(response.data.msg || 'Failed to fetch inbounds');
            }

            return response.data.obj || [];
        }
    }

    async getInbound(id: number): Promise<XUIInbound | null> {
        await this.ensureAuthenticated();

        try {
            const response = await this.axiosInstance.get<XUIInboundResponse>(
                `/panel/api/inbounds/get/${id}`
            );

            if (!response.data.success) {
                return null;
            }

            return response.data.obj?.[0] || null;
        } catch (error) {
            console.error(`Error fetching inbound ${id}:`, error);
            return null;
        }
    }

    async getClientTraffics(email: string): Promise<any> {
        await this.ensureAuthenticated();

        try {
            const response = await this.axiosInstance.get(
                `/panel/api/inbounds/getClientTraffics/${email}`
            );

            return response.data;
        } catch (error) {
            console.error(`Error fetching traffic for ${email}:`, error);
            return null;
        }
    }
}
