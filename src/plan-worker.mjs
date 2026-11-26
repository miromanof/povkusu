import {buildWeek} from './planner.mjs?v=history-1';
self.onmessage=event=>{const {recipes,products,profile,history,seed}=event.data;try{const result=buildWeek(recipes,new Map(products),profile,{history,seed,onProgress:progress=>self.postMessage({progress})});self.postMessage({result});}catch(error){self.postMessage({error:error.message});}};
