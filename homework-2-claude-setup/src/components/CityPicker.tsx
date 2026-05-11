export type City = {
  name: string;
  lat: number;
  lon: number;
};

export type Props = {
  value: City;
  onChange: (next: City) => void;
};

const CITIES: City[] = [
  { name: 'Prague', lat: 50.0755, lon: 14.4378 },
  { name: 'Brno', lat: 49.1951, lon: 16.6068 },
  { name: 'Ostrava', lat: 49.8209, lon: 18.2625 },
  { name: 'Plzeň', lat: 49.7384, lon: 13.3736 },
  { name: 'Liberec', lat: 50.7663, lon: 15.0543 },
];

export default function CityPicker({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      City
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none"
        value={value.name}
        onChange={(e) => {
          const next = CITIES.find((c) => c.name === e.target.value);
          if (next) onChange(next);
        }}
      >
        {CITIES.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
