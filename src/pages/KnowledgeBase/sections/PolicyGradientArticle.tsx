import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  H3,
  P,
  Ul,
  Formula,
  Callout,
  CodeBlock,
  InlineCode,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const PolicyGradientArticle: React.FC = () => (
  <Article>
    <Title>Policy Gradient</Title>
    <Lead>
      Методы градиента политики (policy gradient) — семейство алгоритмов
      обучения с подкреплением, которые напрямую оптимизируют параметризованную
      политику, а не функцию ценности. Политика задаётся нейросетью, а её
      параметры обновляются по градиенту ожидаемой награды.
    </Lead>

    <H2>Чем отличается от методов ценности</H2>
    <P>
      В Q-обучении и DQN сначала оценивают <Formula>Q(s, a)</Formula>, а действие
      выбирают жадно. В policy gradient сеть с параметрами <Formula>θ</Formula>{" "}
      сразу задаёт распределение <Formula>π(a | s; θ)</Formula> — вероятность
      выбрать действие <Formula>a</Formula> в состоянии <Formula>s</Formula>.
    </P>
    <Ul
      items={[
        "Естественно работают с непрерывными действиями.",
        "Выдают стохастическую политику — полезно в частично наблюдаемых и состязательных средах.",
        "Оптимизируют целевую метрику (награду) напрямую, без промежуточной таблицы значений.",
      ]}
    />

    <H2>Целевая функция</H2>
    <P>
      Цель — максимизировать ожидаемую суммарную награду по траекториям{" "}
      <Formula>τ</Formula>, порождённым политикой:
    </P>
    <P>
      <Formula>J(θ) = E&#x2096;[ R(τ) ]</Formula>
    </P>
    <P>
      Параметры обновляются градиентным подъёмом:{" "}
      <Formula>θ ← θ + α · ∇&#x2092; J(θ)</Formula>.
    </P>

    <H2>Теорема о градиенте политики</H2>
    <P>
      Прямо дифференцировать ожидание по траекториям трудно, но теорема о
      градиенте политики даёт удобную форму, не требующую модели среды:
    </P>
    <P>
      <Formula>
        ∇&#x2092; J(θ) = E[ ∇&#x2092; log π(a | s; θ) · R ]
      </Formula>
    </P>
    <Ul
      items={[
        "∇ log π — направление, увеличивающее вероятность выбранного действия.",
        "R — итоговая отдача, играющая роль «веса»: хорошие действия усиливаются, плохие подавляются.",
        "Это основа алгоритма REINFORCE — простейшего метода policy gradient.",
      ]}
    />

    <H2>Базовая линия и дисперсия</H2>
    <P>
      Главная проблема policy gradient — высокая дисперсия оценки градиента.
      Чтобы её снизить, из отдачи вычитают базовую линию (baseline)<InlineCode>
        {" "}
        b(s)
      </InlineCode>
      , обычно — оценку ценности состояния <Formula>V(s)</Formula>:
    </P>
    <P>
      <Formula>
        ∇&#x2092; J ≈ E[ ∇&#x2092; log π(a | s; θ) · (R − b(s)) ]
      </Formula>
    </P>
    <Callout variant="info">
      Разность <Formula>R − V(s)</Formula> называют преимуществом (advantage):
      она показывает, насколько действие лучше «среднего» по состоянию.
      Использование оценки <Formula>V(s)</Formula> как базовой линии приводит к
      методам актёр-критик.
    </Callout>

    <H2>Псевдокод REINFORCE</H2>
    <CodeBlock
      language="python"
      code={`import torch

for episode in range(n_episodes):
    states, actions, rewards = run_episode(policy)

    # подсчёт отдачи (return) для каждого шага
    returns, G = [], 0.0
    for r in reversed(rewards):
        G = r + gamma * G
        returns.insert(0, G)
    returns = torch.tensor(returns)
    returns = (returns - returns.mean()) / (returns.std() + 1e-8)

    # градиент политики
    loss = 0.0
    for s, a, G in zip(states, actions, returns):
        logp = policy.log_prob(s, a)
        loss = loss - logp * G        # минус: переходим к минимизации

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()`}
    />

    <H2>Достоинства и трудности</H2>
    <H3>Достоинства</H3>
    <Ul
      items={[
        "Работают с непрерывными и сложными пространствами действий.",
        "Дают стохастическую политику и хорошо сходятся к локальному оптимуму.",
      ]}
    />
    <H3>Трудности</H3>
    <Ul
      items={[
        "Высокая дисперсия градиента и чувствительность к скорости обучения.",
        "Низкая эффективность по данным: обычно on-policy, старые траектории нельзя переиспользовать.",
        "Слишком большой шаг обновления может резко ухудшить политику.",
      ]}
    />
    <Callout variant="tip">
      Чтобы ограничить разрушительные шаги обновления, развили методы с
      доверительной областью — TRPO и PPO (Schulman и др., 2017).
    </Callout>

    <Sources refs={[REFS.sutton2018, REFS.schulman2017, REFS.nikolenko]} />
  </Article>
);

export default PolicyGradientArticle;
