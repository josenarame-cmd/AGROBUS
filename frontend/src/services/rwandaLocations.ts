import rawRwanda from 'rwanda';
const rwanda = (rawRwanda as any)?.default || rawRwanda;
const { Cells, Districts, Provinces, Sectors, Villages } = rwanda || {};

export type LocationOption = { name: string; key: string };

function options(names?: string[]): LocationOption[] {
  return (names || []).map(name => ({ name, key: name.toLowerCase() }));
}

function provinceForDistrict(district: string): string | undefined {
  if (typeof Provinces !== 'function' || typeof Districts !== 'function') return undefined;
  return (Provinces() || []).find(province => (Districts(province) || []).some(name => name.toLowerCase() === district.toLowerCase()));
}

export const rwandaLocationsAPI = {
  districts: async () => options(typeof Districts === 'function' ? Districts() : []),
  sectors: async (district: string) => {
    const province = provinceForDistrict(district);
    return options(province && typeof Sectors === 'function' ? Sectors(province, district) : []);
  },
  cells: async (sector: string, district: string) => {
    const province = provinceForDistrict(district);
    return options(province && typeof Cells === 'function' ? Cells(province, district, sector) : []);
  },
  villages: async (cell: string, sector: string, district: string) => {
    const province = provinceForDistrict(district);
    return options(province && typeof Villages === 'function' ? Villages(province, district, sector, cell) : []);
  },
};