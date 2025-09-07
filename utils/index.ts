import { CarProps, FilterProps } from "@types";

export const calculateCarRent = (city_mpg: number | string | undefined, year: number | string | undefined) => {
  // Defensive coercion: inputs can be strings or undefined coming from external API
  const basePricePerDay = 50; // Base rental price per day in dollars
  const mileageFactor = 0.1; // Additional rate per mile driven
  const ageFactor = 0.05; // Additional rate per year of vehicle age

  // Coerce to numbers and provide sensible fallbacks
  const mpg = Number(city_mpg ?? 0);
  const yr = Number(year ?? new Date().getFullYear());

  const safeMpg = Number.isFinite(mpg) ? mpg : 0;
  const safeYear = Number.isFinite(yr) ? yr : new Date().getFullYear();

  // Calculate additional rate based on mileage and age
  const mileageRate = safeMpg * mileageFactor;
  const ageRate = (new Date().getFullYear() - safeYear) * ageFactor;

  // Calculate total rental rate per day
  let rentalRatePerDay = basePricePerDay + mileageRate + ageRate;

  if (!Number.isFinite(rentalRatePerDay) || isNaN(rentalRatePerDay)) {
    rentalRatePerDay = basePricePerDay;
  }

  return rentalRatePerDay.toFixed(0);
};

export const updateSearchParams = (type: string, value: string) => {
  // Get the current URL search params
  const searchParams = new URLSearchParams(window.location.search);

  // Set the specified search parameter to the given value
  searchParams.set(type, value);

  // Set the specified search parameter to the given value
  const newPathname = `${window.location.pathname}?${searchParams.toString()}`;

  return newPathname;
};

export const deleteSearchParams = (type: string) => {
  // Set the specified search parameter to the given value
  const newSearchParams = new URLSearchParams(window.location.search);

  // Delete the specified search parameter
  newSearchParams.delete(type.toLocaleLowerCase());

  // Construct the updated URL pathname with the deleted search parameter
  const newPathname = `${window.location.pathname}?${newSearchParams.toString()}`;

  return newPathname;
};

export async function fetchCars(filters: FilterProps) {
  const { manufacturer, year, model, limit, fuel } = filters;

  

  // Set the required headers for the API request
  const headers: HeadersInit = {
  'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '9bd79d0423mshfcfc153929842a6p108410jsn7067d2676251',
  'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com'
  };

  

  // Set the required headers for the API request
  const params = new URLSearchParams();
  if (manufacturer) params.append("make", String(manufacturer));
  if (year) params.append("year", String(year));
  if (model) params.append("model", String(model));
  if (limit) params.append("limit", String(limit));
  if (fuel) params.append("fuel_type", String(fuel));

  const baseUrl = `https://cars-by-api-ninjas.p.rapidapi.com/v1/cars`;
  const queryString = params.toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  try {
    // If user only provided manufacturer (no model and no year), query multiple recent years and aggregate
    if (manufacturer && !model && !year) {
      // Query the last N years to surface more variants without relying on the premium `limit` param
      const currentYear = new Date().getFullYear();
      const yearsToQuery = [0, 1, 2, 3, 4].map((d) => currentYear - d); // last 5 years

      // Build fetch promises for each year
      const promises = yearsToQuery.map((y) => {
        const p = new URLSearchParams();
        p.append("make", String(manufacturer));
        p.append("year", String(y));
        if (fuel) p.append("fuel_type", String(fuel));
        const q = p.toString();
        const u = q ? `${baseUrl}?${q}` : baseUrl;
        // eslint-disable-next-line no-console
        console.log("fetchCars: requesting url ->", u);
        return fetch(u, { headers }).then(async (res) => {
          if (!res.ok) {
            const t = await res.text();
            // eslint-disable-next-line no-console
            console.warn(`fetchCars: API (${u}) returned status ${res.status}: ${t}`);
            return [];
          }
          return res.json();
        }).catch((e) => {
          // eslint-disable-next-line no-console
          console.error("fetchCars: request failed for", u, e);
          return [];
        });
      });

      const responses = await Promise.all(promises);
      // Flatten and dedupe by make+model+year
      const flat = responses.flat().filter(Boolean) as any[];
      const map = new Map();
      flat.forEach((c) => {
        const key = `${c.make}::${c.model}::${c.year}`;
        if (!map.has(key)) map.set(key, c);
      });
      const aggregated = Array.from(map.values());
      // eslint-disable-next-line no-console
      console.log(`fetchCars: aggregated ${aggregated.length} unique items from ${yearsToQuery.length} year-queries`);
      return aggregated;
    }

    // Log the outgoing request for debugging
    // eslint-disable-next-line no-console
    console.log("fetchCars: requesting url ->", url);

    const response = await fetch(url, { headers });

    // If not OK, log and return empty array so UI shows a friendly message
    if (!response.ok) {
      const text = await response.text();
      // eslint-disable-next-line no-console
      console.warn(`fetchCars: API returned status ${response.status}: ${text}`);
      return [];
    }

    const result = await response.json();
    // Log some info about the returned data to help debug why only one model appears
    try {
      // eslint-disable-next-line no-console
      console.log(`fetchCars: received ${Array.isArray(result) ? result.length : 0} items`);
      if (Array.isArray(result) && result.length > 0) {
        const sample = result.slice(0, 5).map((c: any) => `${c.make} ${c.model} (${c.year})`).join(", ");
        // eslint-disable-next-line no-console
        console.log("fetchCars: sample ->", sample);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("fetchCars: failed to log result sample", err);
    }

    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("fetchCars: request failed:", err);
    return [];
  }
}

export const generateCarImageUrl = (car: CarProps, angle?: string) => {
  const url = new URL("https://cdn.imagin.studio/getimage");
  const { make, model, year } = car;

  url.searchParams.append('customer', "img");
  url.searchParams.append('make', make);
  url.searchParams.append('modelFamily', model.split(" ")[0]);
  url.searchParams.append('zoomType', 'fullscreen');
  url.searchParams.append('modelYear', `${year}`);
  // url.searchParams.append('zoomLevel', zoomLevel);
  if (angle) {
    url.searchParams.append('angle', angle);
  }

  return url.toString();
} 
