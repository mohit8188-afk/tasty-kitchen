import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGINS = new Set(["https://tastykitchen.food","https://www.tastykitchen.food","https://tasty-kitchen-blond.vercel.app"]);
const PHONE = "9834621628"; // Founder-designated temporary receiving UPI Number; customer must verify recipient in payment app.
const PRODUCTS:Record<string,{name:string;prices:Record<number,number>;scope:string}>={
  "makhana-mewa-bites":{name:"Makhana Mewa Bites",prices:{250:400,500:800},scope:"india"},
  "coconut-mewa-ladoo":{name:"Coconut Mewa Ladoo",prices:{250:175,500:350},scope:"india"},
  "jalebi-with-rabdi":{name:"Jalebi with Rabdi",prices:{250:200,500:400},scope:"ahmedabad"}
};
function headers(origin:string|null){
  return {"Access-Control-Allow-Origin":origin&&ORIGINS.has(origin)?origin:"https://tastykitchen.food",
    "Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type",
    "Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};
}
function result(body:unknown,status:number,origin:string|null){return new Response(JSON.stringify(body),{status,headers:headers(origin)});}
const clean=(v:unknown,max=300)=>String(v??"").trim().slice(0,max);
const digits=(v:unknown)=>String(v??"").replace(/\D/g,"").slice(-10);
const isCheckoutId=(v:string)=>/^[a-zA-Z0-9-]{8,120}$/.test(v);
function paymentInstructions(orderRef:string,total:number){
  const vpa="mohit8188-1@okicici"; // Public receiving UPI VPA supplied by the founder on 17 Oct 2026.
  const payee=clean(Deno.env.get("TK_MANUAL_UPI_PAYEE")||"Tasty Kitchen",80);
  const validVpa=/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(vpa);
  const params=new URLSearchParams();
  if(validVpa){params.set("pa",vpa);params.set("pn",payee);params.set("am",total.toFixed(2));params.set("cu","INR");params.set("tn","Tasty Kitchen "+orderRef);}
  return {upi_uri:validVpa?"upi://pay?"+params.toString():null,upi_vpa:validVpa?vpa:null,payee_name:payee,payee_phone:PHONE};
}
Deno.serve(async req=>{
  const origin=req.headers.get("origin");
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
  if(req.method!=="POST")return result({error:"method_not_allowed"},405,origin);
  if(origin&&!ORIGINS.has(origin))return result({error:"origin_not_allowed"},403,origin);
  let body:Record<string,any>;
  try{body=await req.json();}catch{return result({error:"invalid_json"},400,origin);}
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return result({error:"server_not_configured"},503,origin);
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

  if(body.action==="claim"){
    const clientId=clean(body.client_checkout_id,120),ref=clean(body.order_ref,80);
    if(!isCheckoutId(clientId)||!/^TK[-A-Z0-9]{4,}$/i.test(ref))return result({error:"invalid_order"},400,origin);
    const {data:o,error:e}=await db.from("tk_orders").select("id,order_ref,payment_status,payment_submitted_at")
      .eq("client_checkout_id",clientId).eq("order_ref",ref).eq("payment_provider","manual_upi").eq("payment_environment","live").maybeSingle();
    if(e||!o)return result({error:"order_not_found"},404,origin);
    if(o.payment_status==="paid")return result({ok:true,order_ref:ref,status:"confirmed"},200,origin);
    if(o.payment_status!=="pending")return result({error:"order_not_pending"},409,origin);
    if(!o.payment_submitted_at){
      const now=new Date().toISOString();
      const {error:upError}=await db.from("tk_orders")
        .update({payment_submitted_at:now,payment_method:"upi",updated_at:now})
        .eq("id",o.id).eq("payment_status","pending").eq("payment_provider","manual_upi");
      if(upError)return result({error:"update_failed"},500,origin);
    }
    return result({ok:true,order_ref:ref,status:"awaiting_bank_verification",message:"Your payment report is saved. We will confirm your order after checking the bank credit."},200,origin);
  }
  if(body.action!=="create")return result({error:"invalid_action"},400,origin);
 // A verified UPI VPA enables deep links; otherwise show the founder-approved receiving UPI number with exact amount.
  const name=clean(body.name,100),mobile=digits(body.mobile),address=clean(body.address,600);
  const pin=clean(body.pincode,10),deliveryDate=clean(body.delivery_date,20),clientId=clean(body.client_checkout_id,120);
  if(name.length<2||!/^[6-9]\d{9}$/.test(mobile)||address.length<8||!/^\d{6}$/.test(pin)||!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)||!isCheckoutId(clientId))
    return result({error:"invalid_customer_details",message:"Please review your name, phone, delivery address, PIN and delivery date."},400,origin);
  const rawItems=Array.isArray(body.items)?body.items:[];
  if(!rawItems.length||rawItems.length>20)return result({error:"invalid_cart"},400,origin);
  const items:any[]=[];let total=0,scope="india";
  for(const raw of rawItems){
    const productId=clean(raw.product_id,80),pack=Number(raw.pack_grams),quantity=Number(raw.quantity),product=PRODUCTS[productId];
    if(!product||![250,500].includes(pack)||!Number.isInteger(quantity)||quantity<1||quantity>20)return result({error:"invalid_cart_item"},400,origin);
    const price=product.prices[pack],lineTotal=price*quantity;
    total+=lineTotal; if(product.scope==="ahmedabad")scope="ahmedabad";
    items.push({product_id:productId,product_name:product.name,pack_grams:pack,quantity,unit_price:price,line_total:lineTotal});
  }
  if(total<=0||total>500000)return result({error:"invalid_total"},400,origin);
  const {data:existing,error:existsErr}=await db.from("tk_orders").select("id,order_ref,total_amount,payment_provider,payment_status")
    .eq("client_checkout_id",clientId).maybeSingle();
  if(existsErr)return result({error:"lookup_failed"},500,origin);
  if(existing){
    if(existing.payment_provider!=="manual_upi"||Number(existing.total_amount)!==total)return result({error:"checkout_conflict"},409,origin);
    const {data:a}=await db.from("tk_upi_reservations").select("amount_paise").eq("client_checkout_id",clientId).maybeSingle();
    if(!a)return result({error:"payment_reservation_missing"},503,origin);
    return result({ok:true,order_ref:existing.order_ref,total_amount:total,upi_amount:Number(a.amount_paise)/100,payment_status:existing.payment_status,
      ...paymentInstructions(existing.order_ref,Number(a.amount_paise)/100)},200,origin);
  }
  let {data:contact,error:contactErr}=await db.from("tk_contacts").select("id").eq("normalized_mobile",mobile).maybeSingle();
  if(contactErr)return result({error:"customer_lookup_failed"},500,origin);
  const now=new Date().toISOString();
  let contactId=contact?.id;
  if(contactId){
    const {error:e}=await db.from("tk_contacts").update({name,mobile,address,pincode:pin,last_seen_at:now,last_contact_at:now,source:"website"}).eq("id",contactId);
    if(e)return result({error:"customer_update_failed"},500,origin);
  }else{
    const {data:c,error:e}=await db.from("tk_contacts").insert({name,mobile,normalized_mobile:mobile,address,pincode:pin,lifecycle_stage:"lead",source:"website",last_contact_at:now}).select("id").single();
    if(e||!c)return result({error:"customer_create_failed"},500,origin);contactId=c.id;
  }
  const {data:allocation,error:allocError}=await db.rpc("tk_allocate_upi_amount",{p_kind:"order",p_checkout_id:clientId,p_base_paise:total*100});
  const reserved=allocation?.[0];
  if(allocError||!reserved)return result({error:"payment_amount_unavailable",message:"Unique UPI payment amounts are full. Please contact Tasty Kitchen."},503,origin);
  const payable=Number(reserved.amount_paise)/100;
  const attr=body.attribution||{};
  const {data:order,error:orderErr}=await db.from("tk_orders").insert({
    contact_id:contactId,customer_name:name,customer_mobile:mobile,delivery_address:address,delivery_pincode:pin,
    delivery_scope:scope,delivery_date:deliveryDate,delivery_charge:0,total_amount:total,
    payment_status:"pending",order_status:"created",client_checkout_id:clientId,source:"website",payment_provider:"manual_upi",
    payment_environment:"live",payment_method:"upi",manual_upi_amount:payable,
    utm_source:clean(attr.utm_source,150)||null,utm_medium:clean(attr.utm_medium,150)||null,
    utm_campaign:clean(attr.utm_campaign,150)||null,utm_content:clean(attr.utm_content,150)||null
  }).select("id,order_ref,total_amount").single();
  if(orderErr||!order)return result({error:"order_create_failed",message:"We could not create your order. Please try again."},500,origin);
  await db.from("tk_upi_reservations").update({reference_id:order.id,reference_code:order.order_ref}).eq("id",reserved.reservation_id);
  const {error:linesErr}=await db.from("tk_order_items").insert(items.map(it=>({...it,order_id:order.id})));
  if(linesErr){
    await db.from("tk_orders").update({failure_reason:"order_items_create_failed",updated_at:now}).eq("id",order.id);
    return result({error:"order_items_failed",message:"We could not finish preparing the order. Please contact Tasty Kitchen."},500,origin);
  }
  await db.from("tk_interactions").insert({contact_id:contactId,channel:"website",direction:"inbound",event_type:"manual_upi_order_created",
    summary:"Customer created an unpaid manual UPI order.",metadata:{order_ref:order.order_ref,total_amount:total}});
  return result({ok:true,order_ref:order.order_ref,total_amount:total,upi_amount:payable,adjustment_amount:Number((payable-total).toFixed(2)),payment_status:"pending",...paymentInstructions(order.order_ref,payable)},201,origin);
});
