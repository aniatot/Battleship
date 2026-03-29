import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// For mobile LAN to work, we need to dynamically connect to the same host the app is served on
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  // Use current hostname (which will be the IP address for mobile connections)
  return `http://${window.location.hostname}:4000`;
};

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const url = getSocketUrl();
        const newSocket = io(url, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            extraHeaders: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return socket;
};