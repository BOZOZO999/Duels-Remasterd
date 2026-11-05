const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const WebSocket=require('ws');
const PORT=Number(process.env.PORT)||3000;
const html=fs.readFileSync(path.join(__dirname,'index.html'));
const server=http.createServer((req,res)=>{if(req.url==='/'||req.url==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html)}else{res.writeHead(404);res.end('Not found')}});
const wss=new WebSocket.Server({server,path:'/ws',maxPayload:150000});
const rooms=new Map();
const send=(ws,msg)=>{if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(msg))};
function leave(ws){const room=rooms.get(ws.code);if(!room)return;const other=room.host===ws?room.guest:room.host;if(other){other.code=null;send(other,{type:'peer_left'})}rooms.delete(ws.code);ws.code=null}
wss.on('connection',ws=>{ws.code=null;ws.role=null;ws.last=0;ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}if(!m||typeof m.type!=='string')return;if(m.type==='create'){leave(ws);let code;do{code=String(crypto.randomInt(100000,1000000))}while(rooms.has(code));rooms.set(code,{host:ws,guest:null});ws.code=code;ws.role='host';send(ws,{type:'created',code});return}if(m.type==='join'){leave(ws);const code=String(m.code||'');const room=rooms.get(code);if(!room||room.guest||room.host.readyState!==WebSocket.OPEN){send(ws,{type:'error',message:'Party not found or already full.'});return}room.guest=ws;ws.code=code;ws.role='guest';send(ws,{type:'joined',code});send(room.host,{type:'peer_joined'});return}const room=rooms.get(ws.code);if(!room)return;const other=room.host===ws?room.guest:room.host;if(m.type==='class'&&ws.role==='guest'){const allowed=['Melee','Archer','Necromancer','Stormcaller','Pyromancer','Guardian','Frost Mage','Engineer','Chronomancer'];if(allowed.includes(m.className))send(other,{type:'class',className:m.className})}else if(m.type==='start'&&ws.role==='host'&&room.guest){send(ws,{type:'start'});send(room.guest,{type:'start'})}else if(m.type==='input'&&ws.role==='guest'){const keys={};for(const k of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Shift','z','x'])keys[k]=m.keys?.[k]===true;send(other,{type:'input',keys})}else if(m.type==='snapshot'&&ws.role==='host'){if(Date.now()-ws.last<20)return;ws.last=Date.now();send(other,m)}else if(m.type==='result'&&ws.role==='host'){send(other,{type:'result',winner:m.winner==='host'?'host':'guest'})}});ws.on('close',()=>leave(ws));ws.on('error',()=>{})});
server.listen(PORT,'0.0.0.0',()=>console.log('Duels online server listening on '+PORT));
