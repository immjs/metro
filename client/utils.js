export function toConnectionTag(connectionId, isEnd) {
  const newConTag = connectionId + isEnd * 128;
  const newConBuf = Buffer.alloc(1);
  newConBuf.writeUint8(newConTag);
  return newConBuf;
}
export function toConnectionTag16(connectionId, isEnd) {
  const newConTag = connectionId + isEnd * 128 * 256;
  const newConBuf = Buffer.alloc(2);
  newConBuf.writeUint16LE(newConTag);
  return newConBuf;
}

export function getFirstEmpty(arr) {
  return arr.findIndex((v) => v == null);
}
