export const assignChunks = (data: any[], alreadyAssigned: number, packetSize: number) => {
  const end = Math.min(alreadyAssigned + packetSize, data.length);
  const assigned = Math.min(end, data.length);

  return { start: assigned, chunks: data.slice(alreadyAssigned, end) };
}
