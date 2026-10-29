// npm install --no-save sharp, then node tools/build-readme-art.cjs
// Text stays in these SVG sources; PNG exports preserve the display typography.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const out = path.resolve(__dirname, '../docs/assets/readme');
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const face = "'DIN Alternate', 'Arial Narrow', Arial, sans-serif";
const text = (x,y,size,value,fill,font=face,weight=400,extra='') => `<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}" ${extra}>${esc(value)}</text>`;
const svg = (w,h,label,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${body}</svg>`;
async function save(name,source) {
  await fs.writeFile(path.join(out,name+'.svg'),source);
  await sharp(Buffer.from(source)).png().toFile(path.join(out,name+'.png'));
}
async function main() {
  await fs.mkdir(out,{recursive:true});
  const pineScripts = (await fs.readdir(path.resolve(__dirname,'..'))).filter(n=>n.endsWith('.pine')).length;
  const navy='#101f2a', white='#f1f4ee', muted='#b7c8ca', teal='#72ddbd';
  let h=`<rect width="1440" height="500" rx="20" fill="${navy}"/><path d="M64 61H1376" stroke="#33454e"/><path d="M64 61H188" stroke="${teal}" stroke-width="4"/>`;
  h+=text(64,40,20,'J / R',white,face,700);
  h+=text(1376,40,16,'TRADING RESEARCH  /  TRADINGVIEW',muted,'Arial, sans-serif',400,'text-anchor="end" letter-spacing="2"');
  h+=text(64,121,20,'INDICATORS + RESEARCH',teal,'Arial, sans-serif',700,'letter-spacing="4"');
  h+=text(60,223,88,'Breakout & GCR',white,face,700);
  h+=text(64,286,36,'Pine indicators. Traceable research.',white);
  h+=text(64,334,25,'Chart signals, export tools and practical usage notes.',muted,'Arial, sans-serif');
  h+=text(64,371,25,'A separate Python model with its own research limits.',muted,'Arial, sans-serif');
  h+='<path d="M64 413H1376" stroke="#33454e"/>';
  h+=text(64,458,22,pineScripts+' PINE SCRIPTS',teal,face,700);
  h+=text(315,458,21,'2 SIGNAL INDICATORS',white);
  h+=text(1376,458,20,'1 SEPARATE PYTHON RESEARCH MODEL',muted,face,400,'text-anchor="end" letter-spacing="1"');
  h+='<g transform="translate(1075 139)"><rect width="301" height="221" rx="12" fill="#172d37" stroke="#3e5c64"/><path d="M38 116H263" stroke="#50777b" stroke-width="2"/>';
  for (const [i,label] of ['SOURCE','USAGE','EVIDENCE'].entries()) {
    const x=46+i*105;
    h+=`<circle cx="${x}" cy="116" r="${i===1?25:16}" fill="${i===1?teal:navy}" stroke="${teal}" stroke-width="2"/>`;
    if(i===1) h+='<path d="M141 116l7 7 13-15" stroke="#101f2a" stroke-width="3" fill="none"/>';
    h+=text(x,176,14,label,muted,'Arial, sans-serif',400,'text-anchor="middle" letter-spacing="1"');
  }
  h+=text(25,38,15,'TRACEABLE DOCUMENTATION',teal,'Arial, sans-serif',400,'letter-spacing="1"')+'</g>';
  const label='Breakout and GCR for TradingView. '+pineScripts+' Pine scripts: two signal indicators and one chart-data exporter. Includes a separate Python displacement-wick research model.';
  await save('header',svg(1440,500,label,h));
  let m=`<rect width="700" height="690" rx="20" fill="${navy}"/><path d="M40 67H660" stroke="#33454e"/><path d="M40 67H160" stroke="${teal}" stroke-width="4"/>`;
  m+=text(40,43,22,'J / R',white,face,700);
  m+=text(660,43,18,'TRADING RESEARCH',muted,face,400,'text-anchor="end" letter-spacing="1"');
  m+=text(40,125,23,'INDICATORS + RESEARCH',teal,'Arial, sans-serif',700,'letter-spacing="2"');
  m+=text(37,225,86,'Breakout &',white,face,700);
  m+=text(37,320,86,'GCR',white,face,700);
  m+=text(40,389,34,'Pine indicators.',white);
  m+=text(40,435,34,'Traceable research.',white);
  m+=text(40,500,26,'Chart signals, export tools and usage notes.',muted,'Arial, sans-serif');
  m+=text(40,540,26,'Python research with explicit validation limits.',muted,'Arial, sans-serif');
  m+='<path d="M40 586H660" stroke="#33454e"/>';
  m+=text(40,638,27,pineScripts+' PINE SCRIPTS',teal,face,700);
  m+=text(660,638,26,'1 RESEARCH MODEL',white,face,400,'text-anchor="end"');
  await save('header-mobile',svg(700,690,label,m));
  const cards=[
    ['breakout','01','BREAKOUT SIGNALS','Breakout indicator',['Lookback highs, volume and trend','with chart visuals and an alert.'],'PINE V5  /  ANTI-REPEAT FILTER'],
    ['gcr','02','CONTRARIAN SIGNALS','GCR indicator',['Momentum, volume, trend and','divergence conditions in one score.'],'PINE V5  /  SIGNAL + SCORE'],
    ['exporter','03','PINE LOGS','Chart data exporter',['Write chart OHLCV rows to Pine Logs','for local CSV research.'],'PINE V6  /  CHART-BAR EXPORT'],
    ['python','04','SEPARATE RESEARCH MODEL','Displacement-wick model',['Parameter search in a separate','Python displacement-wick model.'],'PYTHON  /  MODEL-SPECIFIC LIMITS'],
    ['workflow','05','LOCAL DATA WORKFLOW','CSV research workflow',['Export requirements, local inputs','and isolated optimizer outputs.'],'DATA QUALITY  /  RUN SETUP'],
    ['snapshots','06','HISTORICAL EVIDENCE','Historical snapshots',['One retained data/result set from','the separate Python research model.'],'UNVERIFIED MODEL OUTPUTS']
  ];
  for (const theme of ['light','dark']) {
    const c=theme==='light'?{bg:'#f4f6f3',border:'#d7e0db',ink:'#142c35',sub:'#405962',accent:'#087c63',rule:'#d5dfd9'}:{bg:'#122630',border:'#334a55',ink:'#f0f4ee',sub:'#b4c6cb',accent:'#72ddbd',rule:'#334a55'};
    for(const [name,num,category,title,lines,stack] of cards) {
      let b=`<rect x="1" y="1" width="698" height="318" rx="12" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>`;
      b+=text(34,47,18,category,c.accent,'Arial, sans-serif',700,'letter-spacing="2"');
      b+=text(666,47,21,num,c.sub,face,400,'text-anchor="end"');
      b+=text(34,112,40,title,c.ink,face,700);
      b+=text(34,166,25,lines[0],c.sub,'Arial, sans-serif');
      b+=text(34,203,25,lines[1],c.sub,'Arial, sans-serif');
      b+=`<path d="M34 244H666" stroke="${c.rule}"/>`;
      b+=text(34,286,18,stack,c.sub,face,400,'letter-spacing="1"');
      b+=text(664,287,30,'↗',c.accent,'Arial, sans-serif',400,'text-anchor="end"');
      await save(name+'-'+theme,svg(700,320,title+'. '+lines.join(' ')+' '+stack,b));
    }
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
