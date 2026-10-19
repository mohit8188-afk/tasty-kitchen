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
 // Receive-only inbox. No automatic messages, no new customer profiles, no AI output.
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!service)return reply("storage_unavailable",503);
 const db=createClient(url,service,{auth:{persistSession:false}});
 let saved=0,duplicates=0;
 for(const entry of (Array.isArray(event.entry)?event.entry:[])){
  for(const change of (Array.isArray(entry.changes)?entry.changes:[])){
   if(change.field!=="messages")continue;
   const val=change.value||{},recipient=String(val.metadata?.phone_number_id||"");
   const allowedId=Deno.env.get("META_PHONE_NUMBER_ID");
   // The sample sender ID can be configured in Supabase without exposing any access token.
   if(!allowedId||recipient!==allowedId)continue;
   for(const m of (Array.isArray(val.messages)?val.messages:[])){
    const id=String(m.id||""),wa=String(m.from||"").replace(/\D/g,"");
    if(!id||!/^\d{10,15}$/.test(wa)||id.length>250)continue;
    const mobile=wa.slice(-10);
    const {data:customer}=await db.from("tk_contacts").select("id").eq("normalized_mobile",mobile).limit(1).maybeSingle();
    const payload={provider_message_id:id,wa_id:wa,phone_number_id:recipient,contact_id:customer?.id||null,message_type:String(m.type||"unknown").slice(0,30),text_body:m.type==="text"?String(m.text?.body||"").slice(0,3000):null,processed_state:customer?"received":"needs_review",provider_timestamp:/^\d{9,12}$/.test(String(m.timestamp||""))?new Date(Number(m.timestamp)*1000).toISOString():null};
    const {error}=await db.from("tk_whatsapp_inbox_events").insert(payload);
    if(error){if(error.code==="23505"){duplicates++;continue}console.error("whatsapp_inbox_insert_error",error.code);return reply("storage_failure",503)}
    saved++;
   }
  }
 }
 console.info("whatsapp_verified_event",JSON.stringify({entries:Array.isArray(event.entry)?event.entry.length:0,saved,duplicates}));
 return reply("EVENT_RECEIVED");
});