import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {ingredient,amount,normalizeMeal,productMatches} from '../src/ingredients.mjs';
import {selectCandidates,buildWeek,diversity} from '../src/planner.mjs';
const all=JSON.parse(gunzipSync(fs.readFileSync(new URL('../recipe-pool.json.gz',import.meta.url)))).recipes;
const p={adults:2,kids:[],meals:3,diet:'Обычное',allergens:[],exclusions:[],equipment:['Плита','Духовка','Блендер'],noCook:true,time:120,budget:5000,pantry:true,homeKeys:[]};
test('goat cannot become oats, and derivative ingredients keep their identity',()=>{
 for(const [name,key] of [['Goat Meat','goat'],['Goat','goat'],['Oats','oats'],['Chicken Stock','chickenstock'],['Beef Stock','beefstock'],['Rice Noodles','ricenoodle'],['Corn Flour','cornflour'],['Potato Starch','potatostarch'],['Goats Cheese','goatcheese']])assert.equal(ingredient(name)?.key,key,name);
 assert.equal(ingredient('Unrecognised oat-flavoured goat sauce'),null);
});
test('stored goat recipe requires actual goat and cannot be priced using oats',()=>{
 const goat=all.find(r=>r.id==='52968');assert.ok(goat.ingredients.some(i=>i.key==='goat'));assert.ok(!goat.ingredients.some(i=>i.key==='oats'));
 const corrupt=normalizeMeal({idMeal:'bad',strMeal:'Roasted Goat',strCategory:'Goat',strIngredient1:'Oats',strMeasure1:'500g',strInstructions:'Cook in a pan.'});
 assert.ok(corrupt.unknown.length,'Named main ingredient must not be missing');
});
test('liquid volume does not become the same mass of dry bouillon cubes',()=>{
 assert.equal(amount('1',ingredient('Chicken Stock Cube')),10);
 const r=normalizeMeal({idMeal:'bad-cube',strMeal:'Vegetable Casserole',strCategory:'Vegetarian',strIngredient1:'Vegetable Stock Cube',strMeasure1:'250ml',strInstructions:'Cook in a pan.'});assert.ok(r.unknown.length);
});
test('bread and sauces are components, not independent main meals',()=>{
 const selected=selectCandidates(all,p).candidates;
 for(const id of ['53089','53417','53226','53086'])assert.ok(!selected.some(r=>r.id===id),id);
 assert.equal(all.find(r=>r.id==='53076').kind,'breakfast','An actual omelette with bread stays a dish');
});
test('different IDs and names of shakshuka count as the same dish',()=>{
 assert.equal(diversity([[all.find(r=>r.id==='53215')],[all.find(r=>r.id==='52963')]]).repeats,1);
});
test('a matching word inside another product does not make it the ingredient',()=>{
 for(const [source,name] of [['Pecan Nuts','Рулет сдобный Пекан-кленовый сироп, 300г'],['Maple Syrup','Печенье с кленовым сиропом'],['Chicken Stock','Лапша ДОШИРАК с куриным бульоном'],['Beef Stock','Суп Фо Бо с говяжьим бульоном'],['Goat Meat','Хинкали с козлятиной']])assert.equal(productMatches({name},ingredient(source)),false,name);
 assert.equal(productMatches({name:'Орех пекан очищенный, 150г'},ingredient('Pecan Nuts')),true);
 assert.equal(productMatches({name:'Сироп кленовый, 250мл'},ingredient('Maple Syrup')),true);
 assert.equal(productMatches({name:'Бульон куриный концентрат, 1кг'},ingredient('Chicken Stock')),false);
 assert.equal(productMatches({name:'Бульон быстрозамороженный Куриный, 1кг'},ingredient('Chicken Stock')),true);
});
const item={id:1,name:'Рис',price:100,size:1000,stock:100,min:1,step:1,package:'1 кг'};
const base={title:'Fixture',family:'rice',ingredients:[{key:'rice',grams:120,query:'рис',name:'Rice'}],unknown:[],minutes:20,equipment:['Плита'],allergens:[],servings:1,costPerPortion:12};
test('every weekly slot has a unique dish',()=>{
 const recipes=Array.from({length:25},(_,i)=>({...base,id:'fixture'+i,title:'Fixture '+i,kind:i<9?'breakfast':'main',family:'family'+i%6}));
 const r=buildWeek(recipes,new Map([['rice',item]]),p);assert.equal(r.plan.flat().length,21);assert.equal(new Set(r.plan.flat().map(r=>r.id)).size,21);assert.equal(r.diversity.repeats,0);assert.ok(r.cart.total<=p.budget);
});
test('lack of unique alternatives is explicit instead of silently repeating food',()=>{
 assert.throws(()=>buildWeek([{...base,id:'a',kind:'breakfast'},{...base,id:'b',kind:'main'}],new Map([['rice',item]]),p),/без повторов|разных блюд/);
});
test('an unaffordable week is marked, not claimed to fit the entered budget',()=>{
 const recipes=Array.from({length:25},(_,i)=>({...base,id:'fixture'+i,title:'Fixture '+i,kind:i<9?'breakfast':'main',family:'family'+i%6}));
 const r=buildWeek(recipes,new Map([['rice',item]]),{...p,budget:1});assert.equal(r.budgetMet,false);assert.ok(r.cart.total>1);assert.equal(r.diversity.repeats,0);
});
