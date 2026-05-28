import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Rook Money',
    short_name:       'Rook',
    description:      'Seu dinheiro no movimento certo.',
    start_url:        '/dashboard',
    display:          'standalone',
    orientation:      'portrait',
    background_color: '#020f21',
    theme_color:      '#020f21',
    lang:             'pt-BR',
    categories:       ['finance', 'productivity'],
    icons: [
      {
        src:     '/icon-192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/icon-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/SVG/FAVICON.svg',
        sizes:   'any',
        type:    'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name:        'Nova transação',
        short_name:  'Transação',
        description: 'Registrar nova transação',
        url:         '/transactions?new=1',
        icons:       [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name:        'Relatórios',
        short_name:  'Relatórios',
        description: 'Ver relatórios financeiros',
        url:         '/reports',
        icons:       [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
