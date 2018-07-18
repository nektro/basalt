# src/create_element.js

[^1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[^2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[^3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[^4]: https://developer.mozilla.org/en-US/docs/Web/API/Element
[^5]: https://developer.mozilla.org/en-US/docs/Web/API/Event

## `create_element(name, attributes, children, events)`
- Parameters
    - `name`
        - `String`[^1]
        - the name of the element
    - `attributes`
        - `Map<String,String>`[^2][^1]
        - ***Optional***
        - Key-Value map of attributes
    - `children`
        - `Array<Element>`[^3] [^4]
        - ***Optional***
        - List of childen to be appended to this element
    - `events`
        - `Map<String,Function<Event>>`[^2] [^1] [^5]
        - ***Optional***
        - Key-Value map of event-types and callback handlers
- Returns
    - `Element`
    - The composed element with all added values
