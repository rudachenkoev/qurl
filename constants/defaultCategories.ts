const categories = [
  { name: 'Cafes and restaurants', icon: 'i-heroicons-cake' },
  { name: 'Gifts', icon: 'i-heroicons-gift' },
  { name: 'Entertainment', icon: 'i-heroicons-puzzle-piece' },
  { name: 'Travel', icon: 'i-heroicons-globe-europe-africa' },
  { name: 'Documents and Organizations', icon: 'i-heroicons-document-text' },
  { name: 'Technology and equipment', icon: 'i-heroicons-wrench-screwdriver'},
  { name: 'Home Goods', icon: 'i-heroicons-shopping-bag' },
  { name: 'Series and movies', icon: 'i-heroicons-film' },
  { name: 'Streaming platforms and videos', icon: 'i-heroicons-video-camera' },
  { name: 'Beauty and Health', icon: 'i-heroicons-sparkles' },
  { name: 'Other', icon: 'i-heroicons-question-mark-circle' }
]

export default categories.map(category => ({ ...category, isDefault: true }))
