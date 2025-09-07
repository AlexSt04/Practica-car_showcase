(async ()=>{
  try {
    const url = 'https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?make=toyota';
    const headers = {
      'X-RapidAPI-Key': '9bd79d0423mshfcfc153929842a6p108410jsn7067d2676251',
      'X-RapidAPI-Host': 'cars-by-api-ninjas.p.rapidapi.com'
    };

    const res = await fetch(url, { headers });
    console.log('status', res.status);
    const json = await res.json();
    if (Array.isArray(json)) {
      console.log('count', json.length);
      console.log('sample', JSON.stringify(json.slice(0, 10).map(c => ({ make: c.make, model: c.model, year: c.year })), null, 2));
    } else {
      console.log('response', JSON.stringify(json, null, 2));
    }
  } catch (e) {
    console.error('probe failed', e);
  }
})();
