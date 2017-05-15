import { slugify } from '../utils'
import React from 'react'

import { list, detail, options } from '../connectors'

const sections = list('sections');
const section = detail('sections'); // The id parameter is not yet bound


//-------------------------------------------------------------------
var listView = {
    path: 'sections',
    title: 'Sections',
    actions: {
        list: sections.read,
    },
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
        sortKey: 'slug',
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

listView.bulkActions = {
    delete: {
        description: 'Delete selected',
        modalConfirm: {
            message: "All the selected items will be deleted. This action cannot be reversed!",
            modalType: 'modal-delete',
            labelConfirm: "Delete All",
        },
        action: (selection) => {
            return Promise.all(selection.map(
                item => section(item.id).delete(crudl.req()))
            )
            .then(() => crudl.successMessage(`All items (${selection.length}) were deleted`))
        },
    }
}

//-------------------------------------------------------------------
var changeView = {
    path: 'sections/:id',
    title: 'Section',
    actions: {
        get: req => section(crudl.path.id).read(req),
        delete: req => section(crudl.path.id).delete(req),
        save: req => section(crudl.path.id).update(req),
    },
}

changeView.fields = [
    {
        name: 'name',
        label: 'Name',
        field: 'String',
        required: true
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
        onChange: {
            in: 'name',
            setInitialValue: (name) => slugify(name.value),
        },
        helpText: <span>If left blank, the slug will be automatically generated.
        More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'sections/new',
    title: 'New Section',
    fields: changeView.fields,
    actions: {
        add: sections.create,
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
