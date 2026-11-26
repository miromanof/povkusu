import {buildWeek} from './planner.mjs?v=quality-1';
self.onmessage=event=>{const {recipes,products,profile}=event.data;try{const result=buildWeek(recipes,new Map(products),profile,{onProgress:progress=>self.postMessage({progress})});self.postMessage({result});}catch(error){self.postMessage({error:error.message});}};
