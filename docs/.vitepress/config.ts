import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Vue-MF2',
    description: 'A VitePress Site',
    base: '/vue-mf2/',
    vite: {
        esbuild: {
            jsx: 'automatic',
            jsxImportSource: 'vue',
        },
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
            {text: 'Get started', link: '/guide/introduction/getting-started'},
        ],

        search: {
            provider: 'local'
        },

        sidebar: [
            {
                text: 'Introduction',
                items: [
                    {text: 'Installation', link: 'guide/introduction/installation'},
                    {text: 'Getting started', link: 'guide/introduction/getting-started'}
                ]
            },
            {
                text: 'Basics',
                items: [
                    {text: 'Markups', link: '/guide/advanced/markups'},
                    {text: 'Functions', link: '/guide/advanced/functions'},
                ],
            },
            {
                text: 'Advanced',
                items: [
                    {text: 'Custom Functions', link: '/guide/advanced/custom-functions'},
                    {text: 'Message parts', link: '/guide/advanced/message-parts'},
                    {text: 'Runtime API Examples', link: '/api-examples'},
                ],
            },
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/hyrioo/vue-mf2'},
        ],
    },
});
