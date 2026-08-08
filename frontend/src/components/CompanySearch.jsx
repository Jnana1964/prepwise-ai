import { useEffect, useRef, useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import { companiesApi } from '../api/client.js';

// Replaces the old fixed 5-company dropdown. Debounced search against the
// real companies table (data/companiesSeed.js has ~30 real companies;
// grows without a code change as more are added to the DB).
export default function CompanySearch({ value, onChange }) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const search = (q) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await companiesApi.search(q);
        setResults(data.companies || []);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 bg-surface border border-border rounded-input px-4 py-2.5">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            search(e.target.value);
          }}
          onFocus={() => {
            setOpen(true);
            if (results.length === 0) search('');
          }}
          placeholder="Search for a company (TCS, Amazon, Google...)"
          className="bg-transparent outline-none text-sm text-fg placeholder-muted flex-1"
        />
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto card p-1">
          {loading ? (
            <p className="text-xs text-muted px-3 py-2">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-muted px-3 py-2">No companies match "{query}"</p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onChange(c);
                  setQuery(c.name);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-btn hover:bg-surface2 text-left"
              >
                <Building2 size={14} className="text-accent-500 shrink-0" />
                <span className="text-sm text-fg">{c.name}</span>
                <span className="text-xs text-muted ml-auto">{c.industry}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
