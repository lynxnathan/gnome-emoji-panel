import test from 'node:test';
import assert from 'node:assert/strict';
import {moveGridIndex, resolvePanelKey} from '../emoji-panel@joab/navigation.js';

test('left and right move within a row and stop at its edges', () => {
    assert.equal(moveGridIndex(4, 8, 3, -1, 0), 3);
    assert.equal(moveGridIndex(5, 8, 3, 1, 0), 5);
    assert.equal(moveGridIndex(3, 8, 3, -1, 0), 3);
});

test('up and down preserve the column when possible', () => {
    assert.equal(moveGridIndex(4, 8, 3, 0, -1), 1);
    assert.equal(moveGridIndex(1, 8, 3, 0, 1), 4);
});

test('vertical movement clamps to the final item in a short row', () => {
    assert.equal(moveGridIndex(5, 8, 3, 0, 1), 7);
    assert.equal(moveGridIndex(7, 8, 3, 0, -1), 4);
});

test('empty grids have no selection to move', () => {
    assert.equal(moveGridIndex(0, 0, 3, 0, 1), -1);
});

test('invalid selection starts at the first item', () => {
    assert.equal(moveGridIndex(-1, 8, 3, 1, 0), 1);
});

test('arrow keys and keypad arrows move the emoji selection', () => {
    assert.deepEqual(resolvePanelKey('Left'), {action: 'move', dx: -1, dy: 0});
    assert.deepEqual(resolvePanelKey('KP_Down'), {action: 'move', dx: 0, dy: 1});
});

test('shifted arrows and arrows without a selection propagate', () => {
    assert.deepEqual(resolvePanelKey('Right', {shift: true}), {action: 'propagate'});
    assert.deepEqual(resolvePanelKey('Right', {hasSelection: false}), {action: 'propagate'});
});

test('enter inserts the selection and escape closes the panel', () => {
    assert.deepEqual(resolvePanelKey('Return'), {action: 'insert'});
    assert.deepEqual(resolvePanelKey('KP_Enter'), {action: 'insert'});
    assert.deepEqual(resolvePanelKey('Return', {hasSelection: false}), {action: 'propagate'});
    assert.deepEqual(resolvePanelKey('Escape'), {action: 'close'});
});

test('tab switches categories forward and backward', () => {
    assert.deepEqual(resolvePanelKey('Tab'), {action: 'switch-tab', step: 1});
    assert.deepEqual(resolvePanelKey('Tab', {shift: true}), {action: 'switch-tab', step: -1});
    assert.deepEqual(resolvePanelKey('ISO_Left_Tab'), {action: 'switch-tab', step: -1});
});

test('home and end jump to grid edges unless search is focused', () => {
    assert.deepEqual(resolvePanelKey('Home'), {action: 'jump', edge: 'first'});
    assert.deepEqual(resolvePanelKey('End'), {action: 'jump', edge: 'last'});
    assert.deepEqual(resolvePanelKey('Home', {searchFocused: true}), {action: 'propagate'});
    assert.deepEqual(resolvePanelKey('End', {hasItems: false}), {action: 'propagate'});
});

test('system shortcuts and unrelated keys propagate', () => {
    assert.deepEqual(resolvePanelKey('Left', {hasSystemModifier: true}), {action: 'propagate'});
    assert.deepEqual(resolvePanelKey('A'), {action: 'propagate'});
});
