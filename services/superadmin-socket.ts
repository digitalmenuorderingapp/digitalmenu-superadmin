import { io, Socket } from 'socket.io-client';

const getSocketUrl = () => {
    // Hardcoded production URL as requested to avoid environment variable issues on Vercel/Render
    return 'https://digitalmenu-server.onrender.com';
};

const SOCKET_URL = getSocketUrl();

class SuperadminSocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                withCredentials: true,
                transports: ['polling', 'websocket'],
                path: '/socket.io/',
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('[SuperadminSocket] Connected, id:', this.socket?.id);
                // Join superadmin room for service status updates
                this.socket?.emit('join', 'superadmin');
            });

            this.socket.on('connect_error', (error) => {
                console.error('[SuperadminSocket] Connection error:', error.message);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('[SuperadminSocket] Disconnected:', reason);
            });
        }
        return this.socket;
    }

    join(room: string) {
        if (this.socket) {
            this.socket.emit('join', room);
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const superadminSocketService = new SuperadminSocketService();
