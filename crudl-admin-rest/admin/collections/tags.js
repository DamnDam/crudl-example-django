import { slugify } from '../utils'

//-------------------------------------------------------------------
var listView = {
    path: 'tags',
    title: 'Tags',
    actions: {
        list: function (req) { return crudl.connectors.tags.read(req) }
    }
}

listView.fields = [
    {
        name: 'id',
        label: 'ID',
    },
    {
        name: 'name',
        label: 'Name',
        main: true,
        sortable: true,
        sorted: 'ascending',
        sortpriority: '1',
    },
    {
        name: 'slug',
        label: 'Slug',
        sortable: true,
    },
    {
        name: 'counter_entries',
        label: 'No. Entries',
    },
]

listView.search = {
    name: 'search',
}

//-------------------------------------------------------------------
var changeView = {
    path: 'tags/:id',
    title: 'Tag',
    actions: {
        get: function (req) { return crudl.connectors.tag(req.id).read(req) },
        delete: function (req) { return crudl.connectors.tag(req.id).delete(req) },
        save: function (req) { return crudl.connectors.tag(req.id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'name',
        label: 'Name',
        field: 'String',
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
        readOnly: true,
        onChange: {
            in: 'name',
            setInitialValue: (name) => slugify(name.value),
        },
        props: {
            helpText: `Slug is automatically generated when saving the Tag.`,
        }
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'tags/new',
    title: 'New Tag',
    fields: changeView.fields,
    actions: {
        add: function (req) { return crudl.connectors.tags.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
