import { getProducts } from './src/lib/mock-api.ts';

async function test() {
  const all = await getProducts();
  console.log("All products without search:", all.length);
  
  const search = await getProducts({ search: "Titanium Dioxide" });
  console.log("Search Titanium Dioxide:", search.length);
  
  const cat = await getProducts({ category: "Inorganic Chemicals" });
  console.log("Category Inorganic Chemicals:", cat.length);
}

test();
