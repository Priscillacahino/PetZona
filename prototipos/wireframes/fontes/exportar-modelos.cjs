const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(__dirname,'modelo.js'),'utf8');
const data=vm.runInNewContext(source+`;JSON.stringify({colors:PZ.C,icons:Object.fromEntries(['paw','home','search','cart','arrow','chevron','check','heart','bag','calendar','clock','pin','dog','cat','bird','spa','taxi','bath','medical','walk','person','water','plus','minus','star','info','card'].map(k=>[k,PZ.svg(k)])),screens:PZ.frameSpecs.map(spec=>({name:spec[1],service:spec[2]||'bath',screen:PZ.screen(PZ.frameState(spec))}))})`);
fs.writeFileSync(path.join(root,'fontes','telas.json'),data);
console.log('18 cenários exportados.');
