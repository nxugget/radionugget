import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RadioNugget',
    short_name: 'RadioNugget',
    description: 'Articles et outils sur la radio et les satellites',
    start_url: '/en',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#b400ff',
    icons: [
      {
        src: '/images/icon/satellite-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/images/icon/satellite-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
