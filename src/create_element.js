//


/**
 * @param  {String} name
 * @param  {Map<String,String>} attributes
 * @param  {Array<Node>} children
 * @param  {Map<String,Function<Event>>} events
 * @return {HTMLElement}
 */
export function create_element(name, attributes, children, events) {
    const element = document.createElement(name);
    for (const attr of (attributes || new Map()).entries()) element.setAttribute(attr[0], attr[1]);
    (children || []).forEach(v => element.appendChild(v));
    for (const listener of (events || new Map()).entries()) element.addEventListener(listener[0], listener[1]);
    return element;
}
