import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
let checked=0;
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 if(['node_modules','dist','.git'].includes(item.name))continue;
 const file=path.join(dir,item.name);if(item.isDirectory()){walk(file);continue}
 const value=fs.readFileSync(file,'utf8');checked++;
 assert.ok(!/sb_secret_[A-Za-z0-9]{12,}/.test(value),`secret key: ${file}`);
 assert.ok(!/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(value),`private key: ${file}`);
 for(const token of value.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){try{assert.notEqual(JSON.parse(Buffer.from(token.split('.')[1],'base64url')).role,'service_role',`service JWT: ${file}`)}catch(e){if(e.code==='ERR_ASSERTION')throw e}}
 assert.ok(!/^\.env(?:\.|$)/.test(item.name)||item.name==='.env.example',`environment file included: ${file}`);
}}
walk('.');
const headers=fs.readFileSync('public/_headers','utf8');
for(const rule of ["default-src 'self'","object-src 'none'","frame-ancestors 'none'","script-src 'self'",'X-Content-Type-Options: nosniff','Strict-Transport-Security:'])assert.ok(headers.includes(rule),rule);
const app=fs.readFileSync('app.js','utf8');assert.ok(!/\.innerHTML\s*=|insertAdjacentHTML\s*\(/.test(app),'unsafe rendering sink');
assert.ok(fs.readFileSync('netlify.toml','utf8').includes('publish = "dist"'));
assert.ok(fs.readFileSync('dist/_headers','utf8')===headers,'headers copied into build');
console.log(`PASS: ${checked} source files; targeted credential patterns, rendering sinks, security headers and build packaging. This is not an exhaustive secret scan or history scan.`);
