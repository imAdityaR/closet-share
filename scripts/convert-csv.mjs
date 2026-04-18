import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CSV manually (simple approach for our use case)
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parsing - handles basic cases
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    rows.push(obj);
  }

  return rows;
}

// Calculate rental pricing based on article type
function calculatePricing(articleType, baseColour) {
  const basePrice = {
    Shirts: 149,
    Kurtas: 199,
    Jeans: 179,
    Trousers: 229,
    Dresses: 349,
    Jackets: 399,
    Tops: 129,
    Tshirts: 99,
    Sarees: 699,
    Blazers: 499,
    Skirts: 249,
    Shorts: 119,
    'Casual Shoes': 99,
    Heels: 149,
    Belts: 49,
    Scarves: 39,
  };

  const rentalPricePerDay = basePrice[articleType] || 159;
  const securityDeposit = Math.round(rentalPricePerDay * 5);

  return { rentalPricePerDay, securityDeposit };
}

// Main conversion
async function convertCSV() {
  try {
    const csvPath = path.join(__dirname, '../public/data/styles.csv');
    const outputPath = path.join(__dirname, '../lib/products-data.json');

    console.log('[v0] Reading CSV from:', csvPath);

    if (!fs.existsSync(csvPath)) {
      console.error('[v0] CSV file not found at:', csvPath);
      console.error('[v0] Please make sure you have placed styles.csv in /public/data/');
      process.exit(1);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvContent);

    console.log('[v0] Parsed', rows.length, 'products from CSV');

    // Convert to our Product format
    const products = rows
      .map((row) => {
        const id = parseInt(row.id, 10);
        if (isNaN(id)) return null;

        const { rentalPricePerDay, securityDeposit } = calculatePricing(
          row.articleType,
          row.baseColour
        );

        return {
          id,
          gender: row.gender || 'Unisex',
          masterCategory: row.masterCategory || 'Apparel',
          subCategory: row.subCategory || 'Other',
          articleType: row.articleType || 'Other',
          baseColour: row.baseColour || 'Black',
          season: row.season || 'Fall',
          year: parseInt(row.year, 10) || 2020,
          usage: row.usage || 'Casual',
          productDisplay: row.productDisplayName || `Product ${id}`,
          rentalPricePerDay,
          securityDeposit,
        };
      })
      .filter((p) => p !== null);

    console.log('[v0] Converted to', products.length, 'valid products');

    // Generate filter options from actual data
    const filterOptions = {
      gender: [...new Set(products.map((p) => p.gender))].sort(),
      masterCategory: [...new Set(products.map((p) => p.masterCategory))].sort(),
      season: [...new Set(products.map((p) => p.season))].sort(),
      usage: [...new Set(products.map((p) => p.usage))].sort(),
    };

    // Save to JSON
    const output = {
      products,
      filterOptions,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log('[v0] ✓ Successfully converted CSV to:', outputPath);
    console.log('[v0] Total products:', products.length);
    console.log('[v0] Filter options:', filterOptions);
  } catch (error) {
    console.error('[v0] Error converting CSV:', error.message);
    process.exit(1);
  }
}

convertCSV();
