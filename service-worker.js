chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== 'WINGO_CAPTURE' || !msg.payload) return;
  chrome.storage.local.get(['wingoRecords']).then(data => {
    const records = Array.isArray(data.wingoRecords) ? data.wingoRecords : [];
    const p = msg.payload;
    const key = p.url + '|' + JSON.stringify(p.body).slice(0,500);
    if (!records.some(r => r.dedupeKey === key)) records.unshift({...p, dedupeKey:key, page:sender.tab?.url || ''});
    records.splice(1000);
    return chrome.storage.local.set({wingoRecords:records});
  }).then(() => chrome.runtime.sendMessage({type:'WINGO_CAPTURED'}).catch(()=>{})).catch(()=>{});
});
importScripts('signature.js');
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
 if(msg?.type!=='WINGO_FETCH_SIGNED') return;
 (async()=>{
  const gameCode=msg.gameCode==='WinGo_30S'?'WinGo_30S':'WinGo_1M';
  const params=wingoSignParams({gameCode,language:'en'});
  const qs=new URLSearchParams(params).toString();
  const url=`https://api.ar-lottery01.com/api/Energy/GetPanel?${qs}`;
  const res=await fetch(url,{method:'GET',credentials:'include'});
  const text=await res.text();let body;try{body=JSON.parse(text)}catch{body={raw:text}}
  if(!res.ok) throw new Error(`Energy/GetPanel HTTP ${res.status}`);
  const record={url,status:res.status,capturedAt:Date.now(),body,source:'signed-manual-fetch'};
  const old=await chrome.storage.local.get(['wingoRecords']);const records=Array.isArray(old.wingoRecords)?old.wingoRecords:[];
  records.unshift(record);records.splice(1000);await chrome.storage.local.set({wingoRecords:records});
  chrome.runtime.sendMessage({type:'WINGO_CAPTURED'}).catch(()=>{});
  return {ok:true,record};
 })().then(sendResponse).catch(e=>sendResponse({ok:false,error:String(e.message||e)}));
 return true;
});
