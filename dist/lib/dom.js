export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function requireDocument(value) {
    if (!isRecord(value) || typeof value.createElement !== 'function') {
        throw new TypeError('document must provide createElement');
    }
    return value;
}
export function requireElement(value, name) {
    if (!isRecord(value) || typeof value.appendChild !== 'function') {
        throw new TypeError(`${name} must be a DOM element`);
    }
    return value;
}
export function ensureRelativeMount(mount) {
    const previous = mount.style.position;
    if (previous === '' || previous === 'static') {
        mount.style.position = 'relative';
        return () => {
            mount.style.position = previous;
        };
    }
    return () => { };
}
export function invokeSafely(operation, onError) {
    try {
        Promise.resolve(operation()).catch((error) => onError?.(error));
    }
    catch (error) {
        onError?.(error);
    }
}
