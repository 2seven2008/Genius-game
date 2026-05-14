export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateGuestUsername(): string {
  const adjectives = ['Rápido', 'Brilhante', 'Épico', 'Astuto', 'Veloz', 'Lendário', 'Místico'];
  const nouns = ['Jogador', 'Gênio', 'Mestre', 'Campeão', 'Herói', 'Ás'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
}
