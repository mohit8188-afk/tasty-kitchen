import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";
const ORIGINS=new Set(["https://tastykitchen.food","https://www.tastykitchen.food","https://tasty-kitchen-blond.vercel.app"]);
const PRODUCTS=new Set(["makhana-mewa-bites","coconut-mewa-ladoo","jalebi-with-rabdi"]);
const clean=(x:unknown,max=500)=>String(x??"").trim().slice(0,max);
const textnorm=(x:unknown)=>clean(x).toLowerCase().replace(/\s+/g," ");
const phone=(x:unknown)=>clean(x).replace(/\D/g,"").slice(-10);
function cors(o:string|null){return {"Access-Control-Allow-Origin":o&&ORIGINS.has(o)?o:"https://tastykitchen.food",
"Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};}
function answer(o:unknown,s=200,origin:string|null=null){return new Response(JSON.stringify(o),{status:s,headers:cors(origin)});}
function upi(ref:string,amount:number){
 const vpa="mohit8188-1@okicici",payee=clean(Deno.env.get("TK_MANUAL_UPI_PAYEE")||"Tasty Kitchen",80); // Founder-provided public receiving UPI VPA.
 const valid=/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(vpa);
 const args=new URLSearchParams({pa:vpa,pn:payee,am:amount.toFixed(2),cu:"INR",tn:"Tasty Kitchen sample "+ref});
 return {upi_uri:valid?"upi://pay?"+args.toString():null,upi_vpa:valid?vpa:null,payee_name:payee,payee_phone:"9834621628"};
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin");
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=="POST")return answer({error:"method_not_allowed"},405,origin);
 if(origin&&!ORIGINS.has(origin))return answer({error:"origin_not_allowed"},403,origin);
 let b:Record<string,any>;try{b=await req.json()}catch{return answer({error:"invalid_json"},400,origin);}
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return answer({error:"server_configuration"},503,origin);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

 if(b.action==="claim"||b.action==="complete_address"){
   const ref=clean(b.sample_ref,80),checkout=clean(b.client_checkout_id,120);
   if(!/^TKS-\d{8}-\d{5,}$/.test(ref)||!/^[A-Za-z0-9-]{8,120}$/.test(checkout))return answer({error:"invalid_sample"},400,origin);
   const {data:s,error:e}=await db.from("tk_sample_requests").select("id,contact_id,sample_ref,payment_status,payment_provider,payment_environment,address_status,payment_submitted_at")
     .eq("sample_ref",ref).eq("client_checkout_id",checkout).eq("payment_provider","manual_upi").eq("payment_environment","live").maybeSingle();
   if(e||!s)return answer({error:"sample_not_found"},404,origin);
   if(b.action==="claim"){
     if(s.payment_status==="paid")return answer({ok:true,status:"verified_paid",sample_ref:ref},200,origin);
     if(s.payment_status!=="pending")return answer({error:"payment_not_pending"},409,origin);
     if(!s.payment_submitted_at){
       const {error:up}=await db.from("tk_sample_requests").update({payment_submitted_at:new Date().toISOString(),payment_method:"upi"})
          .eq("id",s.id).eq("payment_status","pending");
       if(up)return answer({error:"claim_failed"},500,origin);
     }
     return answer({ok:true,status:"awaiting_bank_verification",sample_ref:ref},200,origin);
   }
   const city=clean(b.city,100),address=clean(b.address,600);
   if(city.length<3||address.length<8)return answer({error:"invalid_address",message:"Enter your full delivery address and city."},400,origin);
   const cityKey=textnorm(city),addrKey=textnorm(address);
   const {data:dups,error:dupeErr}=await db.from("tk_sample_requests").select("id")
     .eq("normalized_city",cityKey).eq("normalized_address",addrKey)
     .eq("payment_status","paid").eq("payment_environment","live").neq("id",s.id).limit(1);
   if(dupeErr)return answer({error:"address_check_failed"},503,origin);
   if(dups?.length)return answer({error:"duplicate_address",message:"A tasting request already exists for this address. Contact Tasty Kitchen."},409,origin);
   const {error:up}=await db.from("tk_sample_requests").update({city,normalized_city:cityKey,address,normalized_address:addrKey,address_status:"complete",address_completed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",s.id);
   if(up)return answer({error:"address_save_failed"},500,origin);
   return answer({ok:true,address_status:"complete",sample_ref:ref},200,origin);
 }
 if(b.action!=="create")return answer({error:"invalid_action"},400,origin);
 // A verified UPI VPA enables deep links; otherwise show the founder-approved receiving UPI number with exact amount.
 const name=clean(b.name,100),mobile=phone(b.mobile),locality=clean(b.locality,150),product=clean(b.product_id,80);
 const date=clean(b.preferred_date,20),checkout=clean(b.client_checkout_id,120);
 if(name.length<2||!/^[6-9]\d{9}$/.test(mobile)||locality.length<3||!PRODUCTS.has(product)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^[A-Za-z0-9-]{8,120}$/.test(checkout))
   return answer({error:"invalid_details",message:"Please check name, mobile, product, locality and sample date."},400,origin);
 const {data:existing,error:existingErr}=await db.from("tk_sample_requests").select("id,sample_ref,payment_status,client_checkout_id,payment_provider")
   .eq("client_checkout_id",checkout).maybeSingle();
 if(existingErr)return answer({error:"sample_lookup_failed"},500,origin);
 if(existing){
   if(existing.payment_provider!=="manual_upi")return answer({error:"checkout_conflict"},409,origin);
   const {data:a}=await db.from("tk_upi_reservations").select("amount_paise").eq("client_checkout_id",checkout).maybeSingle();
   if(!a)return answer({error:"payment_reservation_missing"},503,origin);
   const amount=Number(a.amount_paise)/100;
   return answer({ok:true,sample_ref:existing.sample_ref,payment_status:existing.payment_status,amount_paise:a.amount_paise,sample_base_price:50,upi_amount:amount,...upi(existing.sample_ref,amount)},200,origin);
 }
 const {data:policy,error:policyErr}=await db.from("tk_sample_policy")
 .select("mobile_cooldown_days,daily_capacity,booking_window_days").eq("id",true).single();
 if(policyErr||!policy)return answer({error:"sample_policy_unavailable"},503,origin);
 await db.rpc("tk_ensure_sample_capacity_days");
 const today=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"});
 const max=new Date(Date.now()+Number(policy.booking_window_days)*86400000).toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"});
 if(date<=today||date>max)return answer({error:"invalid_date",message:"Choose an available future tasting date."},422,origin);
 const {data:cap,error:capErr}=await db.from("tk_daily_sample_capacity").select("total_capacity,is_open").eq("sample_date",date).maybeSingle();
 if(capErr)return answer({error:"capacity_unavailable"},503,origin);
 if(cap&&!cap.is_open)return answer({error:"date_closed",message:"This tasting date is closed."},409,origin);
 const {count:occupied,error:occErr}=await db.from("tk_sample_requests")
   .select("id",{count:"exact",head:true}).eq("preferred_date",date)
   .eq("payment_status","paid").eq("payment_environment","live").in("status",["requested","confirmed","scheduled"]);
 if(occErr)return answer({error:"capacity_unavailable"},503,origin);
 if((occupied||0)>=Number(cap?.total_capacity||policy.daily_capacity||100))return answer({error:"date_full",message:"All tasting slots are currently reserved for this date."},409,origin);
 let {data:contact,error:contactErr}=await db.from("tk_contacts").select("id").eq("normalized_mobile",mobile).maybeSingle();
 if(contactErr)return answer({error:"customer_lookup_failed"},503,origin);
 let contactId=contact?.id;
 if(contactId){
   const {data:dups,error:dupeErr}=await db.from("tk_sample_requests").select("id,status,payment_status,sample_ref,created_at")
     .eq("contact_id",contactId).eq("payment_status","paid").eq("payment_environment","live")
     .order("created_at",{ascending:false}).limit(20);
   if(dupeErr)return answer({error:"sample_check_failed"},503,origin);
   const active=(dups||[]).find(x=>x.status!=="cancelled"&&x.status!=="rejected");
   if(active)return answer({error:"sample_already_paid",message:"A paid tasting has already been booked for this mobile number."},409,origin);
   const now=new Date().toISOString();
   const {error:e}=await db.from("tk_contacts").update({name,mobile,locality,last_seen_at:now,last_contact_at:now,source:"website"}).eq("id",contactId);
   if(e)return answer({error:"contact_update_failed"},500,origin);
 }else{
   const {data:c,error:e}=await db.from("tk_contacts").insert({name,mobile,normalized_mobile:mobile,locality,lifecycle_stage:"lead",source:"website"}).select("id").single();
   if(e||!c)return answer({error:"contact_create_failed"},500,origin);
   contactId=c.id;
 }
 const {data:allocation,error:allocErr}=await db.rpc("tk_allocate_upi_amount",{p_kind:"sample",p_checkout_id:checkout,p_base_paise:5000});
 const reserved=allocation?.[0];
 if(allocErr||!reserved)return answer({error:"amount_exhausted",message:"Unique UPI sample payment amounts are unavailable. Please contact Tasty Kitchen."},503,origin);
 const amount=Number(reserved.amount_paise)/100;
 const {data:s,error:sampleErr}=await db.from("tk_sample_requests").insert({
  contact_id:contactId,product_id:product,preferred_date:date,locality,normalized_locality:textnorm(locality),
  status:"payment_pending",address_status:"pending",sample_price:50,manual_upi_amount:amount,
  payment_status:"pending",payment_provider:"manual_upi",payment_environment:"live",payment_method:"upi",
  client_checkout_id:checkout,request_key:mobile+"|"+textnorm(locality),source:"website",
  utm_source:clean(b.utm_source,150)||null,utm_medium:clean(b.utm_medium,150)||null,
  utm_campaign:clean(b.utm_campaign,150)||null,utm_content:clean(b.utm_content,150)||null
 }).select("id,sample_ref").single();
 if(sampleErr||!s)return answer({error:"sample_create_failed",message:"Could not save tasting request. Please retry or contact Tasty Kitchen."},500,origin);
 const {error:linkErr}=await db.from("tk_upi_reservations").update({reference_id:s.id,reference_code:s.sample_ref}).eq("id",reserved.reservation_id);
 if(linkErr)return answer({error:"reservation_link_failed",message:"Your sample request needs team assistance. Do not pay yet."},503,origin);
 await db.from("tk_interactions").insert({contact_id:contactId,channel:"website",direction:"inbound",
 event_type:"manual_upi_sample_created",summary:"Customer started ₹50 sample checkout, awaiting bank verification.",
 metadata:{sample_ref:s.sample_ref,base:50,upi_amount:amount}});
 return answer({ok:true,sample_ref:s.sample_ref,sample_base_price:50,amount_paise:reserved.amount_paise,upi_amount:amount,adjustment_amount:Number((amount-50).toFixed(2)),
 payment_status:"pending",...upi(s.sample_ref,amount)},201,origin);
});
