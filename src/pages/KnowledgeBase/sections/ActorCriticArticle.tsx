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

const ActorCriticArticle: React.FC = () => (
  <Article>
    <Title>Actor-Critic</Title>
    <Lead>
      Актёр-критик (actor-critic) — гибридный подход в обучении с подкреплением,
      объединяющий идеи методов градиента политики и методов ценности. Один
      компонент (актёр) выбирает действия, другой (критик) оценивает их качество
      и подсказывает, как корректировать политику.
    </Lead>

    <H2>Две роли</H2>
    <Ul
      items={[
        "Актёр (actor) — политика π(a | s; θ): по состоянию выдаёт распределение действий.",
        "Критик (critic) — оценка ценности V(s; w) или Q(s, a; w): оценивает, насколько ситуация выгодна.",
        "Критик заменяет «грубую» отдачу из REINFORCE более стабильной оценкой, снижая дисперсию.",
      ]}
    />
    <P>
      Это решает главную проблему чистого policy gradient — высокую дисперсию
      градиента, сохраняя при этом возможность работать с непрерывными
      действиями.
    </P>

    <H2>Преимущество как сигнал обучения</H2>
    <P>
      Актёр обновляется по преимуществу (advantage){" "}
      <Formula>A(s, a)</Formula> — насколько выбранное действие лучше среднего по
      состоянию. Удобная оценка через TD-ошибку критика:
    </P>
    <P>
      <Formula>A(s, a) ≈ δ = r + γ · V(s') − V(s)</Formula>
    </P>
    <P>Тогда обновления компонентов выглядят так:</P>
    <Ul
      items={[
        "Актёр: θ ← θ + α · ∇θ log π(a | s; θ) · δ",
        "Критик: w ← w + β · δ · ∇w V(s; w)",
      ]}
    />
    <Callout variant="info">
      Один и тот же сигнал <InlineCode>δ</InlineCode> используется дважды: он
      направляет политику актёра и одновременно уточняет оценку критика.
    </Callout>

    <H2>Цикл обучения</H2>
    <CodeBlock
      language="python"
      code={`import torch

s = env.reset()
done = False
while not done:
    # актёр выбирает действие
    dist = actor(s)
    a = dist.sample()

    s_next, r, done = env.step(a)

    # критик оценивает состояния, считаем TD-ошибку
    v, v_next = critic(s), critic(s_next)
    target = r + gamma * v_next * (1 - done)
    delta = (target - v).detach()        # advantage

    # потери актёра и критика
    actor_loss = -dist.log_prob(a) * delta
    critic_loss = (target.detach() - v) ** 2

    optimizer.zero_grad()
    (actor_loss + critic_loss).backward()
    optimizer.step()

    s = s_next`}
    />

    <H2>Разновидности</H2>
    <Ul
      items={[
        "A2C (Advantage Actor-Critic) — синхронный вариант с параллельными средами.",
        "A3C — асинхронная версия с несколькими рабочими потоками.",
        "DDPG, TD3, SAC — актёр-критик для непрерывного управления.",
        "PPO — актёр-критик с ограничением шага обновления политики.",
      ]}
    />

    <H2>Сильные и слабые стороны</H2>
    <H3>Сильные стороны</H3>
    <Ul
      items={[
        "Меньшая дисперсия, чем у чистого policy gradient, за счёт критика.",
        "Работают с непрерывными действиями и онлайн-обучением (по шагам, не по эпизодам).",
        "Гибкая основа для современных алгоритмов (PPO, SAC).",
      ]}
    />
    <H3>Слабые стороны</H3>
    <Ul
      items={[
        "Нужно одновременно обучать две сети — сложнее настройка.",
        "Ошибки критика могут смещать обучение актёра (bias).",
        "Чувствительность к гиперпараметрам (скорости обучения α и β).",
      ]}
    />
    <Callout variant="tip">
      Актёр-критик — концептуальный «мост» от простого REINFORCE к
      промышленным алгоритмам вроде PPO, который добавляет к этой схеме
      устойчивое ограничение шага.
    </Callout>

    <Sources refs={[REFS.sutton2018, REFS.schulman2017, REFS.nikolenko]} />
  </Article>
);

export default ActorCriticArticle;
