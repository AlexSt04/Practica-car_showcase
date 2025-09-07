(async ()=>{
  try {
    const make = process.argv[2] || 'toyota';
    const baseUrl = 'https://cars-by-api-ninjas.p.rapidapi.com/v1/cars';
    const headers = {
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '9bd79d0423mshfcfc153929842a6p108410jsn7067d2676251',
      'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com'
    };
    const currentYear = new Date().getFullYear();
    const years = [0,1,2,3,4].map(d => currentYear - d);
    const results = [];
    for (const y of years) {
      const url = `${baseUrl}?make=${encodeURIComponent(make)}&year=${y}`;
      const res = await fetch(url, { headers });
      const json = await res.json();
      console.log('year', y, 'status', res.status, 'count', Array.isArray(json) ? json.length : 0);
      if (Array.isArray(json)) results.push(...json);
    }
    // dedupe by model
    const models = new Map();
    results.forEach(c => {
      const key = `${c.model}`;
      if (!models.has(key)) models.set(key, c);
    });
    console.log('aggregated count', results.length, 'unique models', models.size);
    console.log('models sample', Array.from(models.keys()).slice(0, 50));
  } catch(e) {
    console.error(e);
  }
})();
