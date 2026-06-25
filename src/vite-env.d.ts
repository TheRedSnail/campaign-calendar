/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Typed as IconifyJSON so vue-tsc doesn't deep-infer the 500KB+ JSON literal.
declare module '@iconify-json/lucide/icons.json' {
  import type { IconifyJSON } from '@iconify/vue'
  const data: IconifyJSON
  export default data
}
