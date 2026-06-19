import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  H3,
  P,
  Ul,
  Callout,
  CodeBlock,
  InlineCode,
  Term,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const TensorboardArticle: React.FC = () => (
  <Article>
    <Title>TensorBoard</Title>
    <Lead>
      TensorBoard — инструмент визуализации процесса обучения, входящий в
      экосистему TensorFlow и поддерживаемый также в PyTorch. Он превращает сухие
      числа из логов в графики: позволяет наблюдать за функцией потерь,
      метриками, гистограммами весов и структурой модели прямо в браузере.
    </Lead>

    <H2>Зачем визуализировать обучение</H2>
    <P>
      Обучение сети — итеративный процесс, в котором легко не заметить проблему.
      График <Term id="loss">функции потерь</Term> сразу показывает,
      сходится ли модель, началось ли <Term id="overfitting">переобучение</Term>{" "}
      или обучение «застряло». Без визуализации эти сигналы теряются среди
      строк лога.
    </P>
    <Ul
      items={[
        "Сравнение кривых потерь на обучении и валидации.",
        "Отслеживание метрик качества по эпохам.",
        "Контроль распределения весов и градиентов через гистограммы.",
        "Сравнение нескольких запусков с разными гиперпараметрами.",
      ]}
    />

    <H2>Основные панели</H2>
    <H3>Scalars</H3>
    <P>
      Главная панель: графики скалярных величин во времени — потери, точность,{" "}
      <Term id="learning-rate">скорость обучения</Term>. Здесь чаще всего и
      ведётся диагностика обучения.
    </P>
    <H3>Histograms и Distributions</H3>
    <P>
      Показывают, как меняются распределения весов и активаций по эпохам.
      Помогают заметить затухание или взрыв градиента.
    </P>
    <H3>Graphs</H3>
    <P>Визуализирует вычислительный граф модели — порядок и связи слоёв.</P>

    <H2>Логирование в TensorFlow / Keras</H2>
    <P>
      В Keras достаточно подключить колбэк <InlineCode>TensorBoard</InlineCode>:
      он сам запишет потери и метрики каждой эпохи в каталог логов.
    </P>
    <CodeBlock
      code={`import tensorflow as tf

tb_callback = tf.keras.callbacks.TensorBoard(
    log_dir="logs/run1",      # каталог с логами
    histogram_freq=1,         # писать гистограммы весов каждую эпоху
)

model.fit(
    x_train, y_train,
    validation_data=(x_val, y_val),
    epochs=20,
    callbacks=[tb_callback],
)`}
    />

    <H2>Логирование в PyTorch</H2>
    <P>
      В PyTorch используется класс <InlineCode>SummaryWriter</InlineCode>:
      значения добавляются вручную внутри цикла обучения.
    </P>
    <CodeBlock
      code={`from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter("logs/run1")

for epoch in range(epochs):
    train_loss = train_one_epoch(...)
    val_loss = evaluate(...)
    writer.add_scalar("loss/train", train_loss, epoch)
    writer.add_scalar("loss/val", val_loss, epoch)

writer.close()`}
    />
    <Callout variant="info">
      Сервер запускается командой в терминале:
      <InlineCode>tensorboard --logdir logs</InlineCode>. После этого интерфейс
      открывается в браузере по адресу localhost:6006.
    </Callout>

    <H2>Как читать графики</H2>
    <Ul
      items={[
        "Потери на обучении падают, на валидации растут — переобучение.",
        "Обе кривые стоят на месте — слишком малая скорость обучения или ошибка в данных.",
        "Резкие скачки потерь вверх — слишком большой шаг обучения.",
        "Гистограммы весов «схлопываются» к нулю — затухание градиента.",
      ]}
    />
    <Callout variant="tip">
      Сглаживание (smoothing) в панели Scalars помогает увидеть тренд на шумных
      кривых. Но для оценки реального разброса полезно иногда смотреть и
      несглаженный график.
    </Callout>

    <Sources refs={[REFS.tensorflow, REFS.nikolenko]} />
  </Article>
);

export default TensorboardArticle;
