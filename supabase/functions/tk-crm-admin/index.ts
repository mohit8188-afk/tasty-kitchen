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
 const designatedAdminId="ac7772dd-2607-4bd3-985d-9668b668bce3";
 if(authError||!user||user.id!==designatedAdminId||user.email?.toLowerCase()!=="mohit8188@gmail.com"||!user.email_confirmed_at)return respond({error:"forbidden"},403);
 const u=new URL(req.url),action=u.searchParams.get("action")||"dashboard";
 const contactId=u.searchParams.get("contact_id");
 if(req.method==="GET"){
  if(action==="upi_pending"){
    const [orders,samples]=await Promise.all([
      db.from("tk_orders").select("id,order_ref,customer_name,customer_mobile,total_amount,manual_upi_amount,payment_submitted_at,created_at,payment_status")
        .eq("payment_provider","manual_upi").eq("payment_environment","live").eq("payment_status","pending").order("created_at",{ascending:false}).limit(150),
      db.from("tk_sample_requests").select("id,sample_ref,contact_id,sample_price,manual_upi_amount,payment_submitted_at,created_at,payment_status,product_id,locality")
        .eq("payment_provider","manual_upi").eq("payment_environment","live").eq("payment_status","pending").order("created_at",{ascending:false}).limit(150)
    ]);
    if(orders.error||samples.error)return respond({error:"payment_queue_unavailable"},503);
    const ids=[...new Set((samples.data||[]).map(x=>x.contact_id).filter(Boolean))];
    const contacts=ids.length?await db.from("tk_contacts").select("id,name,mobile").in("id",ids):{data:[],error:null};
    if(contacts.error)return respond({error:"customer_lookup_unavailable"},503);
    const contactMap=new Map((contacts.data||[]).map(x=>[x.id,x]));
    const rows=[
      ...(orders.data||[]).map(o=>({kind:"order",id:o.id,ref:o.order_ref,base_amount:Number(o.total_amount),payable_amount:Number(o.manual_upi_amount),customer:o.customer_name,mobile:o.customer_mobile,
       reported_at:o.payment_submitted_at,created_at:o.created_at,detail:"Product order"})),
      ...(samples.data||[]).map(s=>({kind:"sample",id:s.id,ref:s.sample_ref,base_amount:Number(s.sample_price),payable_amount:Number(s.manual_upi_amount),customer:contactMap.get(s.contact_id)?.name||null,mobile:contactMap.get(s.contact_id)?.mobile||null,
       reported_at:s.payment_submitted_at,created_at:s.created_at,detail:(s.product_id||"Sample")+" · "+(s.locality||"")}))
    ].sort((a,b)=>(Boolean(b.reported_at)?1:0)-(Boolean(a.reported_at)?1:0)||String(b.created_at).localeCompare(String(a.created_at)));
    return respond({rows,reported_count:rows.filter(x=>x.reported_at).length,pending_count:rows.length,note:"Check a real bank credit at the exact amount and verify recipient/sender/date; a customer claim or exact amount alone is not proof."});
  }
  if(action==="dashboard"){
   const [contacts,samples,gifting,tasks,orders]=await Promise.all([
    db.from("tk_contacts").select("id",{count:"exact",head:true}),
    db.from("tk_sample_requests").select("id,payment_environment,payment_status,status").limit(2000),
    db.from("tk_gifting_inquiries").select("id",{count:"exact",head:true}),
    db.from("tk_crm_tasks").select("id,status,due_at").neq("status","completed").neq("status","cancelled").limit(2000),
    db.from("tk_orders").select("id,payment_environment,payment_status,order_status,total_amount,paid_at").limit(2000)
   ]);
   if([contacts,samples,gifting,tasks,orders].some(x=>x.error))return respond({error:"query_failed"},500);
   const real=(orders.data||[]).filter(x=>x.payment_environment==="live");
   const test=(orders.data||[]).filter(x=>x.payment_environment!=="live");
   const paid=real.filter(x=>x.payment_status==="paid");
   const pendingDelivery=paid.filter(x=>!["delivered","cancelled"].includes(x.order_status));
   const revenue=paid.filter(x=>x.order_status!=="cancelled").reduce((s,x)=>s+Number(x.total_amount||0),0);
   const istDay=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
   const istDate=(d:string)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(d));
   const todayPaid=paid.filter(x=>x.paid_at&&istDate(x.paid_at)===istDay);
   const todaySales=todayPaid.reduce((sum,x)=>sum+Number(x.total_amount||0),0);
   const overdue=(tasks.data||[]).filter(x=>x.due_at&&new Date(x.due_at)<new Date()).length;
   return respond({counts:{today_sales_inr:todaySales,today_paid_orders:todayPaid.length,sales_date_ist:istDay,contacts:contacts.count||0,live_orders:real.length,live_paid_orders:pendingDelivery.length,live_pending_delivery:pendingDelivery.length,live_paid_revenue_inr:revenue,tasting_requests:(samples.data||[]).filter(x=>x.payment_environment==="live"&&x.payment_status==="paid"&&!["delivered","converted","lost","cancelled","rejected"].includes(x.status)).length,live_paid_tastings:(samples.data||[]).filter(x=>x.payment_environment==="live"&&x.payment_status==="paid").length,gifting_inquiries:gifting.count||0,open_tasks:(tasks.data||[]).length,overdue_tasks:overdue,test_orders:test.length},notice:"Today’s sales = live paid order collections recorded today (Asia/Kolkata). Excludes test, pending and failed payments; refunds and reconciliation may adjust this figure."});
  }
  if(action==="operations"){
   const [orders,gifting,tasks]=await Promise.all([
    db.from("tk_orders").select("id,order_ref,customer_name,customer_mobile,delivery_date,delivery_scope,delivery_address,delivery_pincode,total_amount,payment_status,order_status,paid_at").eq("payment_environment","live").eq("payment_status","paid").order("delivery_date",{ascending:true}).limit(500),
    db.from("tk_gifting_inquiries").select("id,status,created_at").order("created_at",{ascending:false}).limit(500),
    db.from("tk_crm_tasks").select("id,status,due_at").limit(500)
   ]);
   if(orders.error||gifting.error||tasks.error)return respond({error:"operations_unavailable"},503);
   const rows=(orders.data||[]).filter((o:any)=>!["cancelled","delivered"].includes(o.order_status));
   const ids=rows.map((o:any)=>o.id);let items:any[]=[];
   if(ids.length){const res=await db.from("tk_order_items").select("order_id,product_name,pack_grams,quantity").in("order_id",ids);if(res.error)return respond({error:"production_items_unavailable"},503);items=res.data||[]}
   const fmt=(date:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
   const today=fmt(new Date());const tm=new Date();tm.setDate(tm.getDate()+1);const tomorrow=fmt(tm);
   const schedule=rows.map((o:any)=>({...o,items:items.filter((x:any)=>x.order_id===o.id)}));
   const tomorrowOrders=schedule.filter((o:any)=>o.delivery_date===tomorrow);
   const totals=new Map<string,number>();for(const o of tomorrowOrders)for(const x of o.items){const key=x.product_name+" • "+x.pack_grams+"g";totals.set(key,(totals.get(key)||0)+Number(x.quantity||0))}
   const overdue=(tasks.data||[]).filter((t:any)=>!["completed","cancelled"].includes(t.status)&&t.due_at&&new Date(t.due_at)<new Date()).length;
   return respond({today,tomorrow,upcoming:schedule,preparing:schedule.filter((o:any)=>o.order_status==="confirmed").length,awaiting_dispatch:schedule.filter((o:any)=>["preparing","packed","out_for_delivery"].includes(o.order_status)).length,tomorrow_orders:tomorrowOrders.length,tomorrow_items:[...totals].map(([product,quantity])=>({product,quantity})),open_gifting:(gifting.data||[]).filter((x:any)=>!["closed","completed","cancelled","lost"].includes(x.status)).length,overdue_tasks:overdue});
  }
  if(action==="analytics"){
   const days=Math.min(90,Math.max(1,Number(u.searchParams.get("days")||7)||7));
   const from=new Date(Date.now()-days*86400000).toISOString();
   const [events,orders]=await Promise.all([
    db.from("tk_analytics_events").select("event_name,session_id,product_id,page_path,utm_source,referrer,created_at").gte("created_at",from).order("created_at",{ascending:false}).limit(10000),
    db.from("tk_orders").select("id,total_amount,payment_status,payment_environment,paid_at").eq("payment_environment","live").eq("payment_status","paid").gte("paid_at",from).limit(2000)
   ]);
   if(events.error||orders.error)return respond({error:"analytics_unavailable"},503);
   const list=events.data||[];const grouped=(key:string)=>{const counts=new Map<string,number>();for(const e of list){const name=String((e as any)[key]||"Unknown");counts.set(name,(counts.get(name)||0)+1)}return [...counts].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([name,count])=>({name,count}))};
   const eventCounts=new Map<string,number>();for(const e of list)eventCounts.set(e.event_name,(eventCounts.get(e.event_name)||0)+1);
   const paid=orders.data||[];
   return respond({days,capped:list.length>=10000,events:list.length,sessions:new Set(list.map((e:any)=>e.session_id).filter(Boolean)).size,page_views:eventCounts.get("page_view")||0,product_opens:eventCounts.get("product_open")||0,checkout_starts:eventCounts.get("checkout_start")||0,payment_events:eventCounts.get("payment_complete")||0,verified_paid_orders:paid.length,verified_revenue:paid.reduce((sum:number,o:any)=>sum+Number(o.total_amount||0),0),event_counts:[...eventCounts].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count),product_counts:grouped("product_id").filter((x:any)=>x.name!=="Unknown"),sources:grouped("utm_source"),pages:grouped("page_path")});
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
   const [table,order]=map[action];let query=db.from(table).select("*").order(order,{ascending:false}).limit(100);
   if(action==="orders")query=query.eq("payment_environment","live").eq("payment_status","paid");
   if(action==="tasting")query=query.eq("payment_environment","live");
   const {data,error}=await query;
   if(error)return respond({error:"query_failed"},500);
   if(action==="orders"){
     const orders=data||[];
     const ids=orders.map((o:any)=>o.id);
     let lines:any[]=[];
     if(ids.length){
       const result=await db.from("tk_order_items").select("order_id,product_name,pack_grams,quantity,line_total").in("order_id",ids);
       if(result.error)return respond({error:"order_items_unavailable"},503);
       lines=result.data||[];
     }
     return respond({rows:orders.map((o:any)=>({...o,items:lines.filter((x:any)=>x.order_id===o.id)})),mode:"live_only"});
   }
   return respond({rows:data,mode:action==="tasting"?"live_only":null});
  }
 }
 if(req.method==="POST"&&action==="upi_review"){
  let b:any;try{b=await req.json()}catch{return respond({error:"invalid_json"},400)}
  if(!["sample","order"].includes(b.kind)||typeof b.id!=="string"||!/^[0-9a-f-]{36}$/i.test(b.id)||
      !["verified_paid","rejected"].includes(b.decision)||!Number.isSafeInteger(b.amount_paise)||
      typeof b.bank_evidence!=="string"||b.bank_evidence.trim().length<8||b.bank_evidence.length>500)
    return respond({error:"invalid_bank_review"},400);
  const {data,error}=await db.rpc("tk_review_upi_payment",{
   p_kind:b.kind,p_reference_id:b.id,p_amount_paise:b.amount_paise,
   p_decision:b.decision,p_bank_evidence:b.bank_evidence.trim(),p_admin_id:user.id
  });
  if(error){console.error("upi_review_rejected",error.code);return respond({error:"bank_review_rejected",message:"Could not reconcile this payment. Recheck amount, record status and bank evidence."},409)}
  return respond({ok:true,reference:data,decision:b.decision});
 }
 // Founder-only customer support draft. Never callable by a public shopper or unauthenticated bot.
 if(req.method==="POST"&&["support_draft","support_handoff"].includes(action)){
  let b:any;try{b=await req.json()}catch{return respond({error:"invalid_json"},400)}
  if(typeof b.contact_id!=="string"||!/^[0-9a-f-]{36}$/i.test(b.contact_id))return respond({error:"invalid_contact"},400);
  const question=typeof b.question==="string"?b.question.trim().slice(0,1000):"";
  const {data:customer,error:customerError}=await db.from("tk_contacts").select("id,name,preferred_language,do_not_contact").eq("id",b.contact_id).maybeSingle();
  if(customerError||!customer)return respond({error:"contact_not_found"},404);
  if(action==="support_handoff"){
   if(!question)return respond({error:"reason_required"},400);
   const {data,error}=await db.from("tk_crm_tasks").insert({contact_id:customer.id,title:"Customer support: "+question.slice(0,150),category:"follow_up",status:"open",created_by:user.id,assigned_agent:"human_support"}).select("id,status,created_at").single();
   return error?respond({error:"handoff_failed"},500):respond({handoff:data},201);
  }
  if(!question)return respond({error:"question_required"},400);
  const lang=/[\u0900-\u097f]/.test(question)?"hi":customer.preferred_language||"en";
  const [orders,samples,gifting]=await Promise.all([
   db.from("tk_orders").select("order_ref,order_status,payment_status,delivery_date,paid_at").eq("contact_id",customer.id).eq("payment_environment","live").order("created_at",{ascending:false}).limit(8),
   db.from("tk_sample_requests").select("sample_ref,status,payment_status,preferred_date").eq("contact_id",customer.id).eq("payment_environment","live").order("created_at",{ascending:false}).limit(5),
   db.from("tk_gifting_inquiries").select("gifting_ref,status").eq("contact_id",customer.id).order("created_at",{ascending:false}).limit(5)
  ]);
  if([orders,samples,gifting].some(x=>x.error))return respond({error:"context_unavailable"},503);
  const q=question.toLowerCase(),needsOrder=/order|parcel|tracking|delivery status|mera order|ऑर्डर|डिलिवरी|डिलीवरी/.test(q);
  const needsPayment=/payment|paid|refund|पैसे|पेमेंट/.test(q);
  const needsSample=/sample|tasting|taste|सैंपल|टेस्टिंग/.test(q);
  const needsGift=/gift|gifting|corporate|गिफ्ट/.test(q);
  let reply="",handoff=false,topic="faq";
  if(needsOrder||needsPayment){
   topic="order";const match=question.match(/(?:TK[-A-Z0-9]{5,})/i)?.[0];
   const order=match?(orders.data||[]).find(x=>x.order_ref?.toLowerCase()===match.toLowerCase()):((orders.data||[]).length===1?orders.data![0]:null);
   if(order){
    const knownDate=order.delivery_date?(" Scheduled delivery date on record: "+order.delivery_date+"."):" No confirmed delivery date is recorded.";
    reply="Order "+order.order_ref+" currently shows "+order.order_status.replaceAll("_"," ")+". Payment status: "+order.payment_status+"."+knownDate;
    if(order.payment_status!=="paid")handoff=true;
   }else{reply="I cannot confidently identify the order from this customer record. Please verify the order reference; our team can check it.";handoff=true}
  } else if(needsSample){
   topic="tasting";const sample=(samples.data||[])[0];
   reply=sample?"Tasting request "+(sample.sample_ref||"")+" status: "+sample.status+". Payment: "+sample.payment_status+".":"Tasty Kitchen offers a ₹50 prepaid tasting option in Ahmedabad and nearby serviceable areas, subject to availability. I cannot see an active paid tasting on this customer record.";
  } else if(needsGift){topic="gifting";reply="We offer Diwali gifting enquiries for sweets. Share the required quantity and destination so our team can discuss availability."}
  else if(/price|rate|cost|₹|कीमत|ભાવ/.test(q)){topic="pricing";reply="Current 250 g / 500 g prices: Makhana Mewa Bites ₹400 / ₹800, Coconut Mewa Ladoo ₹175 / ₹350, Jalebi with Rabdi ₹200 / ₹400. Please confirm availability before promising fulfilment."}
  else if(/deliver|shipping|all india|india|कहाँ|ડિલિવરી/.test(q)){topic="delivery";reply="Packaged sweets may be delivered across India, subject to serviceability. Jalebi with Rabdi is limited to Ahmedabad. Please confirm your pincode for exact availability."}
  else {topic="unknown";reply="Thank you for contacting Tasty Kitchen. I will ask our team to review your question so you receive an accurate answer.";handoff=true}
  if(lang==="hi"&&topic==="unknown")reply="Tasty Kitchen से संपर्क करने के लिए धन्यवाद। हमारी टीम आपके सवाल की जाँच करके जवाब देगी।";
  return respond({draft:reply,topic,language:lang,human_handoff_recommended:handoff,customer_context:{order_count:(orders.data||[]).length,tasting_count:(samples.data||[]).length,gifting_count:(gifting.data||[]).length},customer_verified_by:"founder_admin_selection",delivery:"draft_only_not_sent",note:"Verify customer identity before any externally sent personalised order response."});
 }
 if(req.method==="POST"&&action==="reconcile_order"){
  let body:any;try{body=await req.json()}catch{return respond({error:"invalid_json"},400)}
  if(typeof body.order_id!=="string"||!/^[0-9a-f-]{36}$/i.test(body.order_id))return respond({error:"invalid_order"},400);
  const {data:order,error:orderError}=await db.from("tk_orders").select("id,order_ref,razorpay_order_id,total_amount,payment_environment,payment_status,order_status").eq("id",body.order_id).maybeSingle();
  if(orderError||!order)return respond({error:"order_not_found"},404);
  if(order.payment_environment!=="live"||!order.razorpay_order_id)return respond({error:"not_live_razorpay"},409);
  if(order.payment_status==="paid")return respond({status:"paid",order_ref:order.order_ref,updated:false});
  const key=Deno.env.get("RAZORPAY_KEY_ID"),secret=Deno.env.get("RAZORPAY_KEY_SECRET");
  if(!key?.startsWith("rzp_live_")||!secret)return respond({error:"live_gateway_unavailable"},503);
  const auth="Basic "+btoa(key+":"+secret);
  const payRes=await fetch("https://api.razorpay.com/v1/orders/"+encodeURIComponent(order.razorpay_order_id)+"/payments",{headers:{Authorization:auth}});
  if(!payRes.ok)return respond({error:"gateway_recheck_failed"},502);
  const jsonPay=await payRes.json().catch(()=>({}));
  const payments=Array.isArray(jsonPay.items)?jsonPay.items:[];
  const captured=payments.find((x:any)=>x.order_id===order.razorpay_order_id&&x.status==="captured"&&x.currency==="INR"&&Number(x.amount)===Math.round(Number(order.total_amount)*100));
  if(captured){
    const now=new Date().toISOString();
    const {data:updated,error:updateError}=await db.from("tk_orders").update({payment_status:"paid",order_status:"confirmed",razorpay_payment_id:captured.id,paid_at:now,failure_reason:null,updated_at:now}).eq("id",order.id).neq("payment_status","paid").select("id").maybeSingle();
    if(updateError)return respond({error:"reconcile_update_failed"},500);
    return respond({status:"paid",order_ref:order.order_ref,updated:!!updated});
  }
  const failed=payments.some((x:any)=>x.order_id===order.razorpay_order_id&&x.status==="failed");
  return respond({status:failed?"failed_attempt":"pending",order_ref:order.order_ref,updated:false,message:failed?"Razorpay reports a failed payment attempt; no captured payment found.":"No captured payment found. Do not mark paid."});
 }
 if(req.method==="POST"&&action==="order_transition"){
  let body:any;try{body=await req.json()}catch{return respond({error:"invalid_json"},400)}
  if(typeof body.order_id!=="string"||!/^[0-9a-f-]{36}$/i.test(body.order_id)||
     !["preparing","packed","out_for_delivery","delivered","cancelled"].includes(body.to_status))
     return respond({error:"invalid_transition_request"},400);
  const {data,error}=await db.rpc("tk_crm_transition_order",{
   p_order_id:body.order_id,p_actor_uid:user.id,p_to_status:body.to_status,
   p_reason:typeof body.reason==="string"?body.reason.slice(0,500):null
  });
  if(error)return respond({error:"transition_rejected"},409);
  return respond({transition:data});
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
