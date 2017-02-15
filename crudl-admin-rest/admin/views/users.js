import React from 'react'
import SplitDateTimeField from '../fields/SplitDateTimeField'

//-------------------------------------------------------------------
var listView = {
    path: 'users',
    title: 'Users',
    actions: {
        list: function (req) {
            return crudl.connectors.users.read(req)
        },
    },
    normalize: (list) => list.map(item => {
        if (!item.last_name) {
            item.full_name = item.first_name
        } else if (!item.first_name) {
            item.full_name = <span><b>{item.last_name}</b></span>
        } else {
            item.full_name = <span><b>{item.last_name}</b>, {item.first_name}</span>
        }
        return item
    })
}

listView.fields = [
    {
        name: 'id',
        label: 'ID',
    },
    {
        name: 'username',
        label: 'Username',
        main: true,
        sortable: false,
        sorted: 'ascending',
        // When avatars are part of API response then do e.g.:
        // render: (username, all) => `<img src="${all.avatar}"/> ${username}`
        // render: (username, all) => `<img src="https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-32.png"/> ${username}`
    },
    {
        name: 'full_name',
        label: 'Full name',
    },
    {
        name: 'email',
        label: 'Email address',
    },
    {
        name: 'is_active',
        label: 'Active',
        render: 'boolean',
    },
    {
        name: 'is_staff',
        label: 'Staff member',
        render: 'boolean',
    },
]

//-------------------------------------------------------------------
var changeView = {
    path: 'users/:id',
    title: 'User',
    actions: {
        get: function (req) { return crudl.connectors.user(crudl.path.id).read(req) },
        save: function (req) { return crudl.connectors.user(crudl.path.id).update(req) },
    },
}

changeView.fieldsets = [
    {
        fields: [
            {
                name: 'username',
                label: 'Username',
                field: 'String',
            },
        ],
    },
    {
        fields: [
            {
                name: 'first_name',
                label: 'Name',
                field: 'String',
            },
            {
                name: 'last_name',
                label: 'Last Name',
                field: 'String',
            },
            {
                name: 'email',
                label: 'Email address',
                field: 'String',
                readOnly: () => crudl.auth.username !== crudl.context('username'),
            }
        ],
    },
    {
        title: 'Roles',
        expanded: true,
        description: () => {
            if (crudl.auth.username == crudl.context('username')) {
                return <span style={{color: '#CC293C'}}>WARNING: If you remove crudl access for the currently logged-in user, you will be logged out and unable to login with this user again.</span>
            }
        },
        fields: [
            {
                name: 'is_active',
                label: 'Active',
                field: 'Checkbox',
                initialValue: true,
                helpText: 'Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'
            },
            {
                name: 'is_staff',
                label: 'Staff member',
                field: 'Checkbox',
                helpText: 'Designates whether the user can log into crudl.'
            },
        ],
    },
    {
        title: 'More...',
        expanded: false,
        description: 'This is an example of a custom field (see admin/fields/SplitDateTimeField.jsx).',
        fields: [
            {
                name: 'date_joined',
                label: 'Date joined',
                readOnly: true,
                field: SplitDateTimeField,
                getTime: (date) => {
                    let T = date.indexOf('T')
                    return date.slice(T+1, T+6)
                },
                getDate: (date) => {
                    let T = date.indexOf('T')
                    return date.slice(0, T)
                },
            },
        ],
    },
    {

        title: 'Password',
        hidden: () => crudl.auth.username !== crudl.context('username'),
        expanded: false,
        description: "Raw passwords are not stored, so there is no way to see this user's password, but you can set a new password.",
        fields: [
            {
                name: 'password',
                label: 'Password',
                field: 'Password',
            },
            {
                name: 'password_confirm',
                label: 'Password (Confirm)',
                field: 'Password',
                validate: (value, allValues) => {
                    if (value != allValues.password) {
                        return 'The passwords do not match.'
                    }
                }
            },
        ]
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'users/new',
    title: 'New User',
    actions: {
        add: function (req) { return crudl.connectors.users.create(req) },
    },
}

addView.fieldsets = [
    {
        fields: [
            {
                name: 'username',
                label: 'Username',
                field: 'String',
            },
        ],
    },
    {
        fields: [
            {
                name: 'first_name',
                label: 'Name',
                field: 'String',
            },
            {
                name: 'last_name',
                label: 'Last Name',
                field: 'String',
            },
            {
                name: 'email',
                label: 'Email address',
                field: 'String',
            }
        ],
    },
    {
        title: 'Roles',
        expanded: true,
        fields: [
            {
                name: 'is_active',
                label: 'Active',
                field: 'Checkbox',
                initialValue: true,
                helpText: 'Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'
            },
            {
                name: 'is_staff',
                label: 'Staff member',
                field: 'Checkbox',
                helpText: 'Designates whether the user can log into crudl.'
            },
        ],
    },
    {

        title: 'Password',
        expanded: true,
        fields: [
            {
                name: 'password',
                label: 'Password',
                field: 'Password',
            },
            {
                name: 'password_confirm',
                label: 'Password (Confirm)',
                field: 'Password',
                validate: (value, allValues) => {
                    if (value != allValues.password) {
                        return 'The passwords do not match.'
                    }
                }
            },
        ]
    },
]


module.exports = {
    listView,
    changeView,
    addView,
}
