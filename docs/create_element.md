# `create_element.js`

## `create_element(name, attributes, children, events)`
- Parameters
    - `name`
        - `String`
        - the name of the element
    - `attributes`
        - `Map<String,String>`
        - ***Optional***
        - Key-Value map of attributes
    - `children`
        - `Array<Element>`
        - ***Optional***
        - List of childen to be appended to this element
    - `events`
        - `Map<String,Function<Event>>`
        - ***Optional***
        - Key-Value map of event-types and callback handlers
- Returns
    - `Element`
    - The composed element with all added values
