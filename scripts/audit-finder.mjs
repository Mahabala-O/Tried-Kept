/** Exhaustive coverage diagnostic, not an estimate of real visitor behavior. */
import { createServer } from 'vite';
const server = await createServer({configFile:false,server:{middlewareMode:true,ws:false},resolve:{alias:{'@':process.cwd()}}});
try {
  const {products}=await server.ssrLoadModule('/lib/catalog.ts');
  const {rankShoes}=await server.ssrLoadModule('/lib/finder.ts');
  const recommended=new Set(),byLine={};let combinations=0,empty=0;
  for(const line of ['mens','womens','any']){
    const models=new Set();byLine[line]={combinations:0,empty:0,models:[]};
    for(const surface of ['hard','clay','any'])for(const budget of [100,150,200,null])
      for(const fit of ['roomy','snug','wide','unsure'])for(const cushioning of ['heel','forefoot','unsure']){
        const matches=rankShoes({line,surface,budget,fit,cushioning});
        combinations++;byLine[line].combinations++;if(!matches.length){empty++;byLine[line].empty++;}
        for(const {product}of matches){recommended.add(product.slug);models.add(product.slug);}
      }
    byLine[line].models=[...models];
  }
  console.log(JSON.stringify({combinations,empty,everRecommended:[...recommended],
    neverRecommended:products.filter(p=>p.category==='shoe'&&!recommended.has(p.slug)).map(p=>p.slug),byLine},null,2));
} finally { await server.close(); }
