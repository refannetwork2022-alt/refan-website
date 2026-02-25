import { useState, useRef, useEffect } from "react";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Australia", "Austria", "Bangladesh",
  "Belgium", "Benin", "Bolivia", "Botswana", "Brazil", "Burkina Faso", "Burundi", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Brazzaville)", "Congo (DRC)", "Costa Rica", "Cote d'Ivoire", "Cuba", "Denmark",
  "Djibouti", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Ethiopia", "Finland", "France", "Gabon", "Gambia", "Germany", "Ghana", "Greece",
  "Guatemala", "Guinea", "Guinea-Bissau", "Haiti", "Honduras", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kenya", "Kuwait",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Malaysia", "Mali",
  "Mauritania", "Mauritius", "Mexico", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal",
  "Netherlands", "New Zealand", "Niger", "Nigeria", "Norway", "Pakistan", "Palestine", "Panama",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saudi Arabia", "Senegal", "Sierra Leone", "Singapore", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Eswatini", "Sweden", "Switzerland", "Syria",
  "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

interface CountrySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const CountrySearch = ({ value, onChange, placeholder = "Type to search country...", required }: CountrySearchProps) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? countries.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : countries;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        if (!countries.includes(query)) {
          setQuery(value);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, value]);

  const select = (country: string) => {
    onChange(country);
    setQuery(country);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
        required={required}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => select(c)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors ${
                c === value ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl p-4 text-sm text-muted-foreground text-center">
          No country found
        </div>
      )}
    </div>
  );
};

export { countries };
export default CountrySearch;
