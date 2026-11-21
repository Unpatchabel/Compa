// UI contract test: Supabase HTTP is mocked, not a backend authorization test.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5179','--strictPort'],{env:{...process.env,VITE_SUPABASE_URL:'https://mock.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_mock_ui_only'},stdio:'ignore'});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:5179')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 browser=await chromium.launch({headless:true,...(process.env.COMPA_CHROMIUM_PATH?{executablePath:process.env.COMPA_CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const owner='11111111-1111-4111-8111-111111111111',target='22222222-2222-4222-8222-222222222222';
 const profile={id:owner,name:'Fixture user',area:'Test campus',primary_interest:'music',secondary_interest:'gaming',theme:'sunny',art:'talk',answers:['a','b','c'],academic_category:null};
 const candidate={...profile,id:target,name:'<img src=x onerror=alert(1)>',area:'Fixture area'};
 const requests=[];
 await page.route('https://mock.supabase.co/**',async route=>{
  const request=route.request(),url=new URL(request.url());requests.push({path:url.pathname,method:request.method(),data:request.postData()});
  let data=[];
  if(url.pathname.endsWith('/token'))data={access_token:'fixture-token',refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,user:{id:owner,email:'fixture@example.invalid',aud:'authenticated'}};
  else if(url.pathname.endsWith('/user'))data={id:owner,email:'fixture@example.invalid'};
  else if(url.pathname.endsWith('/profiles')){
   if(request.method()==='PATCH'){Object.assign(profile,request.postDataJSON());data=null}
   else data=url.searchParams.has('id')?profile:[profile,candidate];
  }
  else if(url.pathname.includes('/rpc/'))data=null;
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('http://127.0.0.1:5179');
 await page.getByLabel('Email',{exact:true}).fill('fixture@example.invalid');
 await page.getByLabel('Password',{exact:true}).fill('FixturePassword123!');
 await page.getByRole('button',{name:'Sign in to existing account'}).click();
 await page.getByText(candidate.name,{exact:true}).waitFor();
 assert.equal(await page.locator('.person-name img').count(),0,'user content must remain text');
 await page.getByRole('button',{name:'Safety options'}).click();
 assert.equal(await page.getByRole('button',{name:'End connection',exact:true}).count(),0,'pre-match safety has no end-match action');
 await page.locator('#manage-dialog').getByRole('button',{name:'Close dialog'}).click();
 await page.getByPlaceholder('What would you ask them about this interest?').fill('hello fixture');
 await page.getByRole('button',{name:'Send a hello'}).click();
 await page.getByText('Your hello is on its way.').waitFor();
 assert.ok(requests.some(r=>r.path.endsWith('/send_hello')&&JSON.parse(r.data).p_target===target));
 await page.getByRole('button',{name:'Your profile',exact:true}).click();
 await page.getByLabel('Username',{exact:true}).fill('Updated fixture');
 await page.getByRole('button',{name:'Save changes'}).click();
 await page.getByRole('heading',{name:'Hey, Updated fixture.'}).waitFor();
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');}
 await page.getByRole('button',{name:'Your profile',exact:true}).click();
 await page.getByRole('button',{name:'Sign out / switch account',exact:true}).click();
 await page.getByRole('heading',{name:'Welcome to Compa.'}).waitFor();
 assert.equal(await page.locator('#hero-title').textContent(),'Hey, you.');
 assert.deepEqual(errors,[],'no browser runtime errors');
 console.log('PASS: mocked UI sign-in, discovery text safety, pre-match safety, hello RPC payload, profile edit, mobile/desktop overflow, sign-out privacy; no page errors.');
}finally{await browser?.close();server.kill('SIGTERM')}
