(async ()=>{
  try {
    const make = process.argv[2] || 'toyota';
    const url = `https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?make=${encodeURIComponent(make)}`;
    const headers = {
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '9bd79d0423mshfcfc153929842a6p108410jsn7067d2676251',
      'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com'
    };

    const res = await fetch(url, { headers });
    console.log('make', make, 'status', res.status);
    const json = await res.json();
    if (Array.isArray(json)) {
      console.log('count', json.length);
      console.log('sample', JSON.stringify(json.slice(0, 20).map(c => ({ make: c.make, model: c.model, year: c.year })), null, 2));
    } else {
      console.log('response', JSON.stringify(json, null, 2));
    }
  } catch (e) {
    console.error('probe failed', e);
  }
})();
