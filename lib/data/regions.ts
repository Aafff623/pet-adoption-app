/**
 * 中国省市区数据 - 基于 province-city-china (GB/T 2260)
 * 构建省-市二级结构，直辖市使用区作为「城市」层级
 */

import provinceData from 'province-city-china/dist/province.json';
import cityData from 'province-city-china/dist/city.json';
import areaData from 'province-city-china/dist/area.json';

type ProvinceRow = { code: string; name: string; province: string };
type CityRow = { code: string; name: string; province: string; city: string };
type AreaRow = { code: string; name: string; province: string; city: string; area: string };

const provinces = provinceData as ProvinceRow[];
const cities = cityData as CityRow[];
const areas = areaData as AreaRow[];

/** 直辖市省份代码：北京、天津、上海、重庆 */
const MUNICIPALITY_PROVINCE_CODES = ['11', '12', '31', '50'];

export interface LocationOption {
  province: string;
  city: string;
}

export interface RegionNode {
  province: string;
  cities: { name: string }[];
}

export interface FlatLocation {
  province: string;
  city: string;
}

function buildProvinceCities(): RegionNode[] {
  const result: RegionNode[] = [];

  for (const province of provinces) {
    const provinceCode = province.province || province.code.slice(0, 2);
    const provinceName = province.name;

    if (MUNICIPALITY_PROVINCE_CODES.includes(provinceCode)) {
      const districtNames = areas
        .filter((a) => a.province === provinceCode)
        .map((a) => ({ name: a.name }))
        .filter((item, index, arr) => arr.findIndex((x) => x.name === item.name) === index);
      if (districtNames.length > 0) {
        result.push({ province: provinceName, cities: districtNames });
      }
    } else {
      const cityNames = cities
        .filter((c) => c.province === provinceCode)
        .map((c) => ({ name: c.name }));
      if (cityNames.length > 0) {
        result.push({ province: provinceName, cities: cityNames });
      }
    }
  }

  return result;
}

export const PROVINCE_CITIES = buildProvinceCities();

export const ALL_LOCATIONS: FlatLocation[] = PROVINCE_CITIES.flatMap((node) =>
  node.cities.map((c) => ({ province: node.province, city: c.name }))
);

export function formatLocationDisplay(opt: LocationOption): string {
  return `${opt.province} ${opt.city}`;
}

export function parseLocationDisplay(str: string): LocationOption | null {
  if (!str?.trim()) return null;
  const s = str.trim();
  const exact = ALL_LOCATIONS.find(
    (loc) =>
      formatLocationDisplay(loc) === s ||
      `${loc.province}${loc.city}` === s ||
      loc.province === s ||
      loc.city === s
  );
  if (exact) return exact;
  const byProvince = ALL_LOCATIONS.find(loc => loc.province.includes(s) || s.includes(loc.province.replace(/[省市区]$/, '')));
  if (byProvince) return byProvince;
  const byCity = ALL_LOCATIONS.find(loc => loc.city.includes(s) || (s.length >= 2 && loc.city.replace(/[市区县]$/, '').includes(s)));
  return byCity ?? null;
}

export const HOT_CITIES: LocationOption[] = [
  { province: '上海市', city: '黄浦区' },
  { province: '北京市', city: '朝阳区' },
  { province: '广东省', city: '广州市' },
  { province: '广东省', city: '深圳市' },
  { province: '四川省', city: '成都市' },
  { province: '浙江省', city: '杭州市' },
  { province: '湖北省', city: '武汉市' },
  { province: '江苏省', city: '南京市' },
  { province: '陕西省', city: '西安市' },
  { province: '重庆市', city: '渝中区' },
];

export const DEFAULT_LOCATION: LocationOption = HOT_CITIES[1];
