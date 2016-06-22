//-------------------------------------------------------------------
var listView = {
    path: 'users',
    title: 'Users',
    actions: {
        list: function (req, connexes) { return connexes.users.read(req) },
    },
    normalize: (list) => list.map(item => {
        item.full_name = item.last_name + ', ' + item.first_name
        item.full_name = item.full_name.replace(/(^, )|(, $)/, '')
        return item
    })
}

listView.fields = [
    {
        name: 'username',
        label: 'Username',
        main: true,
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
    {
        name: 'is_superuser',
        label: 'Superuser',
        render: 'boolean',
    },
]

//-------------------------------------------------------------------
var changeView = {
    path: 'users/:id',
    title: 'User',
    actions: {
        get: function (req, connexes) { return connexes.user(req.id).read(req) },
        /* FIXME: delete should throw a warning with related objects (intermediary page) */
        // delete: function (req, connexes) { return connexes.user.delete(req) },
        save: function (req, connexes) { return connexes.user(req.id).update(req) },
    },
    normalize: (data, error) => {
        if (error) {
            if (error.first_name)
                error.full_name = 'First name: ' + error.first_name
            if (error.last_name)
                error.full_name = 'Last name: ' + error.last_name
            throw error
        }
        // full_name
        data.full_name = data.last_name + ', ' + data.first_name
        data.full_name = data.full_name.replace(/(^, )|(, $)/, '')
        return data
    },
    denormalize: (data) => {
        let index = data.full_name.indexOf(',')
        if (index >= 0) {
            data.last_name = data.full_name.slice(0, index)
            data.first_name = data.full_name.slice(index+1)
        } else {
            data.last_name = ''
            data.first_name = ''
        }
        return data
    }
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
                name: 'full_name',
                label: 'Name',
                field: 'String',
                validate: (value, values) => {
                    if (value && value.indexOf(',') < 0) {
                        return 'The required format is: LastName, FirstName'
                    }
                },
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
                props: {
                    helpText: 'Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'
                },
            },
            {
                name: 'is_staff',
                label: 'Staff member',
                field: 'Checkbox',
                props: {
                    helpText: 'Designates whether the user can log into crudl.'
                },
            },
            {
                name: 'is_superuser',
                label: 'Superuser',
                field: 'Checkbox',
                props: {
                    helpText: 'Designates that this user has all permissions without explicitly assigning them.'
                },
            },
        ],
    },
    {
        title: 'More...',
        expanded: false,
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        fields: [
            {
                name: 'date_joined',
                label: 'Date joined',
                readOnly: true,
                field: 'SplitDateTime',
                props: {
                    getTime: (date) => {
                        let T = date.indexOf('T')
                        return date.slice(T+1, T+6)
                    },
                    getDate: (date) => {
                        let T = date.indexOf('T')
                        return date.slice(0, T)
                    },
                }
            },
        ],
    },
    {
        title: 'Password',
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
    }
]

//-------------------------------------------------------------------
var addView = {
    path: 'users/new',
    title: 'New User',
    fieldsets: changeView.fieldsets,
    actions: {
        add: function (req, connexes) { return connexes.users.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
