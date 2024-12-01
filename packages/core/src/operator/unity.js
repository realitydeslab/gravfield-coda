import { parseParameters, validateStream, withAttr } from '@coda/prelude';
import * as most from '@most/core';

////////////////////////////////////
//  Websocket opens constantly
////////////////////////////////////
const host = 'ws://localhost:9090';
var socket;

function CreateWebSocket()
{
  socket = new WebSocket(host);

  socket.onopen = ()=>{
    // eslint-disable-next-line no-console
    console.log('[unity] the websocket server starts at', host);
  }
  socket.onclose = () => {
    // eslint-disable-next-line no-console
    console.error('[unity] Error: lost connection with the websocket server');
  };
  socket.onerror = () => {
    // eslint-disable-next-line no-console
    console.error('[unity] Error: the websocket server is unavailable at', host);
    socket.close();
  };
  socket.onmessage = (json) => {
    OnReceiveSocketMessage(json);
  };
}

CreateWebSocket();


function CheckWsState()
{
  if(socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING){
    try{
      CreateWebSocket();
    }
    catch(e){}
  }
}

// Need a start Function

////////////////////////////////////
//  when receive osc message, alter performer data model
////////////////////////////////////
function OnReceiveSocketMessage(json)
{
  const m = JSON.parse(json.data);  
  performers[m.id].pos = m.pos;
}




////////////////////////////////////
//  Perform Data Model
////////////////////////////////////
var performers = {
  A:{
    pos:[0,0,0]
  },
  B:{
    pos:[0,0,0]
  },
  C:{
    pos:[0,0,0]
  }
}


////////////////////////////////////
//  Get performer value
////////////////////////////////////
function CheckPerformerId(id)
{
  if(typeof(id) === 'number')
    return id == 0 ? "A" : (id == 1 ? "B" : (id == 2 ? "C" : undefined));

  if(typeof(id) === 'string')
  {
    id = id.toUpperCase();
    if(id == "A" || id == "B"  || id == "C")
      return id
  }
  
  return undefined;
}

function replaceWithPerformerPos(id)
{
  return (value)=>{
    return [performers[id].pos[0], performers[id].pos[1], performers[id].pos[2]];
  };
}

export function performer(id, source) 
{
  CheckWsState();

  id = CheckPerformerId(id);
  if(id === undefined)
  {
    return source;
  }  

  const attr = {
    format:'vector',
    size: 3
  }

  const f = replaceWithPerformerPos(id);
  return withAttr(attr)(most.map(f, source));
}



////////////////////////////////////
//  Send osc message
////////////////////////////////////
function parseMessageAddress(address)
{
  // if(address === undefined || typeof address !== "string" || address.length == 0)
  //   return undefined;

  // address = address.toLowerCase();
  // if(address.indexOf("-") != -1)
  //   {
  //     const arr = address.split("-");
  //     let effect_type = arr[0];
  //     let command = arr[1];

  //   }
  //   else
  // {
  //   return 
  // }
  // if(address.indexOf("performer") != -1)
  // {
    
  // }
}

function parseOptions(options)
{
  // options command,
let final_address = [];
  if(options.id !== undefined)
  {
    const idList = parsePerfomerId(options.id);
    idList.forEach(id => {
      const split_str = options.address.split("-");
      final_address.push( split_str[0]+ id + "-"+split_str[1]);
    });
  }
  else
  {
    final_address.push(options.address);
  }
  return final_address;
}
function sendMessageToWs(addressList)
{
    return (value)=>{
      addressList.forEach(address => {
        const message = {
          type:"osc",
          address:address,
        };
        message.value = value;
        try{
          if(socket.readyState === WebSocket.OPEN){
            socket.send(JSON.stringify(message));
          }
        }catch (e) {
          console.log('Error when sending through WebSocket: ', e.stack());
        }
      });
    };
}

export function oscto(id, address, source)
{
  CheckWsState();

  const idList = parsePerfomerId(id);
  if(idList === undefined || idList.length > 3){
    return source;
  }
  const final_address = [];
  for(let i=0; i<idList.length; i++)
    {
      if(address.indexOf("-") != -1){
        const split_str = address.split("-");
        final_address.push("/"+split_str[0]+ idList[i] + "-"+split_str[1]);
      }
      else{
        final_address.push("/" + address + idList[i]);
      }
    }
  const f = sendMessageToWs(final_address);
  return withAttr(source.attr)(most.tap(f, source));
}

export function osctoall(address, source)
{
  CheckWsState();

  const final_address = ["/" + address]; 
  const f = sendMessageToWs(final_address);
  return withAttr(source.attr)(most.tap(f, source));
}

export function sendmsg(options = {}, source)
{
  CheckWsState();

  if(options.address === undefined)
    return source;



  const final_address = parseOptions(options);
  const f = sendMessageToWs(final_address);
  return withAttr(source.attr)(most.tap(f, source));
}



////////////////////////////////////
//  Performer Function
////////////////////////////////////
function parsePerfomerId(id)
{
  if(!(typeof(id) === 'string'))
    return undefined;

  id = id.toUpperCase();
  let idList = [];
  for (let i = 0; i < id.length; i++) {
    if(id[i] == 0 || id[i] == 1 || id[i] == 2)
    {
      idList.push(id[i]);
    }
    else if (id[i] == "A")idList.push(0);
    else if (id[i] == "B")idList.push(1);
    else if (id[i] == "C")idList.push(2);
  }

  return idList.length > 0 ? idList : undefined;
}

export function pfm_dist(id, source)
{
  const idList = parsePerfomerId(id);
  if(idList === undefined || idList.length > 3){
    return source;
  }

  let attr = {
    format:'scalar',
    size: 1
  }
  
  const f = (value)=>{
    let dis_total = 0;
    for (let i = 0; i < idList.length; i++) {
      for (let k = i+1; k < idList.length; k++) {
        const dis = vector_distance(performers[idList[i]].pos, performers[idList[k]].pos);
        dis_total += dis;
      }
    }
    return dis_total;
  }

  return withAttr(attr)(most.map(f, source));
}
function vector_distance(v1, v2)
{
  return Math.sqrt((Math.pow(v1[0]-v2[0],2))+(Math.pow(v1[1]-v1[1],2))+(Math.pow(v1[2]-v2[2],2)));
}

export function pfm_area(id, source)
{
  
}

export function pfm_miny(id, source)
{
  const idList = parsePerfomerId(id);
  if(idList === undefined || idList.length > 3){
    return source;
  }

  let attr = {
    format:'scalar',
    size: 1
  }

  const f = (value)=>{
    let array_y = [];
    for(let i=0; i<idList.length; i++)
    {
      array_y.push(performers[idList[i]].pos[1]);
    }
    return Math.min(...array_y);
  }

  return withAttr(attr)(most.map(f, source));
}

export function pfm_maxy(id, source)
{
  const idList = parsePerfomerId(id);
  if(idList === undefined || idList.length > 3){
    return source;
  }

  let attr = {
    format:'scalar',
    size: 1
  }

  const f = (value)=>{
    let array_y = [];
    for(let i=0; i<idList.length; i++)
    {
      array_y.push(performers[idList[i]].pos[1]);
    }
    return Math.max(...array_y);
  }

  return withAttr(attr)(most.map(f, source));
}