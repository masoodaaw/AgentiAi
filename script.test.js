const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeClassList {
  constructor() {
    this.classes = new Set();
  }

  toggle(name, force) {
    if (force) {
      this.classes.add(name);
      return;
    }

    this.classes.delete(name);
  }

  contains(name) {
    return this.classes.has(name);
  }
}

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.textContent = '';
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.checked = false;
    this.attributes = {};
    this.classList = new FakeClassList();
    this.tabIndex = 0;
  }

  set innerHTML(value) {
    if (value === '') {
      this.children = [];
    }
  }

  get innerHTML() {
    return this.children.map((child) => child.textContent).join('');
  }

  appendChild(child) {
    this.children.push(child);
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  dispatch(type, event = {}) {
    this.listeners[type]?.(event);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  focus() {
    this.focused = true;
  }
}

function createHarness(localStorageState = {}) {
  const buttons = ['learn', 'build', 'deploy', 'showcase'].map((focus, index) => {
    const button = new FakeElement(`tab-${focus}`);
    button.dataset.focus = focus;
    button.setAttribute('aria-selected', String(index === 0));
    if (index === 0) {
      button.classList.toggle('is-active', true);
    }
    return button;
  });

  const checkboxes = ['story', 'demo', 'readme', 'deploy'].map((key) => {
    const checkbox = new FakeElement();
    checkbox.dataset.check = key;
    return checkbox;
  });

  const elements = {
    'focus-title': new FakeElement('focus-title'),
    'focus-description': new FakeElement('focus-description'),
    'focus-list': new FakeElement('focus-list'),
    'focus-panel': new FakeElement('focus-panel'),
    'checklist-count': new FakeElement('checklist-count'),
    'checklist-total': new FakeElement('checklist-total'),
  };

  const storage = { ...localStorageState };

  const context = {
    document: {
      querySelectorAll(selector) {
        if (selector === '.focus-button') {
          return buttons;
        }

        if (selector === 'input[type="checkbox"][data-check]') {
          return checkboxes;
        }

        return [];
      },
      getElementById(id) {
        return elements[id];
      },
      createElement() {
        return new FakeElement();
      },
    },
    window: {
      localStorage: {
        getItem(key) {
          return storage[key] ?? null;
        },
        setItem(key, value) {
          storage[key] = value;
        },
      },
    },
    console,
    Array,
    Boolean,
    JSON,
    String,
  };

  const script = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  vm.runInNewContext(script, context);

  return {
    buttons,
    checkboxes,
    elements,
    storage,
  };
}

test('renders the default learn focus with accessible selected state', () => {
  const harness = createHarness();

  assert.equal(harness.elements['focus-title'].textContent, 'Learn the foundations first');
  assert.equal(harness.buttons[0].getAttribute('aria-selected'), 'true');
  assert.equal(harness.buttons[1].getAttribute('aria-selected'), 'false');
  assert.equal(harness.elements['focus-panel'].getAttribute('aria-labelledby'), 'tab-learn');
  assert.equal(harness.elements['checklist-total'].textContent, '4');
});

test('updates the focus panel and tab state when another focus is selected', () => {
  const harness = createHarness();

  harness.buttons[1].dispatch('click');

  assert.equal(harness.elements['focus-title'].textContent, 'Build one clear application');
  assert.equal(harness.buttons[1].getAttribute('aria-selected'), 'true');
  assert.equal(harness.buttons[1].tabIndex, 0);
  assert.equal(harness.buttons[0].getAttribute('aria-selected'), 'false');
  assert.equal(harness.elements['focus-panel'].getAttribute('aria-labelledby'), 'tab-build');
  assert.deepEqual(
    harness.elements['focus-list'].children.map((child) => child.textContent),
    [
      'Pick a narrow user problem worth solving',
      'Design inputs, tool calls, and outputs carefully',
      'Add validation and human-in-the-loop checkpoints',
    ],
  );
});

test('persists checklist updates in localStorage and updates the summary', () => {
  const harness = createHarness({ 'agentiai-checklist': JSON.stringify({ story: true }) });

  assert.equal(harness.checkboxes[0].checked, true);
  assert.equal(harness.elements['checklist-count'].textContent, '1');

  harness.checkboxes[1].checked = true;
  harness.checkboxes[1].dispatch('change');

  assert.equal(harness.elements['checklist-count'].textContent, '2');
  assert.equal(
    harness.storage['agentiai-checklist'],
    JSON.stringify({ story: true, demo: true }),
  );
});

test('ignores valid JSON checklist values that are not objects', () => {
  const harness = createHarness({ 'agentiai-checklist': JSON.stringify(true) });

  assert.equal(harness.checkboxes[0].checked, false);
  assert.equal(harness.elements['checklist-count'].textContent, '0');
});
