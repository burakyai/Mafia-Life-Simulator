// Oyunun tek dosyasını (../index.html) uygulama klasörüne (www/) kopyalar.
// Google Fonts bağlantısını uygulamanın içine gömülü yazı tipleriyle değiştirir; böylece oyun internetsiz de aynı görünür.
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('..'),www=path.resolve('www'),fdir=path.join(www,'fonts');
fs.rmSync(www,{recursive:true,force:true});fs.mkdirSync(fdir,{recursive:true});
const want={'playfair-display':[700,900],'cinzel':[600,700,900],'barlow':[400,500,600,700],'barlow-condensed':[500,600,700]};
let css='';
for(const [pkg,ws] of Object.entries(want)){const base=path.resolve('node_modules/@fontsource',pkg);
  for(const w of ws){const src=fs.readFileSync(path.join(base,`${w}.css`),'utf8');
    for(const block of src.split('@font-face').slice(1)){const m=block.match(/url\(\.\/files\/([^)]+?\.woff2)\)/);if(!m)continue;const f=m[1];
      if(!/-latin(-ext)?-\d+-normal\.woff2$/.test(f))continue;
      fs.copyFileSync(path.join(base,'files',f),path.join(fdir,f));
      css+='@font-face'+block.replace(/src:[^;]+;/,`src: url(fonts/${f}) format('woff2');`).replace(/\/\*[^*]*\*\/\s*$/,'')+'\n';}}}
fs.writeFileSync(path.join(www,'fonts.css'),css);
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/,'')
  .replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/,'')
  .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/,'<link rel="stylesheet" href="fonts.css">')
  .replace(/<link rel="manifest" href="manifest\.json">\s*/,'');
if(html.includes('fonts.googleapis.com'))throw new Error('Google Fonts bağlantısı değiştirilemedi');
fs.writeFileSync(path.join(www,'index.html'),html);
if(fs.existsSync(path.join(root,'img')))fs.cpSync(path.join(root,'img'),path.join(www,'img'),{recursive:true});
console.log('www hazır:',(fs.existsSync(path.join(www,'img'))?fs.readdirSync(path.join(www,'img')).length:0)+' görsel,',(fs.statSync(path.join(www,'index.html')).size/1048576).toFixed(2),'MB +',fs.readdirSync(fdir).length,'yazı tipi dosyası');
