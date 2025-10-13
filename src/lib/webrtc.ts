export function initPeerConnection(onMessage: (msg: string) => void) {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  const channel = pc.createDataChannel("chat");
  channel.onmessage = (event) => onMessage(event.data);
  return { pc, channel };
}
