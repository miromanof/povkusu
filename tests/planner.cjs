const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const elements={};const ctx={console,setTimeout(){},window:{scrollTo(){}},document:{getElementById:id=>elements[id]??={style:{},querySelector:()=>null}}};vm.createContext(ctx);vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
vm.runInContext(`
S.store='Абсолют';applyCatalog();S.likes=[4];S.dislikes=[6];
if(!allowed(dishes[6]))throw Error('A swipe must not become a hard exclusion');
if(!(tasteScore(dishes.find(d=>d.n==='Курица с рисом'))>tasteScore(dishes[6])))throw Error('Likes must generalize to related recipes');
let previous=0,seen=[];
for(const budget of [1800,2200,2600,3200,5000,10000]){S.budget=budget;buildPlan();let n=new Set(S.plan.flat()).size;let cost=cart().total;if(n<previous)throw Error('Diversity decreased with budget');if(cost>budget&&S.planMeta.affordable)throw Error('Incorrect budget flag');seen.push({budget,n,cost});previous=n;}
if(seen.at(-1).n<=seen[1].n)throw Error('Higher budget did not increase variety');
if(!S.plan.flat().some(id=>!S.likes.includes(id)))throw Error('Likes became a whitelist');
S.likes=[4,16,17,19,23];S.dislikes=[5,8,10,13,20,21];buildPlan();let chickenPlan=S.plan.flat().join(',');S.likes=[5,8,10,13,20,21];S.dislikes=[4,16,17,19,23];buildPlan();if(S.plan.flat().join(',')===chickenPlan)throw Error('Taste has no effect on the plan');
S.budget=500;buildPlan();if(S.planMeta.affordable||cart().total<=500)throw Error('Infeasible budget not reported');
S.budget=2600;buildPlan();let originalCost=cart().total;replaceMeal(0,0);if(originalCost<=S.budget&&cart().total>S.budget)throw Error('Replacement exceeded budget');
S.step=6;S.card=2;let votes=JSON.stringify([S.likes,S.dislikes]);next();if(JSON.stringify([S.likes,S.dislikes])!==votes)throw Error('Budget change erased taste');
S.step=6;let screen=document.getElementById('screen');screen.querySelector=selector=>selector==='input[type=number]'?({value:'2200'}):null;next();if(S.budget!==2200||S.step!==8)throw Error('Visible budget not applied');screen.querySelector=()=>null;
S.allergens=['Молоко','Яйца','Рыба','Глютен'];S.customAllergens=['курица'];S.unliked=['лук'];S.diet='Растительное';buildPlan();if(S.plan.flat().some(id=>!allowed(dishes[id])))throw Error('Hard exclusion violated');
S.allergens=[];S.customAllergens=[];S.unliked=[];S.diet='Обычное';S.budget=10000;S.meals=5;buildPlan();if(S.plan.flat().length!==35)throw Error('Missing meals');
S.pantry=Object.keys(products);buildPlan();if(cart().total!==0)throw Error('Pantry ignored');
for(const store of Object.keys(catalogRegistry)){S.store=store;S.pantry=[];applyCatalog();S.budget=5000;buildPlan();if(S.plan.flat().some(id=>Object.keys(dishes[id].i).some(k=>!catalogRows[k])))throw Error('Unpriced ingredient '+store);}
console.log('PASS: taste transfer, soft swipes, budget variety, hard filters, vote preservation, five catalogs');console.table(seen);
`,ctx);
