export type LocationInfo = { lat: number; lon: number; address: string };

// Minimal hand-curated coordinates for demo data so the map can render meaningfully
export const MERCHANT_LOCATIONS: Record<string, LocationInfo> = {
  "Monoprix Antibes": { lat: 43.5874, lon: 7.1203, address: "8 Bd Albert 1er, 06600 Antibes, France" },
  "Galeries Lafayette Haussmann": { lat: 48.8738, lon: 2.3326, address: "40 Bd Haussmann, 75009 Paris, France" },
  "L'Ami Jean": { lat: 48.8629, lon: 2.3047, address: "27 Rue Malar, 75007 Paris, France" },
  "Café de Flore": { lat: 48.8553, lon: 2.3332, address: "172 Bd Saint-Germain, 75006 Paris, France" },
  "Buckingham Palace Tickets": { lat: 51.5014, lon: -0.1419, address: "Buckingham Palace, London SW1A 1AA, UK" },
  "McDonald's Oxford Street": { lat: 51.5166, lon: -0.1449, address: "291 Oxford St, London W1C 2DR, UK" },
  "Costa Coffee Oxford Street": { lat: 51.5159, lon: -0.1441, address: "192 Oxford St, London W1D 1NS, UK" },
  "Starbucks Oxford Street": { lat: 51.5151, lon: -0.1408, address: "36-38 Great Castle St, London W1W 8LG, UK" },
  // Example from the screenshot
  "McDonald's": { lat: 43.5663, lon: 7.1042, address: "32 Avenue de Cannes, 06160 Antibes, France" },
  // Additional screenshot example
  "CRAI": { lat: 41.0768, lon: 9.3953, address: "Arzachena Sardinia, Italy" },
};
