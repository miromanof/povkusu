const fs=require('fs'),vm=require('vm');const elements={};const ctx={console,setTimeout(){},window:{scrollTo(){}},document:{getElementById:id=>elements[id]??={style:{},querySelector:()=>null}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
vm.runInContext(`
S.likes=[6,19];S.dislikes=[];
for(const store of ['Слата','Лента','Абсолют']){S.store=store;applyCatalog();S.budget=5000;buildPlan();let pasta=S.plan.flat().filter(id=>'pasta' in dishes[id].i).length;if(pasta>2)throw Error(store+': pasta repeated '+pasta+' times');let groups=new Set(S.plan.flat().filter(id=>dishes[id].kind==='main').map(id=>dishFamily(dishes[id])));if(groups.size<5)throw Error('Not enough main dish families');for(const day of S.plan){let main=day.filter(id=>dishes[id].kind==='main').map(id=>dishFamily(dishes[id]));if(new Set(main).size!==main.length)throw Error('Same main family twice in a day');}}
if(dishes.length<42)throw Error('Recipe collection not expanded');let imported=dishes.filter(d=>d.source?.provider==='TheMealDB');if(imported.length<5||imported.some(d=>!d.source.id||!d.source.adaptation||!d.steps?.length))throw Error('Missing recipe provenance');
S.store='Абсолют';applyCatalog();S.budget=5000;buildPlan();for(let i=0;i<10;i++)replaceMeal(i%7,1);if(S.plan.flat().filter(id=>'pasta' in dishes[id].i).length>2)throw Error('Replacement bypassed pasta cap');
S.unliked=['рыба','курица'];S.diet='Растительное';S.allergens=['Глютен'];buildPlan();if(S.plan.flat().some(id=>!allowed(dishes[id])))throw Error('Expanded recipe ignored hard filters');
console.log('PASS: pasta cap, main families, daily balance, replacement, imported recipe provenance, hard restrictions');
`,ctx);
