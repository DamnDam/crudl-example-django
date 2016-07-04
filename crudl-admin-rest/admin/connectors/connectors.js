import { pagination, urlQuery } from '../utils'

module.exports = [

    // USERS
    {
        id: 'users',
        url: 'users/',
        pagination,
        transform: { readResponseData: data => data.results },
    },
    {
        id: 'user',
        url: 'users/:id/',
    },

    // SECTIONS
    {
        id: 'sections',
        url: 'sections/',
        urlQuery,
        pagination,
        transform: { readResponseData: data => data.results },
    },
    {
        id: 'section',
        url: 'sections/:id/',
    },

    // CATEGORIES
    {
        id: 'categories',
        url: 'categories/',
        urlQuery,
        pagination,
        enableDepagination: true,
        transform: { readResponseData: data => data.results },
    },
    {
        id: 'category',
        url: 'categories/:id/',
    },
    {
        id: 'allCategories',
        use: 'categories',
    },

    // TAGS
    {
        id: 'tags',
        url: 'tags/',
        urlQuery,
        pagination,
        transform: { readResponseData: data => data.results },
    },
    {
        id: 'tag',
        url: 'tags/:id/',
    },

    // ENTRIES
    {
        id: 'entries',
        url: 'entries/',
        urlQuery,
        pagination,
        transform: { readResponseData: data => data.results },
    },
    {
        id: 'entry',
        url: 'entries/:id/',
    },

    // ENTRIELINKS
    {
        id: 'links',
        url: 'entrylinks/',
        pagination,
        enableDepagination: true,
        transform: { readResponseData: data => data.results },
    },
    {
        id: 'link',
        url: 'entrylinks/:id/',
    },

    // SPECIAL CONNECTORS

    // sections_options
    // a helper for retrieving the sections used with select fields
    {
        id: 'sections_options',
        url: 'sections/',
        transform: {
            readResponseData: data => ({
                options: data.results.map(function(item) {
                    return { value: item.id, label: item.name }
                }),
            })
        },
    },

    // category_options
    // a helper for retrieving the categories used with select fields
    {
        id: 'categories_options',
        url: 'categories/',
        transform: {
            readResponseData: data => ({
                options: data.results.map(function(item) {
                    return { value: item.id, label: item.name }
                }),
            })
        },
    },

    // tags_options
    // a helper for retrieving the tags used with select fields
    {
        id: 'tags_options',
        url: 'tags/',
        transform: {
            readResponseData: data => ({
                options: data.results.map(function(item) {
                    return { value: item.id, label: item.name }
                }),
            })
        },
    },

    // AUTHENTICATION
    {
        id: 'login',
        url: '/rest-api/login/',
        mapping: { read: 'post', },
        transform: {
            readResponseData: data => ({
                requestHeaders: { "Authorization": `Token ${data.token}` },
                authInfo: data,
            })
        }
    },

]
