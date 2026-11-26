import {historyWeights,localDate} from './menu-history.mjs?v=history-1';
import {dishKey,allowedSlots,breakfastFormat} from './meal-rules.mjs?v=history-1';
export const portionFactor=p=>p.adults+p.kids.reduce((sum,age)=>sum+(age<4?.35:age<8?.55:age<13?.75:1),0);
export const slots=meals=>meals===2?['breakfast','main']:meals===3?['breakfast','main','main']:meals===4?['breakfast','main','snack','main']:['breakfast','snack','main','snack','main'];
const atHome=(i,p)=>i.key==='water'||p.pantry&&i.pantry||(p.homeKeys||[]).includes(i.key);
const norm=s=>s.toLowerCase().replace(/ё/g,'е');
export function excluded(recipe,p){if(recipe.unknown.length)return 'Не сопоставлены ингредиенты';if(recipe.minutes>p.time)return 'Время приготовления';if(recipe.equipment.some(eq=>!p.equipment.includes(eq))||!recipe.equipment.length&&!p.noCook)return 'Техника';if(p.diet==='Растительное'&&recipe.animal||p.diet==='Без мяса'&&recipe.meat)return 'Тип питания';if(recipe.allergens.some(a=>p.allergens.includes(a)))return 'Аллергены';const text=norm(recipe.ingredients.map(i=>i.query+' '+i.name).join(' '));if(p.exclusions.some(x=>norm(x).split(/\s+/).filter(w=>w.length>2).some(w=>text.includes(w.slice(0,Math.max(3,w.length-2))))))return 'Исключённые продукты';return null}
export function selectCandidates(recipes,p){const wanted=new Set(slots(p.meals)),eligible=recipes.filter(r=>allowedSlots(r).some(kind=>wanted.has(kind))&&!excluded(r,p));return{eligible,candidates:eligible,all:recipes.length}}
export function neededSpecs(recipes,p){const out=new Map();for(const r of recipes)for(const i of r.ingredients)if(!atHome(i,p)){out.set(i.key,{...i,g:i.unitGrams,match:i.matchSource?new RegExp(i.matchSource,'i'):null})}return [...out.values()]}
export function priceRecipes(recipes,products,p){return recipes.filter(r=>r.ingredients.every(i=>atHome(i,p)||products.has(i.key))).map(r=>({...r,costPerPortion:r.ingredients.reduce((sum,i)=>{const item=atHome(i,p)?null:products.get(i.key);return sum+(item?i.grams/r.servings/item.size*item.price:0)},0)}))}
export function basket(plan,products,p){const needs=new Map();for(const r of plan.flat())for(const i of r.ingredients){if(atHome(i,p))continue;needs.set(i.key,(needs.get(i.key)||0)+i.grams/r.servings*portionFactor(p))}const byProduct=new Map();for(const [key,grams] of needs){const found=products.get(key);if(!found)throw Error('Не найдена цена '+key);const options=(found.alternatives||[found]).map(row=>{const quantity=Math.max(row.min,Math.ceil((grams/row.size-1e-9)/row.step)*row.step);return{...row,grams,quantity,total:Math.round(quantity*row.price*100)/100,available:quantity<=row.stock}}).sort((a,b)=>Number(b.available)-Number(a.available)||a.total-b.total||(a.quantity*a.size-a.grams)-(b.quantity*b.size-b.grams));const selected=options[0],existing=byProduct.get(selected.id);if(existing)existing.grams+=grams;else byProduct.set(selected.id,{...selected})}const items=[...byProduct.values()].map(row=>{const quantity=Math.max(row.min,Math.ceil((row.grams/row.size-1e-9)/row.step)*row.step);return{...row,quantity,total:Math.round(quantity*row.price*100)/100,available:quantity<=row.stock}});return{items,total:Math.round(items.reduce((sum,i)=>sum+i.total,0)*100)/100,available:items.every(i=>i.available)}}
export function diversity(plan){
 const counts=new Map(),families=new Map(),breakfastFormats=new Map();let sameDay=0;
 for(const day of plan){const daily=[];for(const r of day){if(r.kind==='breakfast'){const format=breakfastFormat(r);breakfastFormats.set(format,(breakfastFormats.get(format)||0)+1)}const key=dishKey(r);counts.set(key,(counts.get(key)||0)+1);if(r.kind==='main'){families.set(r.family,(families.get(r.family)||0)+1);daily.push(r.family)}}sameDay+=daily.length-new Set(daily).size}
 return{breakfastExcess:[...breakfastFormats.values()].reduce((s,n)=>s+Math.max(0,n-2),0),unique:counts.size,families:families.size,pasta:families.get('pasta')||0,repeats:[...counts.values()].reduce((s,n)=>s+Math.max(0,n-1),0),excess:[...families].reduce((s,[f,n])=>s+Math.max(0,n-(f==='pasta'?2:3)),0),sameDay};
}
export function buildWeek(recipes,products,p,{onProgress,history=[],seed='fixed',now=Date.now()}={}){
 recipes=recipes.map(r=>({...r,dishKey:dishKey(r)}));
 const weights=historyWeights(history,p.weekStart||localDate(new Date(now)),now);
 const randomFor=key=>{let hash=2166136261;for(const c of String(seed)+'|'+key){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)}return(hash>>>0)/4294967296};
 const recipeNoise=new Map(recipes.map(r=>[r.id,randomFor(r.dishKey)]));
 const recentPenalty=plan=>plan.flat().reduce((s,r)=>s+(weights.has(r.dishKey)?100000:0)+(weights.get(r.dishKey)||0)*3000,0);
 const variation=plan=>plan.flat().reduce((s,r,i)=>s+recipeNoise.get(r.id)*20+randomFor(r.dishKey+'|'+i)*10,0);

 const shape=slots(p.meals),kinds=[...new Set(shape)],poolByKind=new Map(kinds.map(kind=>[kind,recipes.filter(r=>allowedSlots(r).includes(kind))]));
 const requirement=new Map(kinds.map(kind=>[kind,shape.filter(k=>k===kind).length*7]));
 for(const kind of kinds){const count=new Set(poolByKind.get(kind).map(dishKey)).size;if(count<requirement.get(kind))throw Error(`Для меню без повторов не хватает разных блюд: ${kind==='breakfast'?'завтраки':kind==='snack'?'перекусы':'основные блюда'} — доступно ${count}, нужно ${requirement.get(kind)}. Попробуйте увеличить время или выбрать другую технику.`)}
 let freshCandidate=null;
 if(weights.size){const fresh=recipes.filter(r=>!weights.has(r.dishKey));const enough=kinds.every(kind=>new Set(fresh.filter(r=>allowedSlots(r).includes(kind)).map(dishKey)).size>=requirement.get(kind));if(enough){try{const freshWeek=buildWeek(fresh,products,p,{seed,now,onProgress});if(freshWeek.budgetMet)return{...freshWeek,novelty:noveltyFor(freshWeek.plan,history,weights)};freshCandidate=repairNovelBudget(freshWeek.plan,poolByKind,shape,products,p,weights);}catch{/* The regular constrained search below remains available. */}}}
 const kindKeys=new Map(kinds.map(kind=>[kind,new Set(poolByKind.get(kind).map(r=>r.dishKey))]));
 const tasks=Array.from({length:7},(_,day)=>shape.map((kind,slot)=>({day,slot,kind,index:day*shape.length+slot}))).flat().sort((a,b)=>poolByKind.get(a.kind).length/requirement.get(a.kind)-poolByKind.get(b.kind).length/requirement.get(b.kind)||a.index-b.index);
 const toPlan=assigned=>Array.from({length:7},(_,day)=>assigned.slice(day*shape.length,(day+1)*shape.length).filter(Boolean));
 const richness=plan=>plan.flat().reduce((sum,r)=>sum+Math.min(10,new Set(r.ingredients.filter(i=>!i.pantry).map(i=>i.key)).size),0);
 let beam=[{assigned:Array(shape.length*7).fill(null),used:new Set(),cart:{items:[],total:0,available:true}}];
 // Constrained slots are assigned first. No state may reuse a dish identity.
 for(let index=0;index<tasks.length;index++){
  const task=tasks[index],bestBySet=new Map();let lowestOverBudget=Infinity;
  for(const state of beam)for(const recipe of poolByKind.get(task.kind)){
   const key=dishKey(recipe);if(state.used.has(key))continue;
   const assigned=state.assigned.slice();assigned[task.index]={...recipe,kind:task.kind};const used=new Set(state.used);used.add(key);
   const plan=toPlan(assigned),d=diversity(plan);if(d.pasta>2)continue;
   const remaining=tasks.slice(index+1);let enough=true;
   for(const kind of kinds){const needed=remaining.filter(t=>t.kind===kind).length;if(needed){let available=kindKeys.get(kind).size;for(const usedKey of used)if(kindKeys.get(kind).has(usedKey))available--;if(available<needed){enough=false;break}}}
   if(!enough)continue;
   const cart=basket(plan,products,p);if(!cart.available)continue;if(cart.total>p.budget)lowestOverBudget=Math.min(lowestOverBudget,cart.total);
   const costRank=cart.total+Math.max(0,cart.total-p.budget)*1000+d.excess*80+d.sameDay*40+d.breakfastExcess*160-d.families*25-richness(plan)*.5;
   const rank=costRank+recentPenalty(plan)*.06-variation(plan);
   const signature=[...used].sort().join('|');const previous=bestBySet.get(signature);
   if(!previous||rank<previous.rank)bestBySet.set(signature,{assigned,used,cart,rank,costRank});
  }
  const states=[...bestBySet.values()];const cheap=states.slice().sort((a,b)=>a.costRank-b.costRank).slice(0,12);const varied=states.sort((a,b)=>a.rank-b.rank).slice(0,36);beam=[...new Set([...cheap,...varied])];
  onProgress?.({done:index+1,total:tasks.length,bestCost:beam[0]?.cart.total,lowestOverBudget:Number.isFinite(lowestOverBudget)?lowestOverBudget:null});
  if(!beam.length)throw Error('Не удалось собрать полную неделю без повторов в этом бюджете и с подтверждённым наличием. Измените бюджет, время или доступную технику.');
 }
 const quality=(plan,total)=>{const d=diversity(plan);return d.families*600-d.excess*2500-d.sameDay*2500-d.breakfastExcess*1800+richness(plan)*25+total/p.budget*5000-recentPenalty(plan)+variation(plan)};
 if(freshCandidate?.cart.available)beam.push({assigned:freshCandidate.plan.flat(),cart:freshCandidate.cart});
 const feasible=beam.filter(state=>state.cart.total<=p.budget),options=feasible.length?feasible:beam;
 let selected=options.reduce((best,state)=>feasible.length?(quality(toPlan(state.assigned),state.cart.total)>quality(toPlan(best.assigned),best.cart.total)?state:best):(state.cart.total<best.cart.total?state:best),options[0]);
 let plan=toPlan(selected.assigned),cart=selected.cart;
 // Use the remaining budget for richer dishes; never grow portions or add
 // duplicates. Every alternative still uses an actual source recipe.
 for(let turn=0;turn<28;turn++){
  const used=new Set(plan.flat().map(dishKey));const overBudget=cart.total>p.budget;let best=overBudget?-cart.total*10000+quality(plan,cart.total):quality(plan,cart.total),next=null,nextCart=null;
  for(let day=0;day<7;day++)for(let slot=0;slot<shape.length;slot++){
   const old=plan[day][slot],oldKey=dishKey(old);
   for(const r of poolByKind.get(shape[slot])){
    const key=dishKey(r);if(used.has(key)&&key!==oldKey||r.id===old.id)continue;
    plan[day][slot]={...r,kind:shape[slot]};const d=diversity(plan);
    if(d.repeats===0&&d.pasta<=2){const c=basket(plan,products,p);if(c.available&&(overBudget?c.total<cart.total:c.total<=p.budget)){const score=overBudget?-c.total*10000+quality(plan,c.total):quality(plan,c.total);if(score>best+.001){best=score;next=plan.map(d=>d.slice());nextCart=c}}}
    plan[day][slot]=old;
   }
  }
  if(!next)break;plan=next;cart=nextCart;
 }
 const d=diversity(plan);if(d.repeats||plan.flat().length!==shape.length*7)throw Error('Меню не прошло проверку отсутствия повторов.');
 return{plan,cart,diversity:d,budgetMet:cart.total<=p.budget,novelty:noveltyFor(plan,history,weights)};
}
function noveltyFor(plan,history,weights){const keys=plan.flat().map(dishKey),recentRepeats=keys.filter(key=>weights.has(key)).length,last=history.slice().sort((a,b)=>b.createdAt-a.createdAt)[0];return{newDishes:keys.length-recentRepeats,recentRepeats,previousOverlap:last?keys.filter(key=>last.keys.includes(key)).length:0,historyMenus:history.length,warning:history.length&&recentRepeats?'В этой подборке '+recentRepeats+' блюд уже встречались в недавних подборках. Не удалось заменить их все с текущим бюджетом, наличием и ограничениями. Попробуйте расширить время или доступную технику.':null};}
function repairNovelBudget(input,pools,shape,products,p,weights){let plan=input.map(d=>d.slice()),cart=basket(plan,products,p);for(let turn=0;turn<50&&cart.total>p.budget;turn++){const used=new Set(plan.flat().map(dishKey));let best=-Infinity,next=null,nextCart=null;for(let day=0;day<7;day++)for(let slot=0;slot<shape.length;slot++){const old=plan[day][slot],oldKey=dishKey(old);for(const r of pools.get(shape[slot])){const key=dishKey(r);if(r.id===old.id||used.has(key)&&key!==oldKey)continue;plan[day][slot]={...r,kind:shape[slot]};const d=diversity(plan);if(!d.repeats&&d.pasta<=2){const c=basket(plan,products,p),saving=cart.total-c.total,added=Number(weights.has(key))-Number(weights.has(oldKey));if(c.available&&(saving>.001||Math.abs(saving)<.001&&added>0)){const score=saving>.001?saving/(1+Math.max(0,added)*1.5)+(added<0?1000:0):.0001*(1+Math.max(0,old.costPerPortion-r.costPerPortion));if(score>best){best=score;next=plan.map(d=>d.slice());nextCart=c}}}plan[day][slot]=old;}}if(!next)break;plan=next;cart=nextCart;}return{plan,cart};}
