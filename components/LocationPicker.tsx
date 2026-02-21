import React from 'react';
import { pinyin } from 'pinyin-pro';
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

const MAX_RESULTS = 60;

const stripSuffix = (value: string) => value.replace(/[省市区县]$/, '');
const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '');

const LocationPicker: React.FC<LocationPickerProps> = ({ open, onClose, value, onChange }) => {
  const [search, setSearch] = React.useState('');
  const [activeProvince, setActiveProvince] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (loc: LocationOption) => {
    onChange(loc);
    setSearch('');
    setActiveProvince(null);
    onClose();
  };

  React.useEffect(() => {
    if (!open) return;
    setSearch('');
    setActiveProvince(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  React.useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        setSearch('');
        setActiveProvince(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const searchIndex = React.useMemo(
    () =>
      ALL_LOCATIONS.map(loc => {
        const display = `${loc.province}${loc.city}`;
        const pinyinFull = normalizeText(pinyin(display, { toneType: 'none' }));
        const pinyinInitial = normalizeText(pinyin(display, { pattern: 'first', toneType: 'none' }));
        return {
          loc,
          display,
          provinceShort: stripSuffix(loc.province),
          cityShort: stripSuffix(loc.city),
          pinyinFull,
          pinyinInitial,
        };
      }),
    []
  );

  const searchResults = React.useMemo(() => {
    const kw = normalizeText(search);
    if (!kw) return [];
    return searchIndex
      .filter(item =>
        item.display.includes(search) ||
        item.loc.province.includes(search) ||
        item.loc.city.includes(search) ||
        item.provinceShort.includes(search) ||
        item.cityShort.includes(search) ||
        item.pinyinFull.includes(kw) ||
        item.pinyinInitial.includes(kw)
      )
      .slice(0, MAX_RESULTS);
  }, [search, searchIndex]);

  if (!open) return null;

  const activeNode = activeProvince
    ? PROVINCE_CITIES.find(node => node.province === activeProvince)
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
      onClick={() => {
        onClose();
        setSearch('');
        setActiveProvince(null);
      }}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-600" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div>
            <h3 id="location-picker-title" className="text-lg font-bold text-gray-900 dark:text-zinc-100">选择地区</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              当前：{formatLocationDisplay(value)}
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              setSearch('');
              setActiveProvince(null);
            }}
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
              ref={inputRef}
              type="text"
              placeholder="搜索省份/城市/拼音，如：山西、taiyuan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-zinc-700 rounded-xl text-sm border border-gray-100 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/40 text-gray-900 dark:text-zinc-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5" aria-label="清除搜索">
                <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">cancel</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6 flex-1">
          {search.trim() ? (
            searchResults.length > 0 ? (
              <>
                <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  搜索结果（最多 {MAX_RESULTS} 条）
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {searchResults.map(item => {
                    const loc = item.loc;
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
                        {stripSuffix(loc.city)}
                        {isSelected && (
                          <span className="absolute top-0.5 right-0.5 material-icons-round text-black text-[10px]">check</span>
                        )}
                        <span className="block text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                          {stripSuffix(loc.province)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-zinc-500">
                <span className="material-icons-round text-4xl mb-2 block">search_off</span>
                <p className="text-sm">未找到「{search}」</p>
              </div>
            )
          ) : (
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
                        {stripSuffix(loc.city)}
                        {isSelected && (
                          <span className="absolute top-0.5 right-0.5 material-icons-round text-black text-[10px]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">按省选择</p>
                </div>
                {activeProvince && (
                  <button
                    type="button"
                    onClick={() => setActiveProvince(null)}
                    className="text-xs text-primary font-semibold"
                  >
                    更换省份
                  </button>
                )}
              </div>

              {activeNode ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-icons-round text-primary text-base">place</span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{activeNode.province}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {activeNode.cities.map(c => {
                      const loc: LocationOption = { province: activeNode.province, city: c.name };
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
                          {stripSuffix(c.name)}
                          {isSelected && (
                            <span className="absolute top-0.5 right-0.5 material-icons-round text-black text-[10px]">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {PROVINCE_CITIES.map(regionNode => (
                    <button
                      key={regionNode.province}
                      type="button"
                      onClick={() => setActiveProvince(regionNode.province)}
                      className="py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.95] bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 border border-gray-100 dark:border-zinc-600"
                    >
                      {stripSuffix(regionNode.province)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
export { formatLocationDisplay };
export type { LocationOption };
