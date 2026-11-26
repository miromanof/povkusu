// A product must actually BE the ingredient. A mention in a filling/flavour
// (pecan roll, maple cookie, noodles in broth) is not a valid replacement.
export function productFormMatches(item,spec){
 if(!spec)return false;const n=item.name.toLowerCase().trim(),key=spec.key;
 if(/stockcube$/.test(key))return /^бульон|^кубик/.test(n)&&/кубик/.test(n);
 if(/stock$/.test(key)||key==='stock')return /^бульон(?:\s|$)/.test(n)&&!/концентрат|кубик|порош|сух[ао]|приправа/.test(n);
 if(['pecan','almond','walnut','cashew','peanut'].includes(key)&&! /^(?:орех|ядр|пекан|миндаль|кешью|арахис)/.test(n))return false;
 if(/syrup$/.test(key)&&!/^сироп(?:\s|$)/.test(n))return false;
 if(/juice$/.test(key)&&!/^сок(?:\s|$)/.test(n))return false;
 if(/flour$/.test(key)||key==='flour'){if(!/^мука(?:\s|$)/.test(n))return false;}
 if(['rice','brownrice','glutinousrice'].includes(key)&&!/^рис(?:\s|$)/.test(n))return false;
 if(['noodle','ricenoodle','eggnoodle'].includes(key)&&(!/^лапша(?:\s|$)/.test(n)||/быстр|бульон|суп|соус/.test(n)))return false;
 if(key==='pasta'&&(!/^(?:макарон|спагетт|пенне|паста(?:\s|$)|фет[ту]уч)/.test(n)||/томат|паштет|рыбн|суп|соус/.test(n)))return false;
 if(/cheese$/.test(key)||['cheese','feta','ricotta','parmesan','cheddar','mozzarella','gruyere','gouda','emmental','swiss'].includes(key)){if(!/^(?:сыр(?:\s|$)|фета(?:\s|$)|рикотта|моцарелла|пармезан)/.test(n))return false;}
 if(['milk','sourmilk','buttermilk'].includes(key)&&/кокос|миндал|соев|каша|шоколад/.test(n))return false;
 if(['soysauce','fishsauce','oystersauce','tomatosauce','worcester'].includes(key)&&!/^соус(?:\s|$)/.test(n))return false;
 if(key==='pepper'&&/чили|молот|суш|порош/.test(n))return false;
 if(key==='chili'&&/молот|суш|порош|хлопья|соус/.test(n))return false;
 if(['garlic','onion','carrot','potato','tomato','chili','pepper','mushroom','broccoli','zucchini','eggplant'].includes(key)&&/суп|салат|соус|пюре|фаршир|маринов|приправ|суш[её]н|порош|молот/.test(n))return false;
 if(['parsley','dill','cilantro','basil','mint','thyme','rosemary'].includes(key)&&/суш[её]н|порош|молот|приправа|суп|соус/.test(n))return false;
 return true;
}
