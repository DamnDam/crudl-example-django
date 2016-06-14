var utils = require('../utils')

function join(p1, p2, var1, var2) {
    return Promise.all([p1, p2])
    .then(responses => {
        return responses[0].set('data', responses[0].data.map(item => {
            item[var1] = responses[1].data.find(obj => obj[var2] == item[var1])
            return item
        }))
    })
}

//-------------------------------------------------------------------
var listView = {
    path: 'entries',
    title: 'Blog Entries',
    actions: {
        list: function (req, cxs) {
            let entries = cxs.entries.read(req)
            let users = cxs.users.read(req.paginate(false))
            let categories = cxs.categories.read(req.filter('limit', 10000))
            return utils.join(utils.join(entries, users, 'user', 'id'), categories, 'category', 'id')
        },
    },
}

listView.fields = [
    {
        name: 'user',
        key: 'user.username',
        label: 'User',
    },
    {
        name: 'title',
        label: 'Title',
        sortable: true,
        sorted: 'ascending',
        sortpriority: '2',
    },
    {
        name: 'date',
        label: 'Date',
    },
    {
        name: 'category',
        key: 'category.name',
        label: 'Category',
        main: true,
        render: 'number',
        sortable: true,
        sorted: 'descending',
        sortpriority: '1',
    }
]

listView.filters = {
    fields: [
        {
            name: 'user',
            label: 'User',
            field: 'Select',
            actions: {
                asyncProps: (req, cxs) => cxs.users_options.read(req),
            },
        },
        {
            name: 'date_gt',
            label: 'Published after',
            field: 'Date',
        },
        {
            name: 'search',
            label: 'Search',
            field: 'Search',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'entries/:id',
    title: 'Blog Entry',
    actions: {
        get: function (req, cxs) { return cxs.entry.read(req) },
        delete: function (req, cxs) { return cxs.entry.delete(req) },
        save: function (req, cxs) { return cxs.entry.update(req) },
    },
}

changeView.fieldsets = [
    {
        fields: [
            {
                name: 'title',
                label: 'Title',
                field: 'Text',
                required: true,
            },
            {
                name: 'user',
                label: 'User',
                field: 'Select',
                initialValue: (context) => context.auth.user,
                props: {
                    canBeNone: true,
                    helpText: 'Select a user'
                },
                actions: {
                    asyncProps: (req, cxs) => cxs.users_options.read(req),
                },
            },
            {
                name: 'category',
                label: 'Category',
                field: 'Autocomplete',
                props: {
                    helpText: "Select a category",
                },
                watch: [
                    {
                        for: 'user',
                        setProps: user => ({
                            disabled: !user,
                            helpText: !user ? "In order to select a category, you have to select a user first" : "Select a category",
                        }),
                    }
                ],
                actions: {
                    select: (req, cxs) => {
                        return Promise.all(req.data.selection.map(item => {
                            return cxs.category.read(req.with('id', item.value))
                            .then(res => res.set('data', {
                                value: res.data.id,
                                label: res.data.name,
                            }))
                        }))
                    },
                    search: (req, cxs) => {
                        if (!req.context.user) {
                            return Promise.resolve({data: []})
                        } else {
                            return cxs.categories.read(req
                                .filter('name', req.data.query)
                                .filter('user', req.context.user))
                            .then(res => res())
                            .then(res => res.set('data', res.data.map(d => ({
                                value: d.id,
                                label: `<b>${d.name}</b> (${d.slug})`,
                            }))))
                        }
                    },
                },
            },
        ],
    },
    {
        title: 'Content',
        expanded: true,
        fields: [
            {
                name: 'date',
                label: 'Date',
                field: 'Datetime',
                initialValue: () => {
                    let d = new Date()
                    return d.toJSON().slice(0, 10)
                }
            },
            {
                name: 'body',
                label: 'Text',
                field: 'Textarea',
            },
            {
                name: 'tags',
                label: 'Tags',
                field: 'Autocomplete',
                props: {
                    multiple: true,
                },
                actions: {
                    search: (req, cxs) => {
                        return cxs.tags_options.read(req)
                        .then(res => res.set('data', res.data.filter(tag => {
                            return tag.label.toLowerCase().indexOf(req.data.query.toLowerCase()) >= 0
                        })))
                    },
                    select: (req, cxs) => {
                        return Promise.all(req.data.selection.map(item => {
                            return cxs.tag.read(req.with('id', item.value))
                            .then(res => res.set('data', {
                                value: res.data.id,
                                label: res.data.name,
                            }))
                        }))
                    },
                },
            }
        ]
    }
]

changeView.tabs = [
    {
        title: 'Links',
        actions: {
            list: (req, cxs) => {
                req.filter("entry", req.id.id)
                req.paginate(false)
                return cxs.links.read(req)
            },
        },
        itemTitle: '{url}',
        fields: [
            {
                name: 'url',
                label: 'URL',
                field: 'URL',
                props: {
                    link: true,
                },
            },
            {
                name: 'title',
                label: 'Title',
                field: 'String',
            },
        ]
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'entries/new',
    title: 'New Blog Entry',
    fieldsets: changeView.fieldsets,
    actions: {
        add: function (req, cxs) { return cxs.entries.create(req) },
    },
}

//-------------------------------------------------------------------
module.exports = {
    listView,
    addView,
    changeView,
}
