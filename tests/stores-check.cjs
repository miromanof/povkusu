const fs=require('fs'),vm=require('vm');const els={};const ctx={console,setTimeout(){},window:{scrollTo(){}},document:{getElementById:id=>els[id]??={style:{},querySelector:()=>null}}};vm.createContext(ctx);let h=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');vm.runInContext(h.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);vm.runInContext(`
for(let [name,count] of [['Слата',19],['METRO',20],['ХлебСоль',18],['Лента',16],['Абсолют',20]]){S.store=name;applyCatalog();if(Object.keys(catalogRows).length!==count)throw Error('Count '+name);buildPlan();if(S.plan.length!==7||!Number.isFinite(cart().total))throw Error('Plan '+name);if(S.plan.flat().some(id=>Object.keys(dishes[id].i).some(k=>!catalogRows[k])))throw Error('Missing source '+name);console.log(name,count,'products',cart().total,'RUB');}
S.store='Лента';applyCatalog();S.adults=1;S.plan=[[0]];let a=cart().items.find(i=>i.k==='apple');if(a.cost!==21.58||a.quantity!==100)throw Error('Weight normalization');
S.store='ХлебСоль';applyCatalog();S.plan=[[1]];let egg=cart().items.find(i=>i.k==='egg');if(egg.size!==15||egg.cost!==119.85)throw Error('Store pack size');
S.store='METRO';applyCatalog();S.plan=[[4]];if(products.buckwheat[2]!==60.9)throw Error('Store switch');
S.store='Абсолют';applyCatalog();S.adults=1;S.plan=[[0]];let absApple=cart().items.find(i=>i.k==='apple');if(absApple.cost!==13.99||absApple.quantity!==100)throw Error('Absolut weighted price');if(products.oats[1]!==350||products.oats[2]!==49.89)throw Error('Absolut packaging');
if(Object.values(catalogRegistry).some(c=>c.automaticUpdates!==false))throw Error('Snapshot provenance');
console.log('PASS: five catalogs, unavailable ingredients, weight normalization, pack sizes, store switching, snapshot labels');
`,ctx);
