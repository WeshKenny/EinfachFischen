export const CANTON_IMAGE_MAP: Record<string, string> = {
  Aargau: '/assets/cantons/aargau.png',
  'Appenzell Ausserrhoden': '/assets/cantons/appenzell-ausserhoden.png',
  'Appenzell Innerrhoden': '/assets/cantons/appenzell-innerrhoden.png',
  'Basel-Landschaft': '/assets/cantons/basel-land.png',
  'Basel-Stadt': '/assets/cantons/basel-stadt.png',
  Bern: '/assets/cantons/bern.png',
  Freiburg: '/assets/cantons/freiburg.png',
  Genf: '/assets/cantons/genf.png',
  Glarus: '/assets/cantons/glarus.png',
  'Graubünden': '/assets/cantons/graubuenden.png',
  Jura: '/assets/cantons/jura.png',
  Luzern: '/assets/cantons/luzern.png',
  Neuenburg: '/assets/cantons/neuenburg.png',
  Nidwalden: '/assets/cantons/nidwalden.png',
  Obwalden: '/assets/cantons/obwalden.png',
  Schaffhausen: '/assets/cantons/schaffhausen.png',
  Schwyz: '/assets/cantons/schwyz.png',
  Solothurn: '/assets/cantons/solothurn.png',
  'St. Gallen': '/assets/cantons/st-gallen.png',
  Tessin: '/assets/cantons/tessin.png',
  Thurgau: '/assets/cantons/thurgau.png',
  Uri: '/assets/cantons/uri.png',
  Waadt: '/assets/cantons/waadt.png',
  Wallis: '/assets/cantons/wallis.png',
  Zug: '/assets/cantons/zug.png',
  'Zürich': '/assets/cantons/zuerich.png'
};

export function getCantonImageAsset(germanCantonName: string): string {
  return CANTON_IMAGE_MAP[germanCantonName] ?? '';
}
