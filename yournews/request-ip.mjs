import {isIP} from 'node:net';

// Public Render services are reached through its Cloudflare edge, which overwrites
// CF-Connecting-IP. Never trust caller-supplied proxy headers on a local server.
export function clientIP(req,onRender=process.env.RENDER==='true'){
 const candidate=req.headers['cf-connecting-ip'];
 if(onRender&&typeof candidate==='string'&&isIP(candidate))return candidate;
 return req.socket.remoteAddress||'unknown';
}
