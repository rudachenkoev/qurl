const categories = [
  { name: 'Cafes and restaurants' },
  { name: 'Gifts' },
  { name: 'Entertainment' },
  { name: 'Travel' },
  { name: 'Documents and Organizations' },
  { name: 'Technology and equipment' },
  { name: 'Home Goods' },
  { name: 'Series and movies' },
  { name: 'Streaming platforms and videos' },
  { name: 'Beauty and Health' }
]

export default categories.map(category => ({ ...category, isDefault: true }))
