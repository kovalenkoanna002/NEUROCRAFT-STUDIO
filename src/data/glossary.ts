export interface GlossaryEntry {
  term: string;
  definition: string;

  article?: string;

  match?: string[];
}

export const LAYER_TERM: Record<string, string> = {
  input: "input-layer",
  conv: "convolution",
  pool: "pool-layer",
  flatten: "flatten",
  dense: "dense",
  hidden: "dense",
  output: "output-layer",
  embedding: "embedding",
  lstm: "lstm",
  gru: "gru",
  rnn: "rnn",
  attention: "attention",
  globalpool: "pooling",
  dropout: "dropout",
  batchnorm: "batchnorm",
};

export const glossary: Record<string, GlossaryEntry> = {
  "neural-network": {
    term: "Нейронная сеть",
    definition:
      "Математическая модель из связанных нейронов, которая обучается решать задачи на примерах, а не по жёстким правилам.",
    article: "neural-networks",
    match: ["нейронн", "нейросет"],
  },
  neuron: {
    term: "Нейрон",
    definition:
      "Базовый вычислительный элемент сети: суммирует взвешенные входы, добавляет смещение и пропускает результат через функцию активации.",
    article: "artificial-neuron",
  },
  weight: {
    term: "Вес (weight)",
    definition:
      "Обучаемый коэффициент при входе нейрона. Чем больше вес, тем сильнее вход влияет на выход. Веса подбираются в процессе обучения.",
    article: "artificial-neuron",
  },
  bias: {
    term: "Смещение (bias)",
    definition:
      "Обучаемая добавка к взвешенной сумме входов. Позволяет сдвигать функцию активации и улучшает гибкость модели.",
    article: "artificial-neuron",
  },
  architecture: {
    term: "Архитектура сети",
    definition:
      "Структура нейросети: типы и порядок слоёв, число нейронов и характер связей между ними.",
    article: "neural-networks",
    match: ["архитектур"],
  },
  perceptron: {
    term: "Перцептрон (MLP)",
    definition:
      "Простейшая нейросеть из полносвязных слоёв, где каждый нейрон связан со всеми выходами предыдущего слоя.",
    article: "mlp",
    match: ["перцептрон"],
  },
  activation: {
    term: "Функция активации",
    definition:
      "Нелинейное преобразование выхода нейрона. Без неё сеть из любого числа слоёв эквивалентна одному линейному слою.",
    article: "training-process",
    match: ["активаци"],
  },
  relu: {
    term: "ReLU",
    definition:
      "Rectified Linear Unit: f(x) = max(0, x). Самая популярная активация — простая, быстрая, не насыщается для положительных значений.",
    article: "training-process",
    match: ["relu"],
  },
  sigmoid: {
    term: "Sigmoid",
    definition:
      "Сжимает вход в диапазон (0, 1): σ(x) = 1 / (1 + e^−x). Применяется для вероятностей в бинарной классификации.",
    article: "training-process",
    match: ["sigmoid"],
  },
  softmax: {
    term: "Softmax",
    definition:
      "Превращает вектор чисел в распределение вероятностей (сумма = 1). Стандартный выход для многоклассовой классификации.",
    article: "training-process",
    match: ["softmax"],
  },
  tanh: {
    term: "Tanh",
    definition:
      "Гиперболический тангенс, сжимает вход в (−1, 1). Центрирован вокруг нуля, что часто удобнее sigmoid.",
    article: "training-process",
  },
  convolution: {
    term: "Свёртка (convolution)",
    definition:
      "Операция, при которой небольшое ядро скользит по изображению, вычисляя взвешенные суммы — так выделяются локальные признаки.",
    article: "cnn",
    match: ["свёрт", "сверт", "конволю"],
  },
  gan: {
    term: "GAN (генеративно-состязательная сеть)",
    definition:
      "Две сети учатся в противоборстве: генератор создаёт правдоподобные образцы из шума, а дискриминатор отличает их от реальных данных.",
    article: "gan",
    match: ["gan", "генеративно-состязат"],
  },
  kernel: {
    term: "Ядро (kernel / фильтр)",
    definition:
      "Небольшая матрица весов (например 3×3), которую свёрточный слой применяет ко всем участкам входа для выделения признака.",
    article: "cnn",
  },
  pooling: {
    term: "Пулинг (pooling)",
    definition:
      "Уменьшение размерности карты признаков: из каждого окна берётся максимум (MaxPooling) или среднее (AveragePooling).",
    article: "cnn",
    match: ["пулинг", "pooling"],
  },
  flatten: {
    term: "Flatten",
    definition:
      "Разворачивание многомерной карты признаков в один вектор перед подачей в полносвязные слои.",
    article: "cnn",
    match: ["flatten"],
  },
  dense: {
    term: "Полносвязный слой (Dense)",
    definition:
      "Слой, в котором каждый нейрон связан со всеми выходами предыдущего слоя.",
    article: "mlp",
    match: ["полносвязн"],
  },
  cnn: {
    term: "Свёрточная сеть (CNN)",
    definition:
      "Архитектура для изображений: использует локальные обучаемые фильтры (свёртки) вместо глобальных связей.",
    article: "cnn",
    match: ["свёрточн", "сверточн"],
  },
  transformer: {
    term: "Трансформер",
    definition:
      "Архитектура на основе механизма внимания. Основа современных языковых моделей (GPT, BERT).",
    article: "transformers",
    match: ["трансформер"],
  },
  embedding: {
    term: "Embedding — векторное представление",
    definition:
      "Превращает токены (слова, индексы) в плотные векторы, где близкие по смыслу элементы имеют близкие векторы.",
    article: "embeddings",
    match: ["эмбеддинг"],
  },
  lstm: {
    term: "LSTM",
    definition:
      "Long Short-Term Memory — рекуррентный слой с вентилями памяти; справляется с длинными зависимостями в последовательностях.",
    article: "rnn",
  },
  gru: {
    term: "GRU",
    definition:
      "Gated Recurrent Unit — упрощённый рекуррентный слой с вентилями; быстрее LSTM, часто не хуже по качеству.",
    article: "rnn",
  },
  rnn: {
    term: "RNN — рекуррентный слой",
    definition:
      "Обрабатывает последовательность шаг за шагом, перенося скрытое состояние; основа моделей для текста и временных рядов.",
    article: "rnn",
  },
  attention: {
    term: "Блок внимания (Transformer)",
    definition:
      "Self-attention: каждый элемент последовательности взвешивает все остальные. Ядро трансформеров.",
    article: "transformers",
    match: ["внимани"],
  },
  tensor: {
    term: "Тензор",
    definition:
      "Обобщение векторов и матриц на любое число измерений. Базовая структура данных в нейросетях.",
    article: "tensors",
    match: ["тензор"],
  },
  epoch: {
    term: "Эпоха (epoch)",
    definition:
      "Один полный проход алгоритма обучения по всему обучающему набору данных.",
    article: "gradient-descent",
    match: ["эпох"],
  },
  loss: {
    term: "Функция потерь (loss)",
    definition:
      "Мера расхождения между предсказанием сети и правильным ответом. Обучение минимизирует её значение.",
    article: "loss-functions",
  },
  gradient: {
    term: "Градиент",
    definition:
      "Вектор частных производных функции потерь по параметрам. Показывает направление наискорейшего роста ошибки.",
    article: "gradient-descent",
    match: ["градиент"],
  },
  "gradient-descent": {
    term: "Градиентный спуск",
    definition:
      "Метод оптимизации: параметры сдвигаются против градиента, шаг за шагом уменьшая функцию потерь.",
    article: "gradient-descent",
  },
  "learning-rate": {
    term: "Скорость обучения (learning rate)",
    definition:
      "Размер шага градиентного спуска. Слишком большой — расхождение, слишком малый — медленное обучение.",
    article: "gradient-descent",
  },
  overfitting: {
    term: "Переобучение (overfitting)",
    definition:
      "Ситуация, когда модель запоминает обучающие данные, но плохо обобщает на новые. Борются регуляризацией и dropout.",
    article: "regularization",
    match: ["переобучени"],
  },
  dropout: {
    term: "Dropout",
    definition:
      "Регуляризация: во время обучения часть нейронов случайно отключается, что снижает переобучение.",
    article: "regularization",
    match: ["dropout"],
  },
  batchnorm: {
    term: "Batch Normalization",
    definition:
      "Нормализует активации внутри мини-батча (вычитает среднее, делит на стандартное отклонение) и масштабирует их обучаемыми параметрами γ и β. Стабилизирует и ускоряет обучение.",
    article: "regularization",
    match: ["batchnorm", "батч-нормализац", "пакетная нормализац"],
  },
  backprop: {
    term: "Обратное распространение (backpropagation)",
    definition:
      "Алгоритм вычисления градиентов потерь по всем весам сети с помощью правила цепочки, от выхода к входу.",
    article: "backpropagation",
    match: ["backprop"],
  },
  "feature-map": {
    term: "Карта признаков (feature map)",
    definition:
      "Выход свёрточного слоя — массив активаций, показывающий, где во входе обнаружен соответствующий признак.",
    article: "cnn",
  },
  "input-layer": {
    term: "Input — входной слой",
    definition:
      "Принимает исходные данные (признаки, пиксели, каналы изображения) и передаёт их в сеть. Сам не обучается; его размер задаёт форму входа.",
    article: "neural-networks",
  },
  "output-layer": {
    term: "Output — выходной слой",
    definition:
      "Формирует итоговый ответ сети: класс, число или распределение вероятностей. Число нейронов равно числу выходов (например, числу классов).",
    article: "mlp",
  },
  "pool-layer": {
    term: "MaxPooling — слой подвыборки",
    definition:
      "Уменьшает размер карты признаков, оставляя максимум в каждом окне. Сокращает вычисления и добавляет устойчивость к сдвигам.",
    article: "cnn",
  },
  pytorch: {
    term: "PyTorch",
    definition:
      "Открытая библиотека глубокого обучения (Meta AI). Любима исследователями за гибкость и динамический граф вычислений.",
    article: "pytorch",
    match: ["pytorch"],
  },
  tensorflow: {
    term: "TensorFlow",
    definition:
      "Открытая платформа машинного обучения (Google). Подходит и для исследований, и для продакшена.",
    article: "tensorflow",
    match: ["tensorflow"],
  },
  keras: {
    term: "Keras",
    definition:
      "Высокоуровневый API для построения нейросетей; входит в состав TensorFlow.",
    article: "keras",
    match: ["keras"],
  },
};
