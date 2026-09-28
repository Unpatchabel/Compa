import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
const db=new PGlite();
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
const q=async sql=>(await db.query(sql)).rows;
const assert=(v,msg)=>{if(!v)throw Error(msg)};
try{
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create publication supabase_realtime;`);
 await db.exec(fs.readFileSync('supabase/migrations/20260925000000_initial.sql','utf8'));
 await db.exec(fs.readFileSync('supabase/migrations/20260928000000_academic.sql','utf8'));
 for(const [i,id] of ids.entries()){
 await q(`insert into auth.users(id) values('${id}')`);
 await q(`insert into public.profiles(id,name,area,primary_interest,secondary_interest,answers) values('${id}','Tester ${i}','Campus','music','gaming','["a","b","c"]')`);
 }
 await q(`update public.profiles set academic_category='acad_year3_cyber' where id in ('${ids[0]}','${ids[1]}')`);
 const as=async i=>{await q('reset role');await q(`select set_config('request.jwt.claim.sub','${ids[i]}',false)`);await q('set role authenticated')};
 await as(0);
 assert((await q(`select * from public.send_hello('${ids[1]}','music','hi from A')`))[0].send_hello===null,'first like should be pending');
 await as(1);
 const match=(await q(`select public.send_hello('${ids[0]}','music','hi from B') as id`))[0].id;
 assert(match,'reciprocal like should match');
 const matchCount=await q(`select count(*)::int as n from public.matches`);assert(matchCount[0].n===1,'one match');
 await q(`select public.send_message('${match}','private hello')`);
 await as(2);
 assert((await q('select * from public.messages')).length===0,'third party read messages');
 let denied=false;try{await q(`insert into public.messages(match_id,sender,body) values('${match}','${ids[2]}','forged')`)}catch{denied=true}assert(denied,'direct message insert denied');
 await q(`select public.send_hello('${ids[0]}','music','hello from C')`);
 await as(0);
 assert((await q(`select public.send_hello('${ids[2]}','music','hello to C') as id`))[0].id===null,'a second mutual like must stay queued');
 assert((await q(`select count(*)::int as n from public.match_members where user_id='${ids[0]}' and active`))[0].n===1,'one active friend per category');
 await q(`select public.end_match('${match}')`);
 const replacement=(await q(`select public.accept_mutual('${ids[2]}','music') as id`))[0].id;
 assert(replacement&&replacement!==match,'queued mutual like becomes a new match after ending the first');
 let sent=0, throttled=false;
 for(let i=0;i<25;i++){try{await q(`select public.send_message('${replacement}','message ${i}')`);sent++}catch{throttled=true;break}}
 assert(throttled&&sent<25,'message rate limit must reject rapid repeated writes');
 let oldChatDenied=false;try{await q(`select public.send_message('${match}','ended chat')`)}catch{oldChatDenied=true}assert(oldChatDenied,'ended match cannot receive new messages');
 await as(0);assert((await q(`select public.send_hello('${ids[1]}','acad_year3_cyber','study?') as id`))[0].id===null,'academic hello pending');
 await as(1);assert((await q(`select public.send_hello('${ids[0]}','acad_year3_cyber','yes') as id`))[0].id,'academic mutual match');
 await as(2);let academicDenied=false;try{await q(`select public.send_hello('${ids[0]}','acad_year3_cyber','fake course')`)}catch{academicDenied=true}assert(academicDenied,'academic sender must have matching course and year');
 await as(0);await q(`select public.block_user('${ids[1]}')`);
 assert((await q(`select id from public.profiles where id='${ids[1]}'`)).length===0,'blocked profile hidden');
 let sendDenied=false;try{await q(`select public.send_message('${match}','after block')`)}catch{sendDenied=true}assert(sendDenied,'blocked chat send denied');
 await as(1);let helloDenied=false;try{await q(`select public.send_hello('${ids[0]}','music','after block')`)}catch{helloDenied=true}assert(helloDenied,'blocked hello denied');
 console.log('Migration and authorization tests passed: matching, queued mutual like, one active friend/category, persisted private chat, rate limit, direct-write denial, ended-chat denial, block');
}catch(e){console.error(e);process.exitCode=1}finally{await db.close()}
