import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const reply=(body,status=200)=>new Response(body,{status,headers:{"content-type":"text/plain","cache-control":"no-store"}});
const equal=(a,b)=>{if(a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0};
async function hmac(secret,body){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const b=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(body));return "sha256="+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
Deno.serve(async req=>{
 const verify=Deno.env.get("META_WEBHOOK_VERIFY_TOKEN"),secret=Deno.env.get("META_APP_SECRET");
 if(req.method==="GET"){const u=new URL(req.url);if(u.searchParams.get("hub.mode")==="subscribe"&&verify&&equal(u.searchParams.get("hub.verify_token")||"",verify))return reply(u.searchParams.get("hub.challenge")||"");return reply("verification_failed",403)}
 if(req.method!=="POST")return reply("method_not_allowed",405);
 if(!secret)return reply("not_configured",503);
 const raw=await req.text(),signature=req.headers.get("x-hub-signature-256")||"";
 if(!equal(await hmac(secret,raw),signature))return reply("invalid_signature",403);
 let event;try{event=JSON.parse(raw)}catch{return reply("invalid_json",400)}
 if(event.object!=="whatsapp_business_account")return reply("ignored");
 // Receive-only safety gate: no messages are sent, no customer data inferred from unverified payload.
 // Activate persistence and AI response after approved WABA/phone IDs and dedupe controls are configured.
 console.info("whatsapp_verified_event",JSON.stringify({entries:Array.isArray(event.entry)?event.entry.length:0}));
 return reply("EVENT_RECEIVED");
});