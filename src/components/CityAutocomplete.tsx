
import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityAutocompleteProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
  placeholder: string;
  language: 'en' | 'ua';
  excludeCity?: string;
  disabled?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  selectedCity,
  onCitySelect,
  placeholder,
  language,
  excludeCity,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);

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
      searchPlaceholder: 'Search cities...'
    },
    ua: {
      noResults: 'Міста не знайдено.',
      searchPlaceholder: 'Пошук міст...'
    }
  };

  const t = translations[language];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full max-w-[110px] justify-between text-left font-normal overflow-hidden",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="truncate">
            {selectedCity || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50 bg-white shadow-lg border" align="start">
        <Command>
          <CommandInput placeholder={t.searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{t.noResults}</CommandEmpty>
            <CommandGroup>
              {availableCities.map((city) => (
                <CommandItem
                  key={city.en}
                  value={city[language]}
                  onSelect={(currentValue) => {
                    onCitySelect(currentValue === selectedCity ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCity === city[language] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city[language]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CityAutocomplete;
