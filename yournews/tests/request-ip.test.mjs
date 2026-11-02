import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clientIP} from '../request-ip.mjs';
const request=headers=>({headers,socket:{remoteAddress:'127.0.0.1'}});
test('Render clients do not share the proxy rate bucket',()=>{
 assert.equal(clientIP(request({'cf-connecting-ip':'203.0.113.10'}),true),'203.0.113.10');
 assert.equal(clientIP(request({'cf-connecting-ip':'203.0.113.11'}),true),'203.0.113.11');
});
test('local deployments ignore spoofed Cloudflare headers',()=>{
 assert.equal(clientIP(request({'cf-connecting-ip':'203.0.113.10'}),false),'127.0.0.1');
});
test('malformed proxy headers and X-Forwarded-For are not trusted',()=>{
 assert.equal(clientIP(request({'cf-connecting-ip':'bad','x-forwarded-for':'203.0.113.10'}),true),'127.0.0.1');
});
