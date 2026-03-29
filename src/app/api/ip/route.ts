import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const nets = os.networkInterfaces();
  let localIp = '127.0.0.1';
  
  for (const name of Object.keys(nets)) {
    if (!nets[name]) continue;
    for (const net of nets[name]) {
      // Pick the first IPv4 address that is not internal
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
    if (localIp !== '127.0.0.1') break;
  }

  return NextResponse.json({ ip: localIp });
}
