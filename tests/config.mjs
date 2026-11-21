import assert from 'node:assert/strict';
import configure from '../vite.config.js';
const original={url:process.env.VITE_SUPABASE_URL,key:process.env.VITE_SUPABASE_PUBLISHABLE_KEY};
const run=()=>configure({mode:'test'});
try{
 delete process.env.VITE_SUPABASE_URL;delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 assert.doesNotThrow(run);
 process.env.VITE_SUPABASE_URL='https://mock.supabase.co';
 assert.throws(run,/both public/);
 process.env.VITE_SUPABASE_PUBLISHABLE_KEY='sb_'+'secret_'+'fixture_only';
 assert.throws(run,/elevated/);
 const token=role=>'eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.fixture';
 process.env.VITE_SUPABASE_PUBLISHABLE_KEY=token('service_role');assert.throws(run,/elevated/);
 process.env.VITE_SUPABASE_PUBLISHABLE_KEY=token('anon');assert.doesNotThrow(run);
 process.env.VITE_SUPABASE_PUBLISHABLE_KEY='sb_publishable_fixture';assert.doesNotThrow(run);
 process.env.VITE_SUPABASE_URL='http://remote.example.invalid';assert.throws(run,/HTTPS/);
 process.env.VITE_SUPABASE_URL='http://127.0.0.1:54321';assert.doesNotThrow(run);
 console.log('PASS: build configuration rejects elevated/partial/insecure remote configuration; accepts public/local or setup-only configuration.');
}finally{
 for(const [name,value] of [['VITE_SUPABASE_URL',original.url],['VITE_SUPABASE_PUBLISHABLE_KEY',original.key]])if(value===undefined)delete process.env[name];else process.env[name]=value;
}
