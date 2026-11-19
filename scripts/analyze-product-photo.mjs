/** Measure source-photo whitespace. This reads pixels and writes framing metadata;
 * original manufacturer images are neither modified nor re-hosted.
 * Usage: node scripts/analyze-product-photo.mjs <slug> <downloaded-image> <source-url> [angle-degrees]
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

export async function analyzePhoto(file, source, angle = 0) {
  const {data,info}=await sharp(file).rotate().ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const pixel=(x,y)=>[...data.subarray((y*info.width+x)*4,(y*info.width+x)*4+4)];
  const corners=[pixel(0,0),pixel(info.width-1,0),pixel(0,info.height-1),pixel(info.width-1,info.height-1)];
  const transparent=corners.every(p=>p[3]<10);
  const background=[0,1,2].map(c=>Math.round(corners.reduce((n,p)=>n+p[c],0)/4));
  const neutral=Math.max(...background)-Math.min(...background)<10;
  const consistent=corners.every(p=>p.slice(0,3).every((v,c)=>Math.abs(v-background[c])<12));
  const studio=transparent||(neutral&&consistent&&Math.min(...background)>220);
  let left=info.width,top=info.height,right=-1,bottom=-1;
  const radians=angle*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
  let minRX=Infinity,maxRX=-Infinity,minRY=Infinity,maxRY=-Infinity;
  const support=Array.from({length:4},()=>({x:0,y:0}));
  if(studio){
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
      const i=(y*info.width+x)*4;
      if(data[i+3]<24)continue;
      const distance=Math.max(...[0,1,2].map(c=>Math.abs(data[i+c]-background[c])));
      if(!transparent&&distance<18)continue;
      if(angle){
        const rx=x*c-y*s,ry=x*s+y*c;
        if(rx<minRX){minRX=rx;support[0]={x,y};}
        if(rx>maxRX){maxRX=rx;support[1]={x,y};}
        if(ry<minRY){minRY=ry;support[2]={x,y};}
        if(ry>maxRY){maxRY=ry;support[3]={x,y};}
      }
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
    }
  }
  if(right<left||bottom<top){left=0;top=0;right=info.width-1;bottom=info.height-1;}
  // Retain a small safety margin for antialiased outlines and light product edges.
  const safety=Math.max(2,Math.round(Math.max(info.width,info.height)*.008));
  left=Math.max(0,left-safety);top=Math.max(0,top-safety);
  right=Math.min(info.width-1,right+safety);bottom=Math.min(info.height-1,bottom+safety);
  const rx=(minRX+maxRX)/2,ry=(minRY+maxRY)/2;
  const rotation=studio&&angle&&Number.isFinite(rx)?{
    angle,centerX:rx*c+ry*s,centerY:-rx*s+ry*c,
    width:maxRX-minRX+2*safety,height:maxRY-minRY+2*safety,support,
  }:undefined;
  return {...(rotation?{rotation}:{}),source,width:info.width,height:info.height,mode:studio?'studio':'scene',
    crop:{left,top,width:right-left+1,height:bottom-top+1},
    brightness:studio&&!transparent?Number((255/Math.min(...background)).toFixed(4)):1};
}
if(process.argv[1]?.endsWith('analyze-product-photo.mjs')){
  const [slug,file,source,angle="0"]=process.argv.slice(2);
  if(!slug||!file||!source)throw new Error('Expected slug, image file, and original image URL');
  const target=new URL('../lib/product-framing.json',import.meta.url);
  let entries={};try{entries=JSON.parse(await readFile(target,'utf8'));}catch{}
  entries[slug]=await analyzePhoto(file,source,Number(angle));
  await writeFile(target,JSON.stringify(entries,null,2)+'\n');
}
