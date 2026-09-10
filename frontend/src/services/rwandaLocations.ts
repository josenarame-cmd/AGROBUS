import rwanda from 'rwanda';
const { Cells, Districts, Provinces, Sectors, Villages } = rwanda;

export type LocationOption = { name: string; key: string };

function options(names?: string[]): LocationOption[] {
  return (names || []).map(name => ({ name, key: name.toLowerCase() }));
}

function provinceForDistrict(district: string): string | undefined {
  return Provinces().find(province => (Districts(province) || []).some(name => name.toLowerCase() === district.toLowerCase()));
}

export const rwandaLocationsAPI = {
  districts: async () => options(Districts()),
  sectors: async (district: string) => {
    const province = provinceForDistrict(district);
    return options(province ? Sectors(province, district) : []);
  },
  cells: async (sector: string, district: string) => {
    const province = provinceForDistrict(district);
    return options(province ? Cells(province, district, sector) : []);
  },
  villages: async (cell: string, sector: string, district: string) => {
    const province = provinceForDistrict(district);
    return options(province ? Villages(province, district, sector, cell) : []);
  },
};