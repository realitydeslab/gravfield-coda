import { parseParameters, validateStream, withAttr } from '@coda/prelude';
import { tap } from '@most/core';

const host = 'ws://localhost:9090';
const socket = new WebSocket(host);
socket.onerror = () => {
  // eslint-disable-next-line no-console
  console.error('[unity] Error: the websocket server is unavailable at', host);
};
socket.onclose = () => {
  // eslint-disable-next-line no-console
  console.error('[unity] Error: lost connection with the websocket server');
};
socket.onmessage = (json) => {
  const m = JSON.parse(json.data);
  
  Object.values(performers[m.id]).forEach((f) => {
    f(m);
  });
};

function sendMessageToWs(address)
{
    const message = {
        type:"osc",
        address:address,
      };
    
    
      
    return (value)=>{
        
        console.log(address);
    console.log(value);
    console.log(value.constructor === Array);
    message.value = value;
    socket.send(JSON.stringify(message));
    };
}

export function sendosc2(address, source)
{
    const f = sendMessageToWs(address);
    return withAttr(source.attr)(tap(f, source));
}
