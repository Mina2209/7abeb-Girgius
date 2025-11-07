// Keep frontend normalization consistent with backend
export function normalizeArabic(input) {
  if (!input || typeof input !== 'string') return '';
  let s = input;
  s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  s = s.replace(/\u0640/g, '');
  s = s.replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627');
  s = s.replace(/[\u0624]/g, '\u0648');
  s = s.replace(/[\u0626]/g, '\u064A');
  s = s.replace(/[\u0649]/g, '\u064A');
  s = s.replace(/[\u0629]/g, '\u0647');
  s = s.replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48));
  return s.trim().toLowerCase();
}


