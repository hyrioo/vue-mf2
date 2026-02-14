// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { Mf2Bundle, createMf2 } from '../../../src'
import Mf2Playground from './components/Mf2Playground.vue'
import Mf2Preview from './components/Mf2Preview.vue'
import Mf2TMessagePartsDemo from './components/Mf2TMessagePartsDemo.vue'
import './style.css'

const docsMf2 = createMf2({
  locale: 'en-US',
  bundles: [
    new Mf2Bundle('en-US').addResource({
      'home.greeting': 'Hello {$name}',
      'home.support': 'Need help? {#helpLink}Open docs{/helpLink}',
      help_and_support:
        'Have you {#bold}forgotten{/bold} your password? {#resetButton/} If you need more help, click {#helpLink}here{/helpLink} for more information.'
    }),
    new Mf2Bundle('fr-FR').addResource({
      'home.greeting': 'Bonjour {$name}',
      'home.support': 'Besoin d\'aide ? {#helpLink}Ouvrir la doc{/helpLink}'
    })
  ]
})

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.use(docsMf2)
    app.component('Mf2Playground', Mf2Playground)
    app.component('Mf2Preview', Mf2Preview)
    app.component('Mf2TMessagePartsDemo', Mf2TMessagePartsDemo)
  }
} satisfies Theme
