// Identity is about a dish, not a source record ID or a display translation.
const sameDishes=[
 [/shaksh|chakchouka|yemeni lahsa/i,'shakshuka'],
 [/fett?ucc?ine.*alfredo/i,'fettuccine-alfredo'],
 [/\bbigos\b/i,'bigos'],
 [/borsch|borscht|bortsch/i,'borscht'],
 [/tourti[eè]re/i,'tourtiere'],
 [/chivito/i,'chivito'],
 [/tom yum/i,'tom-yum'],
 [/spanish tortilla|spiced tortilla/i,'spanish-tortilla'],
 [/^(full )?english breakfast$/i,'english-breakfast'],
 [/^salt.*pepper squid|^quick salt.*pepper squid/i,'salt-pepper-squid'],
];
export function dishKey(recipe){const title=recipe.title||'';return sameDishes.find(([pattern])=>pattern.test(title))?.[1]||recipe.dishKey||(title?title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim():recipe.id);}
export function isComponent(title,category){
 const t=title.toLowerCase();
 if(/\b(?:bread|flatbreads?|baguette|naan|pita)\b/.test(t)&&!/omelette|omelet|pudding|sandwich/.test(t))return true;
 if(/^(?:hummus|baba ghanoush|ajo blanco dip|arepa|faina|fainá|migas)$/.test(t))return true;
 if(/pickle|\bslaw\b|\bdressing\b/.test(t))return true;
 if(/(?:sauce|dip|salsa|jam|oil)(?: recipe)?$/.test(t)&&! /\b(?:with|in)\b/.test(t))return true;
 return category==='Side'&&!/\bsoup\b/.test(t);
}
export function missingMainIngredient(title,ingredients){
 const t=title.toLowerCase();
 const checks=[
  [/\bgoat\b/,['goat'],'козлятина'],
  [/\blamb\b|\bmutton\b/,['lamb','mincedlamb'],'баранина'],
  [/\bbeef\b/,['beef','mincedbeef'],'говядина'],
  [/\bpork\b/,['pork','mincedpork','porkknuckle','porkribs'],'свинина'],
  [/\bchicken\b|\bpoulet\b|\bpollo\b|\bayam\b/,['wholechicken','chicken','chickenthigh','chickendrumstick','chickenleg','chickenwing','chickenliver'],'курица'],
  [/\bturkey\b/,['turkey','mincedturkey','turkeyham'],'индейка'],
 ];
 if(/goat(?:s|['’]s)?\s+cheese/.test(t))return null;
 for(const [pattern,keys,label] of checks)if(pattern.test(t)&&!ingredients.some(i=>keys.includes(i.key)))return label;
 return null;
}
export function allowedSlots(recipe){
 if(recipe.kind==='side'||recipe.kind==='component')return [];
 if(recipe.kind==='breakfast')return ['breakfast'];
 if(recipe.kind==='snack')return ['snack'];
 // Savoury omelettes and substantial legume dishes can serve at breakfast too.
 if(/tortilla|tortang talong|falafel|ful medames|frittata/i.test(recipe.title))return ['breakfast','main'];
 return ['main'];
}
