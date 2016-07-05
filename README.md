# crudl django example
This is a [crudl](http://crudl.io/) example with [Django](https://www.djangoproject.com/) and [DRF](http://www.django-rest-framework.org/) for the REST-API as well as [Graphene](http://graphene-python.org/) for GraphQL.

## Important notes
* crudl is still under development and the syntax might change (esp. with connectors and descriptors).
* The relevant part for your admin interface is within the folder crudl-admin-rest/admin/ (resp. crudl-admin-graphql/admin/).

## Requirements
* Node.js
* python
* virtualenv
* SQLite

## Installation
1. Create and activate a python **virtual environment**.

2. Clone this repository and cd into the new folder:

    ```
    $ git clone https://github.com/crudlio/crudl-example-django.git
    $ cd crudl-example-django
    ```

3. Install the python requirements:

    ```
    $ pip install -r conf/requirements.txt
    ```

4. Setup the database (SQLite) and add contents:

    ```
    $ python manage.py migrate
    $ python manage.py loaddata apps/blog/fixtures/blog.json
    ```

5. Start the django development server:

    ```
    $ python manage.py runserver
    ```

Open your browser and go to ``http://localhost:8000/crudl-rest/`` or ``http://localhost:8000/crudl-graphql/`` and login with the demo user (demo/demo).

### Install crudl-admin (REST)
In order to change the REST admin interface, you need to build a new bundle ...

Go to /crudl-admin-rest/ and install the npm packages, then run watchify:
```
$ npm install
$ npm run watchify
```

### Install crudl-admin (GraphQL)
In order to change the GraphQL admin interface, you need to build a new bundle ...

Go to /crudl-admin-graphql/ and install the npm packages, then run watchify:
```
$ npm install
$ npm run watchify
```

## URLs
```
/rest-api/          # REST API (DRF)
/graphiql-api/      # GraphQL Query Interface
/crudl-rest/        # Crudl Admin (REST)
/crudl-graphql/     # Crudl Admin (GraphQL)
/admin/             # Django Admin (Grappelli)
```
If you want to use /admin/ you need to create a superuser first.

## Notes
While this example is simple, there's still a couple of more advanced features in order to represent a real-world scenario.

### Connectors and Descriptor
In order for CRUDL to work, you need to define _connectors_ (API endpoints) and a _descriptor_ (visual representation). The _descriptor_ consists of _collections_ and the _authentification_.

Here is the basic structure of a REST connector:
```javascript
{
    id: 'entries',
    url: 'entries/',
    urlQuery,
    pagination,
    transform: {
        readResponseData: data => data.results,
    },
},
```

And here is a similar connector with GraphQL:
```javascript
{
    id: 'entries',
    query: {
        read: `{allEntries{id, title, status, date}}`,
    },
    pagination,
    transform: {
        readResponseData: data => data.data.allEntries.edges.map(e => e.node)
    },
},
```

With collections, you create the visual representation by defining the _listView_ and _changeView_ of each object:
```javascript
var listView = {}
listView.fields = []
listView.filters = []
listView.search = []
var changeView = {}
changeView.fields = []
changeView.tabs = []
var addView = {}
```

### Authentication
Both the REST and GraphQL API is only accessible for logged-in users based on TokenAuthentication.
Authentication for GraphQL is done with a decorator wrapping the basic URL.

Please note the besides the Token, we also add an attribute _authInfo_ in order to subsequently have access to the currently logged-in user (e.g. for filtering).

```javascript
{
    id: 'login',
    url: '/rest-api/login/',
    mapping: { read: 'post', },
    transform: {
        readResponseData: data => ({
            requestHeaders: { 'Authorization': `Token ${data.token}` },
            authInfo: data,
        })
    }
}
```

### Field dependency
When adding or editing an _Entry_, the _Categories_ depend on the selected _Section_.
If you change the field _Section_, the options of field _Category_ are populated based on the chosen _Section_.

```javascript
{
    name: 'category',
    field: 'Autocomplete',
    watch: [
        {
            for: 'section',
            setProps: section => ({
                disabled: !section,
                helpText: !section ? "In order to select a category, you have to select a section first" : "Select a category",
            }),
        }
    ],
    actions: {
        asyncProps: (req, connectors) => {
            /* return the filtered categories */
        }
    },
}
```

You can use the same syntax with list filters (see entries.js).

### Foreign Key, Many-to-Many
There are a couple of foreign keys being used (e.g. _Section_ or _Category_ with _Entry_) and one many-to-many field (_Tags_ with _Entry_).

```javascript
{
    name: 'section',
    label: 'Section',
    field: 'Select',
    actions: {
        asyncProps: (req, connectors) => connectors.sections_options.read(req),
    },
},
{
    name: 'category',
    label: 'Category',
    field: 'Autocomplete',
    actions: {
        /* return the value and label when selecting a category */
        select: (req, connectors) => {
            return Promise.all(req.data.selection.map(item => {
                return connectors.category(item.value).read(req)
                .then(res => res.set('data', {
                    value: res.data.id,
                    label: res.data.name,
                }))
            }))
        },
        /* return the value and a custom label when searching for a category */
        search: (req, connectors) => {
            return connectors.categories.read(req.filter('name', req.data.query)
            .then(res => res.set('data', res.data.map(d => ({
                value: d.id,
                label: `<b>${d.name}</b> (${d.slug})`,
            }))))
        },
    },
},
{
    name: 'tags',
    label: 'Tags',
    field: 'AutocompleteMultiple',
    actions: {},
}
```

### Relation with different endpoint
The collection _Links_ is an example of related objects which are assigned through an intermediary table with additional fields.

```javascript
changeView.tabs = [
    {
        title: 'Links',
        actions: {
            list: (req, connectors) => connectors.links.read(req.filter('entry', req.id)),
            add: (req, connectors) => connectors.links.create(req),
            save: (req, connectors) => connectors.link(req.data.id).update(req),
            delete: (req, connectors) => connectors.link(req.data.id).delete(req)
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
            {
                name: 'id',
                field: 'hidden',
            },
            {
                name: 'entry',
                field: 'hidden',
                initialValue: (context) => context.data.id,
            },
        ],
    },
]
```

### Custom fields
With _Users_, we added a custom field _Name_ which is not part of the database or the API.
The methods _normalize_ and _denormalize_ in order to manipulate the data stream.
```
normalize: (data, error) => {
    data.full_name = data.last_name + ', ' + data.first_name
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
```

### Custom components
We have added a custom component _SplitDateTimeField.jsx_ (see admin/fields) in order to show how you're able to implement fields which are not part of the core package.

### Superuser vs staff user
All 3 _Users_ are able to login to crudl (because is_staff is True). But only superusers (patrick, axel) are allowed to edit all objects. The third user (vaclav) is only able to see and edit his own objects. Besides, only superusers are able to change a users password (user vaclav has no permission to edit his own password).

### Initial values
XXX
```
initialValue: () => {
    let d = new Date()
    return d.toJSON().slice(0, 10)
}
```

XXX
```
initialValue: (context) => context.auth.user
```

### Validate fields and form
XXX
```
validate: (value, allValues) => {
    if (value != allValues.password) {
        return 'The passwords do not match.'
    }
}
```

### Multiple sort with ListView
XXX

### Filter from list result
XXX
If there exist an API call that can return such a list (e.g. /rest-api/users/?has_tag=true) then the implementation is straightforward (using asyncProps).

Without such an API, one would have to make an unpaginated call to /rest-api/tags/ and filter the result in the asyncProps action.

### Filter list
With Users, we only show the currently logged-in user (although the API returns a list of all available users).

```
var listView = {
    path: 'users',
    title: 'Users',
    actions: {
        list: function (req, connectors) {
            return connectors.users.read(req.filter('id', req.authInfo.user))
        },
    },
}
```

## Development
This example mainly shows how to use crudl. It is not intended for development on crudl itself.

## TODO
There is still a long list with open issues, but here are the some of the bigger ones:

* Improve: connectors & descriptors
* Improve: Authentication
* Improve: Finish UI
* Add: Permissions
* Add: Documentation
* Add: Tests
* Add: Internationalization (i18n)
* Add: Dashboard/Menus
* Add: Custom and intermediary pages
* Add: Custom bulk actions
* Add: ListView hierarchies
* Add: Show relations with delete
* Add: Reorder via drag & drop with RelationView and ListView
* Add: RTE
