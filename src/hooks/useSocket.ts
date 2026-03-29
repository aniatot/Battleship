import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const getSocketUrl = () => {
  // 1. Check if an explicit Socket URL is provided via environment variables (vital for cloud deployments like Vercel)
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  
  // 2. Fallback to dynamic hostname for local LAN play (where mobile connects to PC IP)
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:4000`;
  }
  
  return 'http://localhost:4000';
};

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const url = getSocketUrl();
        console.log('Connecting to socket server at:', url);
        
        const newSocket = io(url, {
            transports: ['websocket', 'polling'], // Fallback to polling if websocket is blocked
            reconnectionAttempts: 5,
            timeout: 10000,
            extraHeaders: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });

        setSocket(newSocket);

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return socket;
};