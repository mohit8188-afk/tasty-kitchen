import { createClient } from "jsr:@supabase/supabase-js@2";
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{"content-type":"application/json","cache-control":"no-store","vary":"Origin"}});
const allowedOrigin="https://tastykitchen.food";
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(origin && origin!==allowedOrigin)return json({error:"forbidden_origin"},403);
 const headers={"access-control-allow-origin":allowedOrigin,"access-control-allow-headers":"authorization,content-type,apikey","access-control-allow-methods":"GET,POST,OPTIONS","cache-control":"no-store"};
 const respond=(data:unknown,status=200)=>{const r=json(data,status);for(const [k,v] of Object.entries(headers))r.headers.set(k,v);return r;};
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 if(!token)return respond({error:"unauthorized"},401);
 const url=Deno.env.get("SUPABASE_URL"),serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!serviceKey)return respond({error:"server_not_configured"},503);
 const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await db.auth.getUser(token);
 const ids=(Deno.env.get("TK_CRM_ADMIN_USER_IDS")||"").split(",").map(x=>x.trim()).filter(Boolean);
 if(authError||!user||!ids.includes(user.id))return respond({error:"forbidden"},403);
 const u=new URL(req.url),action=u.searchParams.get("action")||"dashboard";
 const contactId=u.searchParams.get("contact_id");
 if(req.method==="GET"){
  if(action==="dashboard"){
   const names=["tk_contacts","tk_sample_requests","tk_orders","tk_gifting_inquiries","tk_crm_tasks"];
   const results=await Promise.all(names.map(x=>db.from(x).select("id",{count:"exact",head:true})));
   if(results.some(x=>x.error))return respond({error:"query_failed"},500);
   return respond({counts:Object.fromEntries(names.map((n,i)=>[n,results[i].count]))});
  }
  if(action==="contacts"){
   const search=(u.searchParams.get("q")||"").trim().slice(0,80).replace(/[%_,()]/g,"");
   let query=db.from("tk_contacts").select("id,name,mobile,city,locality,lifecycle_stage,tags,source,last_seen_at,whatsapp_opt_in,marketing_opt_in,do_not_contact").order("last_seen_at",{ascending:false}).limit(50);
   if(search)query=query.or("name.ilike.%"+search+"%,mobile.ilike.%"+search+"%");
   const {data,error}=await query;return error?respond({error:"query_failed"},500):respond({contacts:data});
  }
  if(action==="contact"&&contactId){
   const [c,s,o,g,i,n,t,r,m]=await Promise.all([
    db.from("tk_contacts").select("*").eq("id",contactId).maybeSingle(),
    db.from("tk_sample_requests").select("id,product_id,status,payment_status,preferred_date,created_at,paid_at,delivered_at").eq("contact_id",contactId).limit(100),
    db.from("tk_orders").select("id,order_ref,order_status,payment_status,total_amount,created_at,paid_at").eq("contact_id",contactId).limit(100),
    db.from("tk_gifting_inquiries").select("id,status,business_name,created_at").eq("contact_id",contactId).limit(100),
    db.from("tk_interactions").select("id,channel,direction,event_type,summary,created_at").eq("contact_id",contactId).order("created_at",{ascending:false}).limit(100),
    db.from("tk_crm_notes").select("id,body,created_by,created_at").eq("contact_id",contactId).order("created_at",{ascending:false}).limit(100),
    db.from("tk_crm_tasks").select("*").eq("contact_id",contactId).order("created_at",{ascending:false}).limit(100),
    db.from("tk_reviews").select("id,rating,review_text,submitted_at").eq("contact_id",contactId).limit(100),
    db.from("tk_ai_customer_memory").select("memory_key,memory_value,source,last_verified_at").eq("contact_id",contactId).eq("is_active",true).limit(50)
   ]);
   if([c,s,o,g,i,n,t,r,m].some(x=>x.error))return respond({error:"query_failed"},500);
   if(!c.data)return respond({error:"not_found"},404);
   return respond({contact:c.data,samples:s.data,orders:o.data,gifting:g.data,interactions:i.data,notes:n.data,tasks:t.data,reviews:r.data,approved_context:m.data});
  }
  if(["tasting","orders","gifting","tasks"].includes(action)){
   const map:{[key:string]:[string,string]}={tasting:["tk_sample_requests","created_at"],orders:["tk_orders","created_at"],gifting:["tk_gifting_inquiries","created_at"],tasks:["tk_crm_tasks","created_at"]};
   const [table,order]=map[action];const {data,error}=await db.from(table).select("*").order(order,{ascending:false}).limit(100);
   return error?respond({error:"query_failed"},500):respond({rows:data});
  }
 }
 if(req.method==="POST"&&["note","task"].includes(action)){
  let b:any;try{b=await req.json()}catch{return respond({error:"invalid_json"},400)}
  if(typeof b.contact_id!=="string"||! /^[0-9a-f-]{36}$/i.test(b.contact_id))return respond({error:"invalid_contact"},400);
  const {data:contact}=await db.from("tk_contacts").select("id").eq("id",b.contact_id).maybeSingle();
  if(!contact)return respond({error:"contact_not_found"},404);
  if(action==="note"){
   if(typeof b.body!=="string"||!b.body.trim()||b.body.length>4000)return respond({error:"invalid_note"},400);
   const {data,error}=await db.from("tk_crm_notes").insert({contact_id:contact.id,body:b.body.trim(),created_by:user.id}).select("id,created_at").single();
   return error?respond({error:"write_failed"},500):respond({note:data},201);
  }
  if(typeof b.title!=="string"||!b.title.trim()||b.title.length>180)return respond({error:"invalid_task"},400);
  if(b.due_at && Number.isNaN(Date.parse(b.due_at)))return respond({error:"invalid_due_at"},400);
  const {data,error}=await db.from("tk_crm_tasks").insert({contact_id:contact.id,title:b.title.trim(),due_at:b.due_at||null,category:"follow_up",created_by:user.id}).select("id,created_at").single();
  return error?respond({error:"write_failed"},500):respond({task:data},201);
 }
 return respond({error:"unknown_operation"},404);
});
