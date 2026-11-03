// Přijímačky – společné jádro dat a pomocné funkce
(function(G){
  const PQ = G.PQ = G.PQ || {topics:[]};
  PQ.ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
  PQ.pick = arr=>arr[Math.floor(Math.random()*arr.length)];
  PQ.shuffle = arr=>{arr=arr.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;};
  PQ.gcd = (a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
  PQ.fmt = n=>{ // české formátování čísla
    const r=Math.round(n*1e6)/1e6; return String(r).replace('-', '−').replace('.', ',');
  };
  // typy otázek: mc (o: možnosti, a: index správné), yn (s: [[tvrzení, true/false]]), num (a: číslo nebo pole), txt (a: pole přijatelných odpovědí)
  PQ.mc  = (q,o,a,e,x)=>Object.assign({t:'mc',q,o,a,e},x||{});
  PQ.yn  = (q,s,e,x)=>Object.assign({t:'yn',q,s,e},x||{});
  PQ.num = (q,a,e,x)=>Object.assign({t:'num',q,a:[].concat(a),e},x||{});
  PQ.txt = (q,a,e,x)=>Object.assign({t:'txt',q,a:[].concat(a),e},x||{});
  // vytvoří MC z hodnoty a seznamu rušivých hodnot (odstraní duplicity)
  PQ.mcVals = (q,right,wrongs,e,x)=>{
    const seen=new Set([String(right)]);const o=[right];
    for(const w of wrongs){if(o.length>=4)break;const k=String(w);if(!seen.has(k)){seen.add(k);o.push(w);}}
    return PQ.mc(q,o,0,e,x);
  };
  PQ.topic = (subj,id,name,emoji,items,gens)=>PQ.topics.push({subj,id,name,emoji,items:items||[],gens:gens||[]});
  // parsování odpovědi uživatele (desetinná čárka, zlomky, mezery, mínus)
  PQ.parseNum = s=>{
    s=String(s).trim().replace(/\s+/g,'').replace(/−/g,'-').replace(',', '.');
    s=s.replace(/(cm|mm|m|km|dm|kč|%|°|l|ml|kg|g|h|min|s)(\^?[23²³])?$/i,'');
    let m=s.match(/^(-?)(\d+)\s*\+?(\d+)\/(\d+)$/); // smíšené číslo 1 1/2 -> po odstranění mezer nelze, ignorujeme
    m=s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if(m){const d=parseFloat(m[2]);return d===0?NaN:parseFloat(m[1])/d;}
    if(/^-?\d*\.?\d+$/.test(s))return parseFloat(s);
    return NaN;
  };
  PQ.norm = s=>String(s).trim().toLowerCase().replace(/\s+/g,' ').replace(/[.!]$/,'');
  PQ.check = (item,ans)=>{ // vrací {ok, part} ; part = podíl správně (pro yn)
    if(item.t==='mc')return {ok:ans===item.a,part:ans===item.a?1:0};
    if(item.t==='yn'){let c=0;item.s.forEach((s,i)=>{if(ans&&ans[i]===s[1])c++;});return {ok:c===item.s.length,part:c/item.s.length,c};}
    if(item.t==='num'){const v=PQ.parseNum(ans);const tol=item.tol||0;const ok=!isNaN(v)&&item.a.some(a=>Math.abs(a-v)<=tol+1e-6*Math.max(1,Math.abs(a)));return {ok,part:ok?1:0};}
    if(item.t==='txt'){const v=PQ.norm(ans);const ok=item.a.some(a=>PQ.norm(a)===v);return {ok,part:ok?1:0};}
    if(item.t==='err'){const tk=PQ.tokenize(item.w);const E=tk.map((t,i)=>t.r!==undefined?i:-1).filter(i=>i>=0);const A=new Set(ans||[]);
      const hits=E.filter(i=>A.has(i)).length,fp=[...A].filter(i=>!E.includes(i)).length;return {ok:hits===E.length&&fp===0,part:Math.max(0,hits-fp)/E.length,c:hits,fp};}
    if(item.t==='ord'){const n=item.parts.length-1;let c=0;for(let i=0;i<n;i++)if(ans&&ans[i]===i+1)c++;return {ok:c===n,part:c/n};}
    return {ok:false,part:0};
  };
})(typeof window!=='undefined'?window:globalThis);
