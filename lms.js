const courseUrl = '/courses/security-engineering/course.json';
const progressKey = 'opencompSecurity101Progress_v1';
const navRoot = document.querySelector('#module-navigation');
let course;
let lessons = [];
let currentIndex = 0;
let progress = {};

try {
  progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
} catch {
  localStorage.removeItem(progressKey);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function lessonId(index) {
  return `lesson-${index + 1}`;
}

function isComplete(index) {
  const state = progress[lessonId(index)] || {};
  return Boolean(state.quiz && state.practice);
}

function completedCount() {
  return lessons.filter((_, index) => isComplete(index)).length;
}

function persist() {
  localStorage.setItem(progressKey, JSON.stringify(progress));
  renderProgress();
  renderCompletion();
}

function renderProgress() {
  const count = completedCount();
  document.querySelector('#lms-progress-label').textContent = `${count} of ${lessons.length} lessons complete`;
  document.querySelector('#lms-progress-percent').textContent = `${Math.round((count / lessons.length) * 100)}%`;
  document.querySelector('#course-progress').value = count;
  navRoot.querySelectorAll('[data-lesson]').forEach((button) => {
    const index = Number(button.dataset.lesson);
    button.dataset.complete = String(isComplete(index));
    button.setAttribute('aria-current', index === currentIndex ? 'step' : 'false');
    button.setAttribute('aria-label', `${button.dataset.title}${isComplete(index) ? ', complete' : ''}`);
  });
}

function renderNotes(lesson) {
  const root = document.querySelector('#lesson-notes');
  root.replaceChildren(...lesson.notes.map((paragraph) => el('p', '', paragraph)));
}

function renderVideo(lesson) {
  const panel = document.querySelector('#video-panel');
  const root = document.querySelector('#video-frame-wrap');
  root.replaceChildren();
  panel.hidden = !lesson.video;
  if (!lesson.video) return;
  const frame = el('iframe', 'lesson-video');
  frame.src = lesson.video.embed;
  frame.title = lesson.video.title;
  frame.loading = 'lazy';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allow = 'accelerometer; encrypted-media; picture-in-picture; web-share';
  frame.allowFullscreen = true;
  root.append(frame);
  document.querySelector('#video-attribution').textContent = `${lesson.video.title} · ${lesson.video.provider}`;
}

function markStep(step) {
  const state = progress[lessonId(currentIndex)] || {};
  state[step] = true;
  progress[lessonId(currentIndex)] = state;
  persist();
}

function worksheetKey() {
  return `${progressKey}:worksheet:${lessonId(currentIndex)}`;
}

function maybeCompletePractice() {
  const state = progress[lessonId(currentIndex)] || {};
  let answers = [];
  try { answers = JSON.parse(localStorage.getItem(worksheetKey()) || '[]'); } catch { /* Ignore invalid saved notes. */ }
  const prompts = lessons[currentIndex].lesson.practice.reflection || [];
  if (state.scenario && prompts.length && prompts.every((_, index) => (answers[index] || '').trim().length >= 30)) {
    state.practice = true;
    progress[lessonId(currentIndex)] = state;
    persist();
  }
}

function feedbackNode(className) {
  const feedback = el('p', className);
  feedback.setAttribute('aria-live', 'polite');
  return feedback;
}

function renderQuiz(lesson) {
  const root = document.querySelector('#quiz-content');
  root.replaceChildren();
  const form = el('form', 'quiz-form');
  form.append(el('p', 'quiz-question', lesson.quiz.question));
  const options = el('div', 'quiz-options');
  lesson.quiz.options.forEach((answer, index) => {
    const label = el('label', 'quiz-option');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'lesson-answer';
    input.value = String(index);
    input.required = true;
    label.append(input, el('span', '', answer));
    options.append(label);
  });
  const submit = el('button', 'button button-dark quiz-submit', 'Check my answer');
  submit.type = 'submit';
  const feedback = feedbackNode('quiz-feedback');
  if (progress[lessonId(currentIndex)]?.quiz) {
    feedback.textContent = 'You passed this check already. You can try it again or continue.';
    feedback.dataset.state = 'correct';
  }
  form.append(options, submit, feedback);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = form.querySelector('input:checked');
    if (!selected) return;
    const correct = Number(selected.value) === lesson.quiz.answer;
    feedback.textContent = `${correct ? 'Correct. ' : 'Not quite. '}${lesson.quiz.explanation}`;
    feedback.dataset.state = correct ? 'correct' : 'try-again';
    if (correct) markStep('quiz');
  });
  root.append(form);
}

function renderScenarioPractice(practice, root) {
  root.append(el('p', 'practice-prompt', practice.prompt));
  const form = el('form', 'scenario-form');
  const options = el('div', 'quiz-options');
  practice.options.forEach((answer, index) => {
    const label = el('label', 'quiz-option');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'scenario-answer';
    input.value = String(index);
    input.required = true;
    label.append(input, el('span', '', answer));
    options.append(label);
  });
  const submit = el('button', 'button button-dark practice-submit', 'Try this decision');
  submit.type = 'submit';
  const feedback = feedbackNode('practice-feedback');
  if (progress[lessonId(currentIndex)]?.practice) {
    feedback.textContent = 'You completed this activity already. You can try it again or continue.';
    feedback.dataset.state = 'correct';
  }
  form.append(options, submit, feedback);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = form.querySelector('input:checked');
    if (!selected) return;
    const correct = Number(selected.value) === practice.answer;
    feedback.textContent = `${correct ? 'That’s the safer choice. ' : 'Try again. '}${practice.explanation}`;
    feedback.dataset.state = correct ? 'correct' : 'try-again';
    if (correct) {
      markStep('scenario');
      maybeCompletePractice();
    }
  });
  root.append(form);
}

function renderWorksheet(practice, root) {
  if (!practice.reflection?.length) return;
  const worksheet = el('div', 'lesson-worksheet');
  worksheet.append(el('h3', '', 'Write it down'));
  worksheet.append(el('p', 'worksheet-intro', 'Use the prompts to connect the idea to a real design decision. Write one or two sentences for each; your answers stay in this browser.'));
  let answers = [];
  try { answers = JSON.parse(localStorage.getItem(worksheetKey()) || '[]'); } catch { answers = []; }
  const fields = practice.reflection.map((prompt, index) => {
    const label = el('label', 'worksheet-field');
    label.append(el('strong', '', `Step ${index + 1}`), el('span', '', prompt));
    const input = document.createElement('textarea');
    input.rows = index === practice.reflection.length - 1 ? 4 : 3;
    input.maxLength = 1200;
    input.minLength = 30;
    input.required = true;
    input.value = answers[index] || '';
    label.append(input);
    worksheet.append(label);
    return input;
  });
  const save = el('button', 'button button-dark practice-submit', 'Save answers');
  save.type = 'button';
  const feedback = feedbackNode('practice-feedback');
  if (progress[lessonId(currentIndex)]?.practice) {
    feedback.textContent = 'Your answers are saved and this activity is complete.';
    feedback.dataset.state = 'correct';
  }
  save.addEventListener('click', () => {
    const values = fields.map((field) => field.value.trim());
    if (values.some((answer) => answer.length < 30)) {
      feedback.textContent = 'Please answer each prompt with at least a short sentence (30 characters).';
      feedback.dataset.state = 'try-again';
      fields.find((field) => field.value.trim().length < 30)?.focus();
      return;
    }
    localStorage.setItem(worksheetKey(), JSON.stringify(values));
    const state = progress[lessonId(currentIndex)] || {};
    if (state.scenario) {
      state.practice = true;
      progress[lessonId(currentIndex)] = state;
      persist();
      feedback.textContent = 'Answers saved. Practice complete.';
      feedback.dataset.state = 'correct';
      return;
    }
    feedback.textContent = 'Answers saved. Complete the scenario above to finish this activity.';
    feedback.dataset.state = 'neutral';
  });
  worksheet.append(save, feedback);
  root.append(worksheet);
}

function renderAccessPractice(practice, root) {
  root.append(el('p', 'practice-prompt', practice.prompt));
  const lab = el('div', 'access-lab');
  lab.append(el('div', 'mock-app-bar', 'SIMULATED APP · NO REQUESTS OR DATA'));
  lab.append(el('h3', 'mock-app-title', 'Project archive'));
  lab.append(el('p', 'mock-app-copy', 'This archive is for administrators. First test the vulnerable role check, then apply the server-side permission check.'));
  const roleLabel = el('label', 'field-label', 'Role the browser claims');
  const role = document.createElement('select');
  role.className = 'practice-select';
  [['learner', 'Learner'], ['admin', 'Admin (change this claim)']].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    role.append(option);
  });
  roleLabel.append(role);
  const checkLabel = el('label', 'server-check');
  const serverCheck = document.createElement('input');
  serverCheck.type = 'checkbox';
  checkLabel.append(serverCheck, el('span', '', 'Apply the fix: check the account’s real permission on the server'));
  const request = el('button', 'button button-dark practice-submit', 'Request archive access');
  request.type = 'button';
  const result = feedbackNode('lab-result');
  if (progress[lessonId(currentIndex)]?.practice) {
    result.textContent = 'You completed this activity already. Try the simulation again, or continue to the next lesson.';
    result.dataset.state = 'correct';
  }
  request.addEventListener('click', () => {
    if (role.value === 'admin' && !serverCheck.checked) {
      result.textContent = 'The vulnerable app granted access. It trusted a role value controlled by the browser. Turn on the server-side check and try again.';
      result.dataset.state = 'try-again';
      return;
    }
    if (serverCheck.checked) {
      result.textContent = 'Access denied as intended. The simulated server used the account’s real learner permission. Activity complete.';
      result.dataset.state = 'correct';
      markStep('scenario');
      maybeCompletePractice();
      return;
    }
    result.textContent = 'Access denied for a learner. Change the browser claim to Admin to expose the flaw, then apply the server-side check.';
    result.dataset.state = 'neutral';
  });
  lab.append(roleLabel, checkLabel, request, result);
  root.append(lab);
}

function renderPractice(lesson) {
  const root = document.querySelector('#practice-content');
  root.replaceChildren();
  root.append(el('p', 'practice-title', lesson.practice.title));
  if (lesson.practice.type === 'access-control') renderAccessPractice(lesson.practice, root);
  else renderScenarioPractice(lesson.practice, root);
  renderWorksheet(lesson.practice, root);
}

function renderCompletion() {
  const complete = isComplete(currentIndex);
  const message = document.querySelector('#lesson-complete-message');
  message.hidden = !complete;
  message.textContent = complete ? 'Lesson complete. You can continue whenever you’re ready.' : '';
  const finalLesson = currentIndex === lessons.length - 1;
  const courseComplete = finalLesson && completedCount() === lessons.length;
  document.querySelector('#next-lesson').disabled = !complete || finalLesson;
  document.querySelector('#next-lesson').textContent = finalLesson ? (courseComplete ? 'Course complete ✓' : 'Final lesson') : 'Continue to next lesson →';
  document.querySelector('#previous-lesson').disabled = currentIndex === 0;
  document.querySelector('#lesson-next-help').textContent = complete
    ? (finalLesson ? 'You’ve reached the end of the course.' : 'This lesson is done. Continue when you’re ready.')
    : 'To continue, pass the quick check and save your three practice answers.';
  if (currentIndex === lessons.length - 1 && completedCount() === lessons.length) {
    message.textContent = 'You completed Security 101. You now have a useful foundation and a clear scope for what to study next.';
  }
}

function renderLesson(index) {
  currentIndex = Math.max(0, Math.min(index, lessons.length - 1));
  progress.lastOpenedLesson = currentIndex;
  localStorage.setItem(progressKey, JSON.stringify(progress));
  const { unit, lesson } = lessons[currentIndex];
  document.querySelector('#lesson-kicker').textContent = `LESSON ${String(currentIndex + 1).padStart(2, '0')} OF ${lessons.length}`;
  document.querySelector('#lesson-duration').textContent = lesson.duration.toUpperCase();
  document.querySelector('#unit-title').textContent = unit.title.toUpperCase();
  document.querySelector('#lesson-title').textContent = lesson.title;
  document.querySelector('#lesson-summary').textContent = lesson.summary;
  renderNotes(lesson);
  renderVideo(lesson);
  renderQuiz(lesson);
  renderPractice(lesson);
  renderProgress();
  renderCompletion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderNavigation() {
  navRoot.replaceChildren(...course.units.map((unit, unitIndex) => {
    const group = el('section', 'course-map-unit');
    group.append(el('h3', '', unit.title));
    const list = el('ol', 'course-map-lessons');
    unit.lessons.forEach((lesson, lessonIndex) => {
      const index = course.units.slice(0, unitIndex).reduce((sum, item) => sum + item.lessons.length, 0) + lessonIndex;
      const item = el('li');
      const button = el('button', 'course-map-link');
      button.type = 'button';
      button.dataset.lesson = String(index);
      button.dataset.title = lesson.title;
      button.append(el('span', 'course-map-number', String(index + 1).padStart(2, '0')), el('span', 'course-map-title', lesson.title));
      button.addEventListener('click', () => renderLesson(index));
      item.append(button);
      list.append(item);
    });
    group.append(list);
    return group;
  }));
}

document.querySelector('#previous-lesson').addEventListener('click', () => renderLesson(currentIndex - 1));
document.querySelector('#next-lesson').addEventListener('click', () => {
  if (isComplete(currentIndex) && currentIndex < lessons.length - 1) renderLesson(currentIndex + 1);
});

fetch(courseUrl)
  .then((response) => {
    if (!response.ok) throw new Error('Course content could not be loaded.');
    return response.json();
  })
  .then((data) => {
    course = data;
    lessons = course.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
    const savedIndex = Math.min(Number(progress.lastOpenedLesson || 0), lessons.length - 1);
    renderNavigation();
    renderLesson(savedIndex);
  })
  .catch(() => {
    document.querySelector('#lesson-summary').textContent = 'The lesson data could not be loaded. Refresh the page to try again.';
  });
