import https from 'node:https';
import fs from 'node:fs';
import vm from 'node:vm';

https.get('https://kretz.site/assets/index-CupoX5eT.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const startStr = 'JSON.parse(`[{"id":"kretz-1"';
    const startIdx = data.indexOf(startStr);
    if (startIdx === -1) {
      console.error('Could not find start of properties array');
      return;
    }
    const arrayStart = startIdx + 'JSON.parse('.length; // pointing at backtick
    // Find matching `]` followed by `)`
    const closeIdx = data.indexOf(']`)', arrayStart);
    if (closeIdx === -1) {
      console.error('Could not find close ]`)');
      return;
    }

    const expression = data.substring(startIdx, closeIdx + 3); // JSON.parse(`...array...]`)
    console.log('Expression length:', expression.length);
    try {
      const properties = vm.runInNewContext(expression);
      console.log(`SUCCESS! Parsed ${properties.length} real properties from https://kretz.site/#/annonce/ !`);
      fs.writeFileSync('./scripts/kretz_raw_properties.json', JSON.stringify(properties, null, 2), 'utf-8');
      console.log('Saved to ./scripts/kretz_raw_properties.json');
      console.log('First property:', {
        ref: properties[0].ref,
        title: properties[0].title,
        priceFormatted: properties[0].priceFormatted,
        city: properties[0].city,
        imagesCount: properties[0].images?.length,
        url: `https://kretz.site/#/annonce/${properties[0].ref.toLowerCase()}/${properties[0].propertyTypeSlug || ''}`
      });
      console.log('Last property:', {
        ref: properties[properties.length - 1].ref,
        title: properties[properties.length - 1].title,
        priceFormatted: properties[properties.length - 1].priceFormatted,
        city: properties[properties.length - 1].city,
      });
    } catch (err) {
      console.error('VM Eval error:', err);
    }
  });
}).on('error', err => {
  console.error('Fetch error:', err);
});

