(() => {
  const $ = id => document.getElementById(id);
  const KEY = 'wingoLabFirebaseDatabaseUrl';
  const status = (msg, ok=false) => { const el=$('firebaseStatus'); if(el){el.textContent=msg;el.style.color=ok?'#22c55e':'';} };
  const cleanUrl = v => String(v||'').trim().replace(/\/+$/,'');
  const endpoint = () => { const u=cleanUrl(localStorage.getItem(KEY)); if(!u) throw new Error('Save your Firebase Realtime Database URL first.'); if(!/^https:\/\//i.test(u)) throw new Error('Database URL must start with https://'); return u + '/wingoLab/records.json'; };
  const getRecords = () => typeof window.wingoLabGetRecords==='function' ? window.wingoLabGetRecords() : [];
  $('firebaseUrl').value=localStorage.getItem(KEY)||'';
  $('saveFirebaseUrl').addEventListener('click',()=>{const u=cleanUrl($('firebaseUrl').value);if(!u){status('Enter database URL');return;}localStorage.setItem(KEY,u);status('Database URL saved in this browser',true);});
  $('firebasePush').addEventListener('click',async()=>{try{const url=endpoint();const records=getRecords();if(!records.length)throw new Error('No data loaded. Import records or collect data first.');status('Saving…');const r=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({updatedAt:new Date().toISOString(),records})});if(!r.ok)throw new Error(`Firebase HTTP ${r.status}. Check database URL and rules.`);status(`Saved ${records.length} response records`,true);}catch(e){status(e.message||'Firebase save failed');}});
  $('firebaseLoad').addEventListener('click',async()=>{try{const url=endpoint();status('Loading…');const r=await fetch(url);if(!r.ok)throw new Error(`Firebase HTTP ${r.status}. Check database URL and rules.`);const data=await r.json();if(!data||!Array.isArray(data.records))throw new Error('No records found at /wingoLab/records.');window.wingoLabLoadRecords(data.records);status(`Loaded ${data.records.length} response records`,true);}catch(e){status(e.message||'Firebase load failed');}});
  window.addEventListener('wingo:records-updated',()=>{status('Data changed locally — click Save to Firebase');});
})();