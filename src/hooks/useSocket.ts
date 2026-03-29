import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// This variable MUST be set in Vercel Project Settings for production
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  
  if (typeof window !== 'undefined') {
    // Local LAN fallback logic
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : ':4000';
    
    // Default to port 4000 for the standalone server in local dev
    return `${protocol}//${hostname}${hostname === 'localhost' ? ':4000' : port}`;
  }
  
  return 'http://localhost:4000';
};

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const url = getSocketUrl();
        console.log('Connecting to socket server at:', url);
        
        const newSocket = io(url, {
            // Force websocket to prevent 'Mixed Content' errors in production
            transports: ["websocket"],
            secure: url.startsWith('https') || url.startsWith('wss'),
            rejectUnauthorized: false 
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