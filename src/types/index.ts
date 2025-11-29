export interface User {
    id: number;
    username: string;
    email: string;
    personal_token: string;
    created_at: string;
    updated_at: string;
}

export interface UserInboundMapping {
    id: number;
    user_id: number;
    inbound_id: number;
    client_email: string;
    created_at: string;
}

export interface InboundCache {
    inbound_id: number;
    config: string;
    last_updated: string;
}

export interface PanelConfig {
    url: string;
    username: string;
    password: string;
}

// 3x-ui API Types
export interface XUILoginResponse {
    success: boolean;
    msg?: string;
    obj?: any;
}

export interface XUIInbound {
    id: number;
    up: number;
    down: number;
    total: number;
    remark: string;
    enable: boolean;
    expiryTime: number;
    listen: string;
    port: number;
    protocol: string;
    settings: string;
    streamSettings: string;
    tag: string;
    sniffing: string;
    clientStats?: XUIClientStat[];
}

export interface XUIClientStat {
    id: number;
    inboundId: number;
    enable: boolean;
    email: string;
    up: number;
    down: number;
    expiryTime: number;
    total: number;
}

export interface XUIInboundResponse {
    success: boolean;
    msg?: string;
    obj?: XUIInbound[];
}
