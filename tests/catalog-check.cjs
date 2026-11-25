const fs=require('fs'),vm=require('vm');const els={};const ctx={console,setTimeout(){},window:{scrollTo(){}},document:{getElementById:id=>els[id]??={style:{},querySelector:()=>null}}};vm.createContext(ctx);const h=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');vm.runInContext(h.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);vm.runInContext(`
if(Object.keys(catalogRows).length!==19)throw Error('Catalog rows');
if(products.rice[1]!==800||products.rice[2]!==67.99)throw Error('Real pack and price');
S.adults=1;S.plan=[[0]];let c=cart();let oats=c.items.find(x=>x.k==='oats'),apple=c.items.find(x=>x.k==='apple');
if(oats.packs!==1||oats.cost!==49.99)throw Error('Pack rounding');
if(!apple.weighted||apple.quantity!==100||apple.cost!==10.5)throw Error('Weighted cost');
if(allowed(dishes[8]))throw Error('Missing cabbage must be excluded');
S.customPantry=['яблоки'];if(cart().items.some(x=>x.k==='apple'))throw Error('Pantry');S.customPantry=[];
S.store='Пятёрочка';applyCatalog();if(dishes.some(allowed))throw Error('No fabricated catalog');if(cart().missing.length!==2)throw Error('Unknown costs');
S.store='Слата';S.budget=5000;applyCatalog();buildPlan();if(S.plan.length!==7||!Number.isFinite(cart().total))throw Error('Real menu');
S.priceMode='demo';applyCatalog();if(products.rice[2]!==130)throw Error('Demo isolated');
console.log('PASS: verified source rows, pack sizes, weighted prices, missing products, unavailable stores, real menu, demo separation');
`,ctx);

