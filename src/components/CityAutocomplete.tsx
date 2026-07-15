import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getMapboxService } from '@/services/mapboxService';

interface CityAutocompleteProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
  placeholder: string;
  language: 'en' | 'ua';
  excludeCity?: string;
  disabled?: boolean;
  /** 'plain' renders a borderless row for stop-list layouts (Apple Maps style) */
  variant?: 'default' | 'plain';
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  selectedCity,
  onCitySelect,
  placeholder,
  language,
  excludeCity,
  disabled = false,
  variant = 'default'
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [geoResults, setGeoResults] = useState<any[]>([]);
  const [isGeoSearching, setIsGeoSearching] = useState(false);
  const isMobile = useIsMobile();

  // Live geocoding search: any city worldwide (Poland, Moldova, ...),
  // biased toward Ukraine by the service's default proximity.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setGeoResults([]);
      setIsGeoSearching(false);
      return;
    }
    let cancelled = false;
    setIsGeoSearching(true);
    const timer = setTimeout(async () => {
      try {
        const service = await getMapboxService();
        // Rank by text relevance, not distance — an exact "Kraków" must beat
        // fuzzy-matched villages near the map center.
        const res = await service.geocodeForward(q, undefined, {
          language: language === 'ua' ? 'uk' : 'en',
          disableProximityBias: true
        });
        if (!cancelled) setGeoResults(res.features || []);
      } catch (error) {
        console.error('City search failed:', error);
        if (!cancelled) setGeoResults([]);
      } finally {
        if (!cancelled) setIsGeoSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, language]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const ukrainianCities = [
    { en: 'Kyiv', ua: 'Київ', coordinates: [30.5234, 50.4501] },
    { en: 'Lviv', ua: 'Львів', coordinates: [24.0232, 49.8397] },
    { en: 'Odesa', ua: 'Одеса', coordinates: [30.7233, 46.4825] },
    { en: 'Dnipro', ua: 'Дніпро', coordinates: [35.0462, 48.4647] },
    { en: 'Kharkiv', ua: 'Харків', coordinates: [36.2304, 49.9935] },
    { en: 'Chernivtsi', ua: 'Чернівці', coordinates: [25.9358, 48.2916] },
    { en: 'Zakarpattia', ua: 'Закарпаття', coordinates: [22.7202, 48.6208] },
    { en: 'Ivano-Frankivsk', ua: 'Івано-Франківськ', coordinates: [24.7111, 48.9226] },
    { en: 'Ternopil', ua: 'Тернопіль', coordinates: [25.6014, 49.5535] },
    { en: 'Uzhhorod', ua: 'Ужгород', coordinates: [22.2879, 48.6208] },
    { en: 'Rivne', ua: 'Рівне', coordinates: [26.2527, 50.6199] },
    { en: 'Lutsk', ua: 'Луцьк', coordinates: [25.3424, 50.7593] },
    { en: 'Vinnytsia', ua: 'Вінниця', coordinates: [28.4682, 49.2328] },
    { en: 'Zhytomyr', ua: 'Житомир', coordinates: [28.6587, 50.2547] },
    { en: 'Khmelnytskyi', ua: 'Хмельницький', coordinates: [26.9871, 49.4229] },
    { en: 'Cherkasy', ua: 'Черкаси', coordinates: [32.0617, 49.4444] },
    { en: 'Poltava', ua: 'Полтава', coordinates: [34.5414, 49.5883] },
    { en: 'Sumy', ua: 'Суми', coordinates: [34.8000, 50.9077] },
    { en: 'Chernihiv', ua: 'Чернігів', coordinates: [31.2893, 51.4982] },
    { en: 'Kramatorsk', ua: 'Краматорск', coordinates: [37.5556, 48.7233] },
    { en: 'Mariupol', ua: 'Маріуполь', coordinates: [37.5431, 47.0975] },
    { en: 'Zaporizhzhia', ua: 'Запоріжжя', coordinates: [35.1396, 47.8388] }
  ];

  // Filter out excluded city
  const availableCities = ukrainianCities.filter(city => 
    !excludeCity || city[language] !== excludeCity
  );

  const translations = {
    en: {
      noResults: 'No cities found.',
      searchPlaceholder: 'Search cities...',
      selectCity: 'Select a city',
      cancel: 'Cancel'
    },
    ua: {
      noResults: 'Міста не знайдено.',
      searchPlaceholder: 'Пошук міст...',
      selectCity: 'Оберіть місто',
      cancel: 'Скасувати'
    }
  };

  const t = translations[language];

  const handleCitySelect = (cityName: string) => {
    onCitySelect(cityName === selectedCity ? "" : cityName);
    handleOpenChange(false);
  };

  // "Kraków, Poland" for foreign results; bare city name inside Ukraine
  const localCountryName = language === 'ua' ? 'Україна' : 'Ukraine';
  const formatFeature = (feature: any) => {
    const country = feature.context?.find(
      (c: any) => typeof c.id === 'string' && c.id.startsWith('country')
    )?.text;
    return country && country !== localCountryName ? `${feature.text}, ${country}` : feature.text;
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredStaticCities = availableCities.filter(
    (city) =>
      !normalizedQuery ||
      city.en.toLowerCase().includes(normalizedQuery) ||
      city.ua.toLowerCase().includes(normalizedQuery)
  );
  const staticNames = new Set(filteredStaticCities.map((city) => city[language]));
  const geoItems = geoResults
    .map((feature) => ({ feature, name: formatFeature(feature) }))
    .filter(({ name }) => name && !staticNames.has(name) && name !== excludeCity);

  const renderCityList = (dense: boolean) => (
    <CommandList className={dense ? undefined : 'max-h-[50vh]'}>
      {isGeoSearching && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-white/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t.searchPlaceholder}
        </div>
      )}
      {!isGeoSearching && filteredStaticCities.length === 0 && geoItems.length === 0 && (
        <div className="py-6 text-center text-sm text-gray-400">{t.noResults}</div>
      )}
      <CommandGroup>
        {filteredStaticCities.map((city) => (
          <CommandItem
            key={city.en}
            value={city[language]}
            onSelect={() => handleCitySelect(city[language])}
            className={cn(
              'text-white cursor-pointer',
              dense ? '' : 'flex items-center justify-between py-4 px-4 hover:bg-white/10'
            )}
          >
            {dense && (
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  selectedCity === city[language] ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
            <span className={dense ? undefined : 'text-base'}>{city[language]}</span>
            {!dense && selectedCity === city[language] && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </CommandItem>
        ))}
        {geoItems.map(({ feature, name }) => (
          <CommandItem
            key={feature.id}
            value={feature.id}
            onSelect={() => handleCitySelect(name)}
            className={cn('text-white cursor-pointer', dense ? '' : 'py-3 px-4 hover:bg-white/10')}
          >
            <Globe className="mr-2 h-4 w-4 text-white/70 flex-shrink-0" />
            <div className="min-w-0">
              <div className={cn('truncate', dense ? undefined : 'text-base')}>{name}</div>
              <div className="text-xs text-white/40 truncate">{feature.place_name}</div>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );

  const TriggerButton = variant === 'plain' ? (
    <Button
      variant="ghost"
      role="combobox"
      aria-expanded={open}
      aria-label={placeholder}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal overflow-hidden px-0 rounded-lg",
        "bg-transparent border-0 shadow-none text-white hover:bg-transparent hover:text-white",
        isMobile ? "h-12 text-base" : "h-10 text-[15px]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span className={cn("truncate", !selectedCity && "text-white/40")}>
        {selectedCity || placeholder}
      </span>
    </Button>
  ) : (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        "w-full justify-between text-left font-normal overflow-hidden",
        "rounded-xl bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20 hover:text-white",
        isMobile ? "h-12 text-base" : "2xl:max-w-[148px]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="truncate">
        {selectedCity || placeholder}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent className="bg-slate-900/85 backdrop-blur-2xl border-white/10">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-white text-lg">
                {t.selectCity}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <Command shouldFilter={false} className="bg-white/5 border border-white/10 backdrop-blur-md">
              <CommandInput
                placeholder={t.searchPlaceholder}
                value={query}
                onValueChange={setQuery}
                className="text-white placeholder:text-gray-400 border-none"
              />
              {renderCityList(false)}
            </Command>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop version - keep existing popover
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[280px] p-0 z-50 rounded-xl bg-slate-900/85 backdrop-blur-2xl border-white/10 text-white shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200" align="start">
        <Command shouldFilter={false} className="bg-transparent text-white">
          <CommandInput placeholder={t.searchPlaceholder} value={query} onValueChange={setQuery} />
          {renderCityList(true)}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CityAutocomplete;
