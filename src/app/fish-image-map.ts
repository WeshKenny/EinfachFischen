export const FISH_IMAGE_MAP: Record<string, string> = {
  Aal: '/assets/fish/eel.png',
  'Amerikanischer Seesaibling': '/assets/fish/lake-trout-namaycush.png',
  'Amerikanischer Seesaibling (Namaycush)': '/assets/fish/lake-trout-namaycush.png',
  'Äsche': '/assets/fish/grayling.png',
  Bachforelle: '/assets/fish/brown-trout.png',
  Bachsaibling: '/assets/fish/brook-trout.png',
  Balchen: '/assets/fish/whitefish.png',
  Barsch: '/assets/fish/perch.png',
  Egli: '/assets/fish/perch.png',
  Felchen: '/assets/fish/whitefish.png',
  Forelle: '/assets/fish/trout.png',
  Hecht: '/assets/fish/pike.png',
  Karpfen: '/assets/fish/carp.png',
  Namaycush: '/assets/fish/lake-trout-namaycush.png',
  Regenbogenforelle: '/assets/fish/rainbow-trout.png',
  'Rötel': '/assets/fish/arctic-char.png',
  Saibling: '/assets/fish/char.png',
  Seeforelle: '/assets/fish/lake-trout.png',
  Seesaibling: '/assets/fish/lake-char.png',
  'Trüsche': '/assets/fish/burbot.png',
  Wels: '/assets/fish/catfish.png',
  Zander: '/assets/fish/zander.png'
};

// App-Kontext:
// Egli = Barsch
// Balchen = Felchen
// Amerikanischer Seesaibling = Namaycush / Lake Trout (kontextabhaengig)
export const FISH_IMAGE_ALIASES: Record<string, string> = {
  Egli: 'Barsch',
  Balchen: 'Felchen',
  'Amerikanischer Seesaibling': 'Namaycush',
  'Amerikanischer Seesaibling (Namaycush)': 'Namaycush'
};

export const DEFAULT_FISH_IMAGE = '/assets/fish/whitefish.png';

export function getFishImageAsset(germanFishName: string): string {
  return FISH_IMAGE_MAP[germanFishName] ?? DEFAULT_FISH_IMAGE;
}
