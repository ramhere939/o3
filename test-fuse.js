import Fuse from 'fuse.js';

const products = [
  { id: '1', name: 'Sodium Bicarbonate (Food Grade)', category: 'Inorganic Chemicals' },
  { id: '2', name: 'Sodium Sulphate (Anhydrous)', category: 'Inorganic Chemicals' },
  { id: '3', name: 'Sodium Lauryl Sulphate (SLS)', category: 'Inorganic Chemicals' },
  { id: '4', name: 'Sodium Chlorate', category: 'Inorganic Chemicals' },
  { id: '5', name: 'Sodium Tripolyphosphate (STPP)', category: 'Inorganic Chemicals' },
  { id: '6', name: 'Sodium Thiosulphate Pentahydrate', category: 'Inorganic Chemicals' },
];

const fuse = new Fuse(products, {
  keys: ['name', 'category'],
  threshold: 0.5,
  ignoreLocation: true,
  ignoreFieldNorm: true,
  useExtendedSearch: true,
});

const results = fuse.search('Sodium Hydroxide (Caustic Soda)');
console.log('Results with extended search:', results.length);

const fuse2 = new Fuse(products, {
  keys: ['name', 'category'],
  threshold: 0.5,
  ignoreLocation: true,
  ignoreFieldNorm: true,
});

const results2 = fuse2.search('Sodium Hydroxide (Caustic Soda)');
console.log('Results without extended search:', results2.map(r => r.item.name));

const words = 'Sodium Hydroxide (Caustic Soda)'.replace(/[\(\)]/g, '').split(' ').filter(Boolean).join(' | ');
const results3 = fuse.search(words);
console.log('Results with OR extended search:', results3.map(r => r.item.name));
