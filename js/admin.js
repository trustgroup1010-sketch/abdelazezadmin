const app=document.getElementById('app');let tab='p';
const logged=()=>!!auth.currentUser;
document.getElementById('out').onclick=()=>auth.signOut();
function loginView(){
 document.getElementById('out').hidden=true;
 app.innerHTML=`<div class="login"><h2>تسجيل الدخول</h2><input id="em" type="email" placeholder="البريد الإلكتروني"><input id="pw" type="password" placeholder="كلمة المرور"><button class="btn" id="go">دخول</button></div>`;
 go.onclick=()=>auth.signInWithEmailAndPassword(em.value.trim(),pw.value).catch(er=>alert(er.code));
}
function panel(){
 const T={p:'المنتجات',c:'الأقسام',o:'الطلبات',s:'الإعدادات'},n=get('o').filter(o=>o.status=='new').length;
 app.innerHTML=`<div class="tabs">${Object.keys(T).map(k=>`<button class="btn ${tab==k?'':'line'}" onclick="tab='${k}';panel()">${T[k]}${k=='o'&&n?` (${n})`:''}</button>`).join('')}</div><div id="v"></div>`;
 ({p:prods,c:cats_,o:orders,s:sett})[tab]();
}
function prods(){
 const ps=get('p'),cs=get('c'),cn=id=>(cs.find(c=>c.id==id)||{}).name||'-';
 v.innerHTML=`<div class="stats"><div><b>${ps.length}</b>منتج</div><div><b>${ps.filter(p=>p.discount>0).length}</b>عليه خصم</div></div>
 <p style="margin-bottom:12px"><button class="btn" onclick="edit()">+ إضافة منتج</button> <button class="btn line" onclick="bulk()">خصم على قسم كامل</button></p>
 <div class="tw"><table><tr><th></th><th>الاسم</th><th>القسم</th><th>السعر</th><th>الخصم</th><th>الحالة</th><th></th></tr>${ps.map(p=>`<tr><td><img src="${p.img}"></td><td>${e(p.name)}</td><td>${e(cn(p.cat))}</td><td>${money(+p.price)}</td><td>${p.discount||0}%</td><td>${p.show===false?'مخفي':p.stock===false?'نفذ':'ظاهر'}</td><td style="white-space:nowrap"><button class="btn sm" onclick="edit('${p.id}')">تعديل</button> <button class="btn sm red" onclick="delP('${p.id}')">حذف</button></td></tr>`).join('')}</table></div>`;
}
function edit(id){
 const p=get('p').find(x=>x.id==id)||{price:'',discount:0,show:true,stock:true,img:''},cs=get('c');
 const m=document.createElement('div');m.className='modal';
 m.innerHTML=`<form><h2>${id?'تعديل منتج':'منتج جديد'}</h2>
 <label>الاسم<input name="name" required value="${e(p.name)}"></label>
 <div class="row"><label>القسم<select name="cat">${cs.map(c=>`<option value="${c.id}" ${p.cat==c.id?'selected':''}>${e(c.name)}</option>`).join('')}</select></label><label>السعر (ج.م)<input name="price" type="number" step="0.01" min="0" required value="${p.price}"></label></div>
 <label>نسبة الخصم %<input name="discount" type="number" min="0" max="100" value="${p.discount||0}"></label>
 <label>وصف قصير<input name="desc" value="${e(p.desc)}"></label>
 <label>تفاصيل إضافية (سطر لكل معلومة)<textarea name="details" rows="3">${e(p.details)}</textarea></label>
 <label>الصورة<input type="file" accept="image/*" id="f"></label><img id="pv" src="${p.img}" style="max-height:110px;${p.img?'':'display:none'}">
 <div class="row"><label><input type="checkbox" name="show" ${p.show!==false?'checked':''} style="width:auto"> يظهر في الموقع</label><label><input type="checkbox" name="stock" ${p.stock!==false?'checked':''} style="width:auto"> متوفر</label></div>
 <div class="row"><button class="btn">حفظ</button><button type="button" class="btn line" id="cx">إلغاء</button></div></form>`;
 document.body.appendChild(m);let img=p.img;
 m.querySelector('#cx').onclick=()=>m.remove();
 m.querySelector('#f').onchange=ev=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);img=c.toDataURL('image/jpeg',.8);const pv=m.querySelector('#pv');pv.src=img;pv.style.display='block'};i.src=r.result};r.readAsDataURL(ev.target.files[0])};
 m.querySelector('form').onsubmit=ev=>{ev.preventDefault();const f=new FormData(ev.target),ps=get('p');
  const o={id:id||'p'+Date.now(),t:p.t||Date.now(),name:f.get('name'),cat:f.get('cat'),price:+f.get('price'),discount:Math.min(100,+f.get('discount')||0),desc:f.get('desc'),details:f.get('details'),img:img||ph('📦'),show:f.has('show'),stock:f.has('stock')};
  const i=ps.findIndex(x=>x.id==o.id);i<0?ps.unshift(o):ps[i]=o;
  try{set('p',ps)}catch(x){return alert('المساحة ممتلئة، استخدم صور أصغر')}m.remove();panel()};
}
function delP(id){if(confirm('حذف المنتج؟')){set('p',get('p').filter(p=>p.id!=id));panel()}}
function bulk(){
 const cs=get('c'),c=prompt('اكتب رقم القسم:\n'+cs.map((c,i)=>`${i+1}- ${c.name}`).join('\n'));if(!c||!cs[c-1])return;
 const d=prompt('نسبة الخصم % (اكتب 0 لإلغاء الخصم):');if(d===null||isNaN(d))return;
 set('p',get('p').map(p=>p.cat==cs[c-1].id?{...p,discount:Math.min(100,+d)}:p));panel();
}
function cats_(){
 const cs=get('c');
 v.innerHTML=`<p style="margin-bottom:12px"><button class="btn" onclick="editC()">+ إضافة قسم</button></p><div class="tw"><table>${cs.map(c=>`<tr><td style="font-size:26px;width:60px">${catIcon(c)}</td><td>${e(c.name)}</td><td style="white-space:nowrap"><button class="btn sm" onclick="editC('${c.id}')">تعديل</button> <button class="btn sm red" onclick="delC('${c.id}')">حذف</button></td></tr>`).join('')}</table></div>`;
}
function editC(id){
 const c=get('c').find(x=>x.id==id)||{name:'',icon:'📦',img:''};let img=c.img||'';
 const m=document.createElement('div');m.className='modal';
 m.innerHTML=`<form><h2>${id?'تعديل قسم':'قسم جديد'}</h2>
 <label>اسم القسم<input name="name" required value="${e(c.name)}"></label>
 <label>أيقونة إيموجي (تُستخدم لو مفيش صورة)<input name="icon" value="${e(c.icon)}"></label>
 <label>صورة القسم (اختياري)<input type="file" accept="image/*" id="f"></label>
 <div id="pw" style="${img?'':'display:none'}"><img id="pv" src="${img}" style="max-height:90px;border-radius:6px"> <button type="button" class="btn sm red" id="rm">إزالة الصورة</button></div>
 <div class="row"><button class="btn">حفظ</button><button type="button" class="btn line" id="cx">إلغاء</button></div></form>`;
 document.body.appendChild(m);
 m.querySelector('#cx').onclick=()=>m.remove();
 m.querySelector('#rm').onclick=()=>{img='';m.querySelector('#pw').style.display='none'};
 m.querySelector('#f').onchange=ev=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,300/Math.max(i.width,i.height)),cv=document.createElement('canvas');cv.width=i.width*k;cv.height=i.height*k;cv.getContext('2d').drawImage(i,0,0,cv.width,cv.height);img=cv.toDataURL('image/jpeg',.85);m.querySelector('#pv').src=img;m.querySelector('#pw').style.display='block'};i.src=r.result};r.readAsDataURL(ev.target.files[0])};
 m.querySelector('form').onsubmit=ev=>{ev.preventDefault();const f=new FormData(ev.target),cs=get('c');
  const o={id:id||'c'+Date.now(),name:f.get('name').trim(),icon:f.get('icon').trim()||'📦',img};
  const i=cs.findIndex(x=>x.id==o.id);i<0?cs.push(o):cs[i]=o;
  try{set('c',cs)}catch(x){return alert('المساحة ممتلئة')}m.remove();panel()};
}
function delC(id){if(get('p').some(p=>p.cat==id))return alert('انقل منتجات هذا القسم أو احذفها أولًا');if(confirm('حذف القسم؟')){set('c',get('c').filter(c=>c.id!=id));panel()}}
function orders(){
 const o=get('o');
 v.innerHTML=o.length?`<div class="tw"><table><tr><th></th><th>المنتج</th><th>السعر</th><th>التاريخ</th><th>الحالة</th><th></th></tr>${o.map(x=>`<tr><td><img src="${(get('p').find(p=>p.id==x.pid)||{}).img||''}"></td><td>${e(x.name)}</td><td>${money(x.price)}</td><td>${x.date}</td><td><span class="st ${x.status}">${x.status=='new'?'جديد':'تم'}</span></td><td style="white-space:nowrap"><button class="btn sm" onclick="done(${x.id})">${x.status=='new'?'تم التنفيذ':'إرجاع'}</button> <button class="btn sm red" onclick="delO(${x.id})">حذف</button></td></tr>`).join('')}</table></div>`:'<p>لا توجد طلبات بعد. أي طلب يضغطه العميل يظهر هنا.</p>';
}
function done(id){set('o',get('o').map(x=>x.id==id?{...x,status:x.status=='new'?'done':'new'}:x));panel()}
function delO(id){set('o',get('o').filter(x=>x.id!=id));panel()}
function sett(){
 const s=S();
 v.innerHTML=`<form id="sf" class="login" style="margin:0;max-width:480px">${[['name','اسم المحل'],['tagline','الشعار / وصف قصير'],['phone','رقم واتساب (بصيغة دولية بدون +، مثال 201001234567)'],['address','العنوان']].map(([k,l])=>`<label>${l}<input name="${k}" value="${e(s[k])}"></label>`).join('')}<button class="btn">حفظ الإعدادات</button></form>`;
 sf.onsubmit=ev=>{ev.preventDefault();set('s',Object.fromEntries(new FormData(sf)));alert('تم الحفظ')};
}
auth.onAuthStateChanged(async u=>{
 if(!u)return loginView();
 document.getElementById('out').hidden=false;app.innerHTML='<p style="padding:30px">جاري التحميل...</p>';
 try{await init();
  if(!CACHE.c.length&&!Object.keys(CACHE.s).length){await set('c',DEF.c);await set('s',DEF.s)}
  panel()}catch(er){app.innerHTML='<p style="padding:30px">خطأ: '+er.message+'<br>تأكد من قواعد Firestore ومن إيميل الأدمن.</p>'}
});
