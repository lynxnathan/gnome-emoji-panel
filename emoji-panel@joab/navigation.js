export function moveGridIndex(index, count, columns, dx, dy) {
    if (!Number.isInteger(count) || count <= 0 ||
        !Number.isInteger(columns) || columns <= 0)
        return -1;

    const current = Number.isInteger(index)
        ? Math.max(0, Math.min(index, count - 1))
        : 0;
    const row = Math.floor(current / columns);
    const column = current % columns;
    const rowStart = row * columns;
    const rowEnd = Math.min(rowStart + columns, count) - 1;

    if (dx !== 0) {
        if (dy !== 0)
            return current;
        return Math.max(rowStart, Math.min(current + Math.sign(dx), rowEnd));
    }
    if (dy === 0)
        return current;

    const rows = Math.ceil(count / columns);
    const nextRow = Math.max(0, Math.min(row + Math.sign(dy), rows - 1));
    const nextStart = nextRow * columns;
    const nextEnd = Math.min(nextStart + columns, count) - 1;
    return Math.min(nextStart + column, nextEnd);
}

const ARROW_DIRECTIONS = new Map([
    ['Left', [-1, 0]],
    ['Right', [1, 0]],
    ['Up', [0, -1]],
    ['Down', [0, 1]],
    ['KP_Left', [-1, 0]],
    ['KP_Right', [1, 0]],
    ['KP_Up', [0, -1]],
    ['KP_Down', [0, 1]],
]);

export function resolvePanelKey(key, {
    hasSystemModifier = false,
    shift = false,
    searchFocused = false,
    hasSelection = true,
    hasItems = true,
} = {}) {
    if (hasSystemModifier)
        return {action: 'propagate'};

    if (key === 'Escape')
        return {action: 'close'};

    if (key === 'Return' || key === 'KP_Enter')
        return hasSelection ? {action: 'insert'} : {action: 'propagate'};

    if (key === 'Tab' || key === 'ISO_Left_Tab') {
        const backwards = key === 'ISO_Left_Tab' || shift;
        return {action: 'switch-tab', step: backwards ? -1 : 1};
    }

    const direction = ARROW_DIRECTIONS.get(key);
    if (direction)
        return hasSelection && !shift
            ? {action: 'move', dx: direction[0], dy: direction[1]}
            : {action: 'propagate'};

    if (key === 'Home' || key === 'End') {
        if (searchFocused || !hasItems)
            return {action: 'propagate'};
        return {action: 'jump', edge: key === 'Home' ? 'first' : 'last'};
    }

    return {action: 'propagate'};
}
