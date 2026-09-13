const focusContent = {
  learn: {
    title: 'Learn the foundations first',
    description:
      'Start with agents, tools, prompts, memory, planning, and evaluation so you understand how modern AI-assisted software systems actually work.',
    items: [
      'Study agent loops, tools, and memory patterns',
      'Compare chatbots, workflows, and full agents',
      'Practice prompt design and evaluation habits',
    ],
  },
  build: {
    title: 'Build one clear application',
    description:
      'Choose a focused use case and implement a small but real product that uses structured prompts, task flow, and review loops.',
    items: [
      'Pick a narrow user problem worth solving',
      'Design inputs, tool calls, and outputs carefully',
      'Add validation and human-in-the-loop checkpoints',
    ],
  },
  deploy: {
    title: 'Deploy with confidence',
    description:
      'Treat deployment as part of the learning process so your portfolio shows shipping ability, not only experimentation.',
    items: [
      'Prepare a public landing page and clean README',
      'Use a repeatable publishing workflow',
      'Verify the experience from a new visitor’s perspective',
    ],
  },
  showcase: {
    title: 'Show your Agentic AI ability publicly',
    description:
      'Explain what the system does, why you made certain tradeoffs, and what the next iteration would improve.',
    items: [
      'Document architecture and decisions clearly',
      'Record what you learned during development',
      'Highlight measurable outcomes and future iterations',
    ],
  },
};

const storageKey = 'agentiai-checklist';
const buttons = document.querySelectorAll('.focus-button');
const focusTitle = document.getElementById('focus-title');
const focusDescription = document.getElementById('focus-description');
const focusList = document.getElementById('focus-list');
const focusPanel = document.getElementById('focus-panel');
const checkboxes = document.querySelectorAll('input[type="checkbox"][data-check]');
const checklistCount = document.getElementById('checklist-count');
const checklistTotal = document.getElementById('checklist-total');

function renderFocus(focus) {
  const content = focusContent[focus];

  if (!content) {
    return;
  }

  focusTitle.textContent = content.title;
  focusDescription.textContent = content.description;
  focusList.innerHTML = '';

  content.items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    focusList.appendChild(listItem);
  });

  buttons.forEach((button) => {
    const isActive = button.dataset.focus === focus;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;

    if (isActive) {
      focusPanel.setAttribute('aria-labelledby', button.id);
    }
  });
}

function loadChecklist() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || '{}');
  } catch (error) {
    return {};
  }
}

function saveChecklist(state) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateChecklistSummary() {
  const completed = Array.from(checkboxes).filter((checkbox) => checkbox.checked).length;
  checklistCount.textContent = String(completed);
  checklistTotal.textContent = String(checkboxes.length);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    renderFocus(button.dataset.focus);
  });

  button.addEventListener('keydown', (event) => {
    const currentIndex = Array.from(buttons).indexOf(button);

    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + offset + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];

    renderFocus(nextButton.dataset.focus);
    nextButton.focus();
  });
});

const checklistState = loadChecklist();

checkboxes.forEach((checkbox) => {
  checkbox.checked = Boolean(checklistState[checkbox.dataset.check]);

  checkbox.addEventListener('change', () => {
    checklistState[checkbox.dataset.check] = checkbox.checked;
    saveChecklist(checklistState);
    updateChecklistSummary();
  });
});

renderFocus('learn');
updateChecklistSummary();
