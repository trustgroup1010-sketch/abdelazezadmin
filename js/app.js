const K={p:'shop_products',c:'shop_cats',o:'shop_orders',s:'shop_settings'};
const ph=(t)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e9e2cf"/><text x="200" y="240" font-size="140" text-anchor="middle">${t}</text></svg>`);
const DEF={
 s:{name:'اسم المحل',tagline:'ولاعات، محابس، طلمبات وكل احتياجاتك بأفضل سعر',phone:'201000000000',address:'العنوان هنا، المدينة'},
 c:[{id:'c1',name:'ولاعات',icon:'🔥'},{id:'c2',name:'محابس',icon:'🚰'},{id:'c3',name:'طلمبات',icon:'⚙️'},{id:'c4',name:'أخرى',icon:'📦'}],
};
firebase.initializeApp(FIREBASE_CONFIG);
const db=firebase.firestore(),auth=firebase.auth?firebase.auth():null;
const COL={p:'products',c:'categories',o:'orders'};
let CACHE={p:[],c:[],o:[],s:{}};
const get=k=>JSON.parse(JSON.stringify(k=='s'?CACHE.s:CACHE[k]));
const num=x=>Number(String(x.id).replace(/\D/g,''))||0;
async function init(){
 const L=async k=>(await db.collection(COL[k]).get()).docs.map(d=>({...d.data(),id:d.id}));
 CACHE.p=(await L('p')).sort((x,y)=>(y.t||0)-(x.t||0));
 CACHE.c=(await L('c')).sort((x,y)=>num(x)-num(y));
 const st=await db.doc('settings/main').get();CACHE.s=st.exists?st.data():{};
 if(auth&&auth.currentUser)CACHE.o=(await L('o')).sort((x,y)=>num(y)-num(x));
}
function set(k,v){
 if(k=='s'){CACHE.s=v;return db.doc('settings/main').set(v).catch(er=>alert('تعذر الحفظ: '+er.message))}
 const old=CACHE[k],ids=new Set(v.map(x=>String(x.id))),b=db.batch(),col=db.collection(COL[k]);
 v.forEach(x=>{const o=old.find(y=>y.id==x.id);if(!o||JSON.stringify(o)!=JSON.stringify(x)){const {id,...r}=x;b.set(col.doc(String(x.id)),r)}});
 old.forEach(o=>{if(!ids.has(String(o.id)))b.delete(col.doc(String(o.id)))});
 CACHE[k]=v;
 return b.commit().catch(er=>alert('تعذر الحفظ: '+er.message));
}
const S=()=>({...DEF.s,...CACHE.s});
const catIcon=c=>c.img?`<img class="ci" src="${c.img}" alt="">`:c.icon;
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const final=p=>Math.round(p.price*(1-(p.discount||0)/100)*100)/100;
const money=n=>n.toLocaleString('ar-EG')+' ج.م';
const priceHtml=p=>`<span class="price">${money(final(p))}</span>${p.discount>0?`<span class="old">${money(+p.price)}</span>`:''}`;
function layout(page){
 const s=S();
 document.title=s.name;
 document.getElementById('hdr').innerHTML=`<header><div class="wrap"><a class="logo" href="index.html">${e(s.name)}</a><nav><a href="index.html" class="${page=='home'?'on':''}">الرئيسية</a><a href="products.html" class="${page=='products'?'on':''}">المنتجات</a><a href="index.html#contact">تواصل معنا</a></nav></div></header>`;
 document.getElementById('ftr').innerHTML=`<footer>© ${e(s.name)} — جميع الحقوق محفوظة</footer>`;
}
function card(p){return `<a class="card ${p.stock===false?'out':''}" href="product.html?id=${p.id}">${p.discount>0?`<span class="tag">خصم ${p.discount}%</span>`:''}<img src="${p.img}" alt="${e(p.name)}" loading="lazy"><div class="b"><h3>${e(p.name)}</h3><div class="d">${e(p.desc)}</div><div>${priceHtml(p)}</div></div></a>`}
function order(id){
 const p=get('p').find(x=>x.id==id),s=S();if(!p)return;
 const url=location.href.replace(/[^/]*(\?.*)?$/,'')+'product.html?id='+p.id;
 const msg=`السلام عليكم، عايز أطلب:\n*${p.name}*\nالسعر: ${final(p)} ج.م\nالصورة/الرابط: ${url}`;
 db.collection('orders').add({pid:p.id,name:p.name,price:final(p),date:new Date().toLocaleString('ar-EG'),status:'new',t:Date.now()}).catch(()=>{});
 window.open(`https://wa.me/${s.phone}?text=${encodeURIComponent(msg)}`,'_blank');
}
