const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const elements={};const c={document:{getElementById:id=>elements[id]??=( {style:{},innerHTML:'',querySelector:()=>null})},window:{scrollTo(){}},setTimeout(){},console};vm.createContext(c);vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],c);
vm.runInContext(`
S.customAllergens=['помидоры'];if(allowed(dishes[6]))throw Error('Custom allergy');S.customAllergens=['молоко'];if(allowed(dishes[2]))throw Error('Allergen group');S.customAllergens=[];S.unliked=['морковь'];if(allowed(dishes[4]))throw Error('Disliked ingredient');S.unliked=[];S.plan=[[0]];let t=cart().total;S.customPantry=['овсянка'];if(cart().total>=t)throw Error('Custom pantry');S.customPantry=[];buildPlan(); if(S.plan.length!==7)throw Error('7 days');
if(cart().total<=0)throw Error('Cost');
let base=cart().total;S.adults=4;buildPlan();if(cart().total<=base)throw Error('Family size');
S.adults=2;S.allergens=['Молоко','Яйца','Глютен'];buildPlan();if(S.plan.flat().some(id=>dishes[id].a.some(a=>S.allergens.includes(a))))throw Error('Allergens');
S.allergens=[];S.equipment=[];S.time=15;buildPlan();if(S.plan.flat().some(id=>dishes[id].eq||dishes[id].min>15))throw Error('Equipment/time');
S.equipment=['Плита'];S.time=45;S.diet='Растительное';buildPlan();if(S.plan.flat().some(id=>!dishes[id].vegan))throw Error('Diet');
S.diet='Обычное';S.pantry=[];buildPlan();let before=cart().total;S.pantry=Object.keys(products);if(cart().total!==0)throw Error('Pantry');
S.pantry=[];S.budget=500;buildPlan();if(cart().total<500)throw Error('Expected impossible budget fixture');
S.budget=5000;S.meals=5;buildPlan();if(S.plan.flat().length!==35)throw Error('Meal count');
for(let i=0;i<9;i++){S.step=i;render()}
console.log('PASS: family portions, allergens, equipment, time, diet, pantry, budget, meals, 9 screens');
`,c);

