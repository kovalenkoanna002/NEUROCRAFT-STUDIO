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

const DqnArticle: React.FC = () => (
  <Article>
    <Title>Deep Q-Network (DQN)</Title>
    <Lead>
      Deep Q-Network — алгоритм глубокого обучения с подкреплением, в котором
      таблицу Q-значений заменяет нейросеть. Работа команды DeepMind (Mnih и др.,
      2015) показала, что один и тот же агент способен играть в десятки игр Atari
      на уровне человека или выше, получая на вход только пиксели экрана и счёт.
    </Lead>

    <H2>От таблицы к нейросети</H2>
    <P>
      В классическом Q-обучении значения <Formula>Q(s, a)</Formula> хранятся в
      таблице, что невозможно для огромных пространств состояний (например, кадры
      игры). DQN использует аппроксиматор — нейросеть с параметрами{" "}
      <Formula>θ</Formula>, которая по состоянию <Formula>s</Formula> выдаёт
      оценки <Formula>Q(s, a; θ)</Formula> сразу для всех действий.
    </P>
    <Ul
      items={[
        "Вход — обработанные кадры игры (например, 4 последних кадра в оттенках серого).",
        "Свёрточные слои извлекают признаки из изображения.",
        "Выход — вектор Q-значений по числу доступных действий (кнопок джойстика).",
      ]}
    />

    <H2>Функция потерь</H2>
    <P>
      Сеть обучается минимизировать квадрат TD-ошибки между предсказанием и
      целевым значением:
    </P>
    <P>
      <Formula>
        L(θ) = E[ ( r + γ · max&#x2090; Q(s', a'; θ⁻) − Q(s, a; θ) )² ]
      </Formula>
    </P>
    <P>
      Здесь <Formula>θ⁻</Formula> — параметры отдельной целевой сети. Без двух
      приёмов ниже такое обучение нестабильно и часто расходится.
    </P>

    <H2>Ключевые приёмы стабилизации</H2>
    <H3>Буфер воспроизведения (experience replay)</H3>
    <P>
      Переходы <Formula>(s, a, r, s')</Formula> складываются в большой буфер, а
      для обучения из него берут случайные мини-батчи. Это разрывает корреляцию
      между последовательными кадрами и повышает эффективность использования
      данных.
    </P>
    <H3>Целевая сеть (target network)</H3>
    <P>
      Целевое значение считается отдельной копией сети с «замороженными»
      параметрами <Formula>θ⁻</Formula>, которые обновляются раз в несколько
      тысяч шагов. Фиксированная цель не «убегает» от обучаемой сети и
      стабилизирует процесс.
    </P>
    <Callout variant="info">
      Как и Q-обучение, DQN — off-policy метод: данные из буфера могли быть
      собраны старой версией политики, но это не мешает обучению.
    </Callout>

    <H2>Цикл обучения</H2>
    <CodeBlock
      language="python"
      code={`import random, torch
import torch.nn.functional as F

# q_net — обучаемая сеть, target_net — целевая (копия)
for step in range(total_steps):
    # ε-жадный выбор действия
    if random.random() < eps:
        a = env.sample_action()
    else:
        a = int(q_net(state).argmax())

    next_state, r, done = env.step(a)
    buffer.add(state, a, r, next_state, done)
    state = next_state if not done else env.reset()

    # обучение на случайном мини-батче из буфера
    s, a, r, s2, d = buffer.sample(batch_size)
    with torch.no_grad():
        target = r + gamma * target_net(s2).max(1).values * (1 - d)
    q = q_net(s).gather(1, a)
    loss = F.mse_loss(q, target)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # периодическое обновление целевой сети
    if step % target_update == 0:
        target_net.load_state_dict(q_net.state_dict())`}
    />

    <H2>Развитие идеи</H2>
    <P>
      После выхода DQN появилось семейство улучшений, повышающих стабильность и
      точность оценок:
    </P>
    <Ul
      items={[
        "Double DQN — раздельный выбор и оценка действия, снижает переоценку Q-значений.",
        "Dueling DQN — отдельные «головы» для ценности состояния и преимущества действия.",
        "Prioritized Experience Replay — чаще переигрываются переходы с большой TD-ошибкой.",
        "Rainbow — комбинация нескольких улучшений в одном агенте.",
      ]}
    />
    <Callout variant="tip">
      DQN хорош для дискретных действий. Для непрерывного управления (углы,
      моменты) применяют другие методы — например, актёр-критик и{" "}
      <InlineCode>policy gradient</InlineCode>.
    </Callout>

    <Sources refs={[REFS.mnih2015, REFS.sutton2018, REFS.nikolenko]} />
  </Article>
);

export default DqnArticle;
