import { XUIInbound } from '../types';

export class LinkGenerator {
    /**
     * Генерирует V2Ray ссылку для клиента на основе конфигурации инбаунда
     */
    generateLink(inbound: XUIInbound, clientEmail: string): string | null {
        try {
            const protocol = inbound.protocol.toLowerCase();

            switch (protocol) {
                case 'vmess':
                    return this.generateVMessLink(inbound, clientEmail);
                case 'vless':
                    return this.generateVLESSLink(inbound, clientEmail);
                case 'trojan':
                    return this.generateTrojanLink(inbound, clientEmail);
                case 'shadowsocks':
                    return this.generateShadowsocksLink(inbound, clientEmail);
                default:
                    console.warn(`Unsupported protocol: ${protocol}`);
                    return null;
            }
        } catch (error) {
            console.error('Error generating link:', error);
            return null;
        }
    }

    private generateVMessLink(inbound: XUIInbound, clientEmail: string): string {
        const settings = JSON.parse(inbound.settings);
        const streamSettings = JSON.parse(inbound.streamSettings);

        // Находим клиента
        const client = settings.clients?.find((c: any) => c.email === clientEmail);
        if (!client) {
            throw new Error(`Client ${clientEmail} not found in inbound ${inbound.id}`);
        }

        const vmessConfig = {
            v: '2',
            ps: inbound.remark || clientEmail,
            add: this.getAddress(inbound),
            port: inbound.port.toString(),
            id: client.id,
            aid: client.alterId?.toString() || '0',
            net: streamSettings.network || 'tcp',
            type: streamSettings[streamSettings.network]?.type || 'none',
            host: streamSettings[streamSettings.network]?.host || '',
            path: streamSettings[streamSettings.network]?.path || '',
            tls: streamSettings.security || 'none',
            sni: streamSettings.tlsSettings?.serverName || '',
            alpn: streamSettings.tlsSettings?.alpn?.join(',') || ''
        };

        const encoded = Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
        return `vmess://${encoded}`;
    }

    private generateVLESSLink(inbound: XUIInbound, clientEmail: string): string {
        const settings = JSON.parse(inbound.settings);
        const streamSettings = JSON.parse(inbound.streamSettings);

        const client = settings.clients?.find((c: any) => c.email === clientEmail);
        if (!client) {
            throw new Error(`Client ${clientEmail} not found in inbound ${inbound.id}`);
        }

        const address = this.getAddress(inbound);
        const params = new URLSearchParams();

        params.append('type', streamSettings.network || 'tcp');
        params.append('security', streamSettings.security || 'none');

        if (streamSettings.security === 'tls') {
            if (streamSettings.tlsSettings?.serverName) {
                params.append('sni', streamSettings.tlsSettings.serverName);
            }
            if (streamSettings.tlsSettings?.alpn) {
                params.append('alpn', streamSettings.tlsSettings.alpn.join(','));
            }
        }

        const network = streamSettings.network;
        if (network === 'ws' && streamSettings.wsSettings) {
            if (streamSettings.wsSettings.path) {
                params.append('path', streamSettings.wsSettings.path);
            }
            if (streamSettings.wsSettings.headers?.Host) {
                params.append('host', streamSettings.wsSettings.headers.Host);
            }
        } else if (network === 'grpc' && streamSettings.grpcSettings) {
            if (streamSettings.grpcSettings.serviceName) {
                params.append('serviceName', streamSettings.grpcSettings.serviceName);
            }
        }

        const remark = encodeURIComponent(inbound.remark || clientEmail);
        return `vless://${client.id}@${address}:${inbound.port}?${params.toString()}#${remark}`;
    }

    private generateTrojanLink(inbound: XUIInbound, clientEmail: string): string {
        const settings = JSON.parse(inbound.settings);
        const streamSettings = JSON.parse(inbound.streamSettings);

        const client = settings.clients?.find((c: any) => c.email === clientEmail);
        if (!client) {
            throw new Error(`Client ${clientEmail} not found in inbound ${inbound.id}`);
        }

        const address = this.getAddress(inbound);
        const params = new URLSearchParams();

        params.append('type', streamSettings.network || 'tcp');
        params.append('security', streamSettings.security || 'tls');

        if (streamSettings.tlsSettings?.serverName) {
            params.append('sni', streamSettings.tlsSettings.serverName);
        }

        const remark = encodeURIComponent(inbound.remark || clientEmail);
        return `trojan://${client.password}@${address}:${inbound.port}?${params.toString()}#${remark}`;
    }

    private generateShadowsocksLink(inbound: XUIInbound, clientEmail: string): string {
        const settings = JSON.parse(inbound.settings);

        const method = settings.method;
        const password = settings.password;
        const address = this.getAddress(inbound);

        const credentials = `${method}:${password}`;
        const encoded = Buffer.from(credentials).toString('base64');
        const remark = encodeURIComponent(inbound.remark || clientEmail);

        return `ss://${encoded}@${address}:${inbound.port}#${remark}`;
    }

    private getAddress(inbound: XUIInbound): string {
        // Если listen не указан или 0.0.0.0, используем hostname из переменных окружения
        if (!inbound.listen || inbound.listen === '0.0.0.0' || inbound.listen === '::') {
            return process.env.SERVER_HOSTNAME || 'localhost';
        }
        return inbound.listen;
    }
}
