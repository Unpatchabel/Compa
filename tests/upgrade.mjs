import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create publication supabase_realtime;`);
 const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
 for(const file of files.slice(0,-1))await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 const id='11111111-1111-4111-8111-111111111111';
 await db.exec(`insert into auth.users values('${id}');insert into public.profiles(id,name,area,primary_interest,secondary_interest,answers)values('${id}','Legacy','Test area','music','gaming','[1,2,3]');`);
 await db.exec(fs.readFileSync('supabase/migrations/'+files.at(-1),'utf8'));
 assert.equal((await db.query('select count(*)::int n from profiles')).rows[0].n,1);
 await assert.rejects(db.exec('alter table public.profiles validate constraint profile_answer_strings'));
 await db.exec(`select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`);
 await assert.rejects(db.exec(`update profiles set name='Edited' where id='${id}'`));
 await db.exec(`update profiles set answers='["a","b","c"]' where id='${id}';reset role;alter table public.profiles validate constraint profile_answer_strings;`);
 console.log('PASS: legacy malformed row preserved by upgrade, invalid updates rejected, repair and constraint validation succeed.');
}finally{await db.close()}
