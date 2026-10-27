type Question = { prompt: string; options: readonly string[]; answer: number; explanation: string };

const QUESTIONS: readonly Question[] = [
  {
    prompt: 'A 应该找谁配对？',
    options: ['T', 'C', '另一个 A'],
    answer: 0,
    explanation: '在双链 DNA 中，A 通常与 T 互补配对。',
  },
  {
    prompt: 'C 应该找谁配对？',
    options: ['A', 'T', 'G'],
    answer: 2,
    explanation: 'C 通常与 G 互补配对。',
  },
  {
    prompt: '1 bp 代表什么？',
    options: ['一个碱基对', '一条完整染色体', '一个物种'],
    answer: 0,
    explanation: 'bp 是 base pair 的缩写，意思是一个碱基对。',
  },
  {
    prompt: '比较两条 DNA 序列时，生物信息学常用哪一步？',
    options: ['序列比对', '称量卡片', '观察颜色'],
    answer: 0,
    explanation: '序列比对帮助找到序列中的相同和不同位置。',
  },
];

export function initLearningQuiz(): void {
  const progress = document.getElementById('quiz-progress');
  const question = document.getElementById('quiz-question');
  const options = document.getElementById('quiz-options');
  const feedback = document.getElementById('quiz-feedback');
  const next = document.getElementById('quiz-next') as HTMLButtonElement | null;
  if (!progress || !question || !options || !feedback || !next) return;
  let index = 0;
  let correct = 0;

  const render = (): void => {
    const current = QUESTIONS[index];
    progress.textContent = `问题 ${index + 1} / ${QUESTIONS.length} · 已答对 ${correct} 题`;
    question.textContent = current.prompt;
    feedback.textContent = '';
    feedback.className = 'quiz-feedback';
    next.hidden = true;
    options.replaceChildren();
    current.options.forEach((label, choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        const right = choice === current.answer;
        if (right) correct += 1;
        options.querySelectorAll('button').forEach((other, i) => {
          (other as HTMLButtonElement).disabled = true;
          if (i === current.answer) other.classList.add('is-correct');
          else if (i === choice) other.classList.add('is-wrong');
        });
        feedback.classList.add(right ? 'is-correct' : 'is-wrong');
        feedback.textContent = `${right ? '回答正确。' : '再记住这个要点。'}${current.explanation}`;
        next.textContent = index === QUESTIONS.length - 1 ? '查看成绩' : '下一题';
        next.hidden = false;
      }, { once: true });
      options.append(button);
    });
  };

  next.addEventListener('click', () => {
    if (index >= QUESTIONS.length) {
      index = 0;
      correct = 0;
      render();
      return;
    }
    index += 1;
    if (index < QUESTIONS.length) {
      render();
      return;
    }
    progress.textContent = '学习挑战完成';
    question.textContent = `答对 ${correct} / ${QUESTIONS.length} 题`;
    options.replaceChildren();
    feedback.textContent = correct === QUESTIONS.length ? '配对规则已经记住啦！' : '可以点开上面的卡片复习，再来挑战一次。';
    feedback.className = 'quiz-feedback';
    next.textContent = '再答一次';
  });
  render();
}
