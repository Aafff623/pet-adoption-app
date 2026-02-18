import React from 'react';
import {
  PROVINCE_CITIES,
  ALL_LOCATIONS,
  HOT_CITIES,
  formatLocationDisplay,
  type LocationOption,
} from '../lib/data/regions';

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  value: LocationOption;
  onChange: (loc: LocationOption) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ open, onClose, value, onChange }) => {
  const [search, setSearch] = React.useState('');

  const handleSelect = (loc: LocationOption) => {
    onChange(loc);
    setSearch('');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
      onClick={() => { onClose(); setSearch(''); }}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-600" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">选择地区</h3>
          <button
            onClick={() => { onClose(); setSearch(''); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors active:scale-[0.9]"
            aria-label="关闭"
          >
            <span className="material-icons-round text-gray-500 dark:text-zinc-400 text-lg">close</span>
          </button>
        </div>

        <div className="px-5 pb-3 shrink-0">
          <div className="relative">
            <span className="material-icons-round absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500 text-lg">search</span>
            <input
              type="text"
              placeholder="搜索省份或城市，如：山西、太原..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-700 rounded-xl text-sm border border-gray-100 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-900 dark:text-zinc-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5">
                <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">cancel</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6 flex-1">
          {search.trim() === '' ? (
            <>
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">热门城市</p>
                <div className="grid grid-cols-4 gap-2">
                  {HOT_CITIES.map(loc => {
                    const isSelected = value.province === loc.province && value.city === loc.city;
                    return (
                      <button
                        key={`${loc.province}-${loc.city}`}
                        onClick={() => handleSelect(loc)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.95] relative ${
                          isSelected
                            ? 'bg-primary text-black shadow-sm shadow-primary/30'
                            : 'bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 border border-gray-100 dark:border-zinc-600'
                        }`}
                      >
                        {loc.city.replace(/[市区县]$/, '')}
                        {isSelected && (
                          <span className="absolute top-0.5 right-0.5 material-icons-round text-black text-[10px]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {PROVINCE_CITIES.map(regionNode => (
                <div key={regionNode.province} className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">{regionNode.province}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {regionNode.cities.map(c => {
                      const loc: LocationOption = { province: regionNode.province, city: c.name };
                      const isSelected = value.province === loc.province && value.city === loc.city;
                      return (
                        <button
                          key={`${loc.province}-${c.name}`}
                          onClick={() => handleSelect(loc)}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.95] relative ${
                            isSelected
                              ? 'bg-primary text-black shadow-sm shadow-primary/30'
                              : 'bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 border border-gray-100 dark:border-zinc-600'
                          }`}
                        >
                          {c.name.replace(/[市区县]$/, '')}
                          {isSelected && (
                            <span className="absolute top-0.5 right-0.5 material-icons-round text-black text-[10px]">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : (
            (() => {
              const kw = search.trim();
              const results = ALL_LOCATIONS.filter(loc => loc.province.includes(kw) || loc.city.includes(kw));
              return results.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {results.map(loc => {
                    const isSelected = value.province === loc.province && value.city === loc.city;
                    return (
                      <button
                        key={`${loc.province}-${loc.city}`}
                        onClick={() => handleSelect(loc)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.95] relative ${
                          isSelected
                            ? 'bg-primary text-black shadow-sm shadow-primary/30'
                            : 'bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 border border-gray-100 dark:border-zinc-600'
                        }`}
                      >
                        {loc.city.replace(/[市区县]$/, '')}
                        {isSelected && (
                          <span className="absolute top-0.5 right-0.5 material-icons-round text-black text-[10px]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-zinc-500">
                  <span className="material-icons-round text-4xl mb-2 block">search_off</span>
                  <p className="text-sm">未找到「{search}」</p>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
export { formatLocationDisplay };
export type { LocationOption };
