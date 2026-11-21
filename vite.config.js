import {defineConfig,loadEnv} from 'vite';
export default defineConfig(({mode})=>{
 const env={...loadEnv(mode,process.cwd(),'VITE_'),...process.env};
 const key=env.VITE_SUPABASE_PUBLISHABLE_KEY||'',url=env.VITE_SUPABASE_URL;
 let role;
 if(key.split('.').length===3){try{role=JSON.parse(Buffer.from(key.split('.')[1],'base64url')).role}catch{throw Error('Invalid Supabase public JWT')}}
 if(key.startsWith('sb_secret_')||role==='service_role')throw Error('Refusing to bundle an elevated Supabase key');
 if(key&&!key.startsWith('sb_publishable_')&&role!=='anon')throw Error('Expected a publishable key or legacy anon JWT');
 if(url){const endpoint=new URL(url);if(endpoint.protocol!=='https:'&&!(endpoint.protocol==='http:'&&['127.0.0.1','localhost'].includes(endpoint.hostname)))throw Error('Supabase URL requires HTTPS')}
 if(Boolean(url)!==Boolean(key))throw Error('Provide both public Supabase configuration values');
 return {server:{host:'127.0.0.1'},preview:{host:'127.0.0.1'}};
});
