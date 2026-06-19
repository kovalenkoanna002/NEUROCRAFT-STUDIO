import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./KnowledgePage.module.scss";
import IntroArticle from "./sections/IntroArticle";
import HistoryArticle from "./sections/HistoryArticle";
import ApplicationsArticle from "./sections/ApplicationsArticle";
import TermsBasicsArticle from "./sections/TermsBasicsArticle";
import WeakStrongAiArticle from "./sections/WeakStrongAiArticle";
import LinearAlgebraArticle from "./sections/LinearAlgebraArticle";
import CalculusArticle from "./sections/CalculusArticle";
import StatisticsArticle from "./sections/StatisticsArticle";
import GradientDescentArticle from "./sections/GradientDescentArticle";
import KolmogorovArnoldArticle from "./sections/KolmogorovArnoldArticle";
import MlpArticle from "./sections/MlpArticle";
import CnnArticle from "./sections/CnnArticle";
import RnnArticle from "./sections/RnnArticle";
import TransformersArticle from "./sections/TransformersArticle";
import AutoencodersArticle from "./sections/AutoencodersArticle";
import GanArticle from "./sections/GanArticle";
import GnnArticle from "./sections/GnnArticle";
import KanArticle from "./sections/KanArticle";
import DataPreparationArticle from "./sections/DataPreparationArticle";
import ActivationsArticle from "./sections/ActivationsArticle";
import LossArticle from "./sections/LossArticle";
import OptimizersArticle from "./sections/OptimizersArticle";
import RegularizationArticle from "./sections/RegularizationArticle";
import LlmArticle from "./sections/LlmArticle";
import SlmArticle from "./sections/SlmArticle";
import AgiArticle from "./sections/AgiArticle";
import AsiArticle from "./sections/AsiArticle";
import TensorFlowArticle from "./sections/TensorFlowArticle";
import PyTorchArticle from "./sections/PyTorchArticle";
import KerasArticle from "./sections/KerasArticle";
import ScikitLearnArticle from "./sections/ScikitLearnArticle";
import HuggingFaceArticle from "./sections/HuggingFaceArticle";
import GlossaryView from "./sections/GlossaryView";
import ArtificialNeuronArticle from "./sections/ArtificialNeuronArticle";
import ForwardPassArticle from "./sections/ForwardPassArticle";
import BackpropagationArticle from "./sections/BackpropagationArticle";
import WeightInitArticle from "./sections/WeightInitArticle";
import SupervisedArticle from "./sections/SupervisedArticle";
import UnsupervisedArticle from "./sections/UnsupervisedArticle";
import ReinforcementArticle from "./sections/ReinforcementArticle";
import TokenizationArticle from "./sections/TokenizationArticle";
import EmbeddingsArticle from "./sections/EmbeddingsArticle";
import RagArticle from "./sections/RagArticle";
import ResNetArticle from "./sections/ResNetArticle";
import DiffusionArticle from "./sections/DiffusionArticle";
import NormalizationArticle from "./sections/NormalizationArticle";
import MetricsArticle from "./sections/MetricsArticle";
import CrossValidationArticle from "./sections/CrossValidationArticle";
import HyperparametersArticle from "./sections/HyperparametersArticle";
import LrSchedulesArticle from "./sections/LrSchedulesArticle";
import AugmentationArticle from "./sections/AugmentationArticle";
import ClassImbalanceArticle from "./sections/ClassImbalanceArticle";
import PretrainingArticle from "./sections/PretrainingArticle";
import RlhfArticle from "./sections/RlhfArticle";
import PromptEngineeringArticle from "./sections/PromptEngineeringArticle";
import InContextArticle from "./sections/InContextArticle";
import ContextWindowArticle from "./sections/ContextWindowArticle";
import HallucinationsArticle from "./sections/HallucinationsArticle";
import LoraArticle from "./sections/LoraArticle";
import QuantizationArticle from "./sections/QuantizationArticle";
import UnetArticle from "./sections/UnetArticle";
import VitArticle from "./sections/VitArticle";
import MoeArticle from "./sections/MoeArticle";
import Seq2SeqArticle from "./sections/Seq2SeqArticle";
import AttentionArticle from "./sections/AttentionArticle";
import SiameseArticle from "./sections/SiameseArticle";
import MlVsDlArticle from "./sections/MlVsDlArticle";
import BiologicalNeuronArticle from "./sections/BiologicalNeuronArticle";
import SelfSupervisedArticle from "./sections/SelfSupervisedArticle";
import TransferLearningArticle from "./sections/TransferLearningArticle";
import AiAgentArticle from "./sections/AiAgentArticle";
import ToolUseArticle from "./sections/ToolUseArticle";
import MachineTranslationArticle from "./sections/MachineTranslationArticle";
import BertArticle from "./sections/BertArticle";
import GptArticle from "./sections/GptArticle";
import TuringTestArticle from "./sections/TuringTestArticle";
import UniversalApproximationArticle from "./sections/UniversalApproximationArticle";
import TensorsArticle from "./sections/TensorsArticle";
import InformationTheoryArticle from "./sections/InformationTheoryArticle";
import NumericalOptimizationArticle from "./sections/NumericalOptimizationArticle";
import FunctionApproximationArticle from "./sections/FunctionApproximationArticle";
import DenseLayerArticle from "./sections/DenseLayerArticle";
import ComputationalGraphArticle from "./sections/ComputationalGraphArticle";
import AutogradArticle from "./sections/AutogradArticle";
import VanishingGradientArticle from "./sections/VanishingGradientArticle";
import SemiSupervisedArticle from "./sections/SemiSupervisedArticle";
import FewShotArticle from "./sections/FewShotArticle";
import FederatedArticle from "./sections/FederatedArticle";
import ContinualArticle from "./sections/ContinualArticle";
import ActiveLearningArticle from "./sections/ActiveLearningArticle";
import DistillationArticle from "./sections/DistillationArticle";
import AiEthicsArticle from "./sections/AiEthicsArticle";
import PlanningArticle from "./sections/PlanningArticle";
import AgentMemoryArticle from "./sections/AgentMemoryArticle";
import MultiAgentArticle from "./sections/MultiAgentArticle";
import ReactPatternArticle from "./sections/ReactPatternArticle";
import AutonomousAgentsArticle from "./sections/AutonomousAgentsArticle";
import AlignmentArticle from "./sections/AlignmentArticle";
import AiSafetyArticle from "./sections/AiSafetyArticle";
import InterpretabilityArticle from "./sections/InterpretabilityArticle";
import AnthropicRspArticle from "./sections/AnthropicRspArticle";
import OpenAiCharterArticle from "./sections/OpenAiCharterArticle";
import AiGovernanceArticle from "./sections/AiGovernanceArticle";
import ImageClassificationArticle from "./sections/ImageClassificationArticle";
import ObjectDetectionArticle from "./sections/ObjectDetectionArticle";
import SegmentationArticle from "./sections/SegmentationArticle";
import FaceRecognitionArticle from "./sections/FaceRecognitionArticle";
import OcrArticle from "./sections/OcrArticle";
import ImageGenerationArticle from "./sections/ImageGenerationArticle";
import PoseEstimationArticle from "./sections/PoseEstimationArticle";
import WordEmbeddingsArticle from "./sections/WordEmbeddingsArticle";
import NerArticle from "./sections/NerArticle";
import SummarizationArticle from "./sections/SummarizationArticle";
import QuestionAnsweringArticle from "./sections/QuestionAnsweringArticle";
import SentimentArticle from "./sections/SentimentArticle";
import RlBasicsArticle from "./sections/RlBasicsArticle";
import QLearningArticle from "./sections/QLearningArticle";
import DqnArticle from "./sections/DqnArticle";
import PolicyGradientArticle from "./sections/PolicyGradientArticle";
import ActorCriticArticle from "./sections/ActorCriticArticle";
import PpoArticle from "./sections/PpoArticle";
import AlphaGoArticle from "./sections/AlphaGoArticle";
import JaxArticle from "./sections/JaxArticle";
import OnnxArticle from "./sections/OnnxArticle";
import CudaArticle from "./sections/CudaArticle";
import TensorboardArticle from "./sections/TensorboardArticle";
import ExperimentTrackingArticle from "./sections/ExperimentTrackingArticle";
import ModelServingArticle from "./sections/ModelServingArticle";
import MlopsArticle from "./sections/MlopsArticle";
import MonitoringArticle from "./sections/MonitoringArticle";
import EdgeAiArticle from "./sections/EdgeAiArticle";
import AbTestingArticle from "./sections/AbTestingArticle";
import VectorDbArticle from "./sections/VectorDbArticle";
import ModelCompressionArticle from "./sections/ModelCompressionArticle";
import GigaChatArticle from "./sections/GigaChatArticle";
import YandexGptArticle from "./sections/YandexGptArticle";
import KandinskyArticle from "./sections/KandinskyArticle";
import AiJourneyArticle from "./sections/AiJourneyArticle";
import RussianDatasetsArticle from "./sections/RussianDatasetsArticle";
import RuAiEcosystemArticle from "./sections/RuAiEcosystemArticle";

interface Subsection {
  id: string;
  title: string;
  component?: React.ReactNode;
}

interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

const sections: Section[] = [
  {
    id: "basics",
    title: "Основы",
    subsections: [
      { id: "neural-networks", title: "Что такое нейронные сети", component: <IntroArticle /> },
      { id: "weak-strong-ai", title: "Слабый и сильный ИИ", component: <WeakStrongAiArticle /> },
      { id: "history", title: "История и развитие", component: <HistoryArticle /> },
      { id: "applications", title: "Области применения", component: <ApplicationsArticle /> },
      { id: "terminology", title: "Базовые термины и определения", component: <TermsBasicsArticle /> },
      { id: "ml-vs-dl", title: "Машинное обучение и глубокое обучение", component: <MlVsDlArticle /> },
      { id: "biological-neuron", title: "Биологический и искусственный нейрон", component: <BiologicalNeuronArticle /> },
      { id: "turing-test", title: "Тест Тьюринга", component: <TuringTestArticle /> },
      { id: "ai-ethics", title: "Этика искусственного интеллекта", component: <AiEthicsArticle /> },
    ],
  },
  {
    id: "math",
    title: "Математический фундамент",
    subsections: [
      { id: "linear-algebra", title: "Линейная алгебра", component: <LinearAlgebraArticle /> },
      { id: "mathematical-analysis", title: "Математический анализ", component: <CalculusArticle /> },
      { id: "statistics", title: "Теория вероятностей и статистика", component: <StatisticsArticle /> },
      { id: "gradient-descent", title: "Градиентный спуск и его разновидности", component: <GradientDescentArticle /> },
      { id: "kolmogorov-arnold", title: "Теорема Колмогорова–Арнольда", component: <KolmogorovArnoldArticle /> },
      { id: "universal-approximation", title: "Теорема универсальной аппроксимации", component: <UniversalApproximationArticle /> },
      { id: "tensors", title: "Тензоры и тензорные операции", component: <TensorsArticle /> },
      { id: "information-theory", title: "Теория информации и энтропия", component: <InformationTheoryArticle /> },
      { id: "numerical-optimization", title: "Численные методы оптимизации", component: <NumericalOptimizationArticle /> },
      { id: "function-approximation", title: "Аппроксимация функций многих переменных", component: <FunctionApproximationArticle /> },
    ],
  },
  {
    id: "neuron-training",
    title: "Нейрон и механика обучения",
    subsections: [
      { id: "artificial-neuron", title: "Искусственный нейрон", component: <ArtificialNeuronArticle /> },
      { id: "dense-layer", title: "Полносвязный слой", component: <DenseLayerArticle /> },
      { id: "weight-init", title: "Инициализация весов", component: <WeightInitArticle /> },
      { id: "forward-pass", title: "Прямой проход (forward pass)", component: <ForwardPassArticle /> },
      { id: "backpropagation", title: "Обратное распространение ошибки", component: <BackpropagationArticle /> },
      { id: "computational-graph", title: "Вычислительный граф", component: <ComputationalGraphArticle /> },
      { id: "autograd", title: "Автоматическое дифференцирование", component: <AutogradArticle /> },
      { id: "vanishing-gradient", title: "Затухающий и взрывающийся градиент", component: <VanishingGradientArticle /> },
    ],
  },
  {
    id: "architectures",
    title: "Архитектуры нейронных сетей",
    subsections: [
      { id: "mlp", title: "Полносвязные сети (Dense / MLP)", component: <MlpArticle /> },
      { id: "cnn", title: "Свёрточные сети (CNN)", component: <CnnArticle /> },
      { id: "rnn", title: "Рекуррентные сети (RNN, LSTM, GRU)", component: <RnnArticle /> },
      { id: "transformers", title: "Трансформеры (Transformers)", component: <TransformersArticle /> },
      { id: "autoencoders", title: "Автокодировщики (Autoencoders)", component: <AutoencodersArticle /> },
      { id: "gan", title: "Генеративно-состязательные сети (GAN)", component: <GanArticle /> },
      { id: "gnn", title: "Графовые нейросети (GNN)", component: <GnnArticle /> },
      { id: "kan", title: "Сети Колмогорова–Арнольда (KAN)", component: <KanArticle /> },
      { id: "resnet", title: "Остаточные сети (ResNet)", component: <ResNetArticle /> },
      { id: "unet", title: "U-Net", component: <UnetArticle /> },
      { id: "vit", title: "Vision Transformer (ViT)", component: <VitArticle /> },
      { id: "diffusion", title: "Диффузионные модели", component: <DiffusionArticle /> },
      { id: "moe", title: "Mixture of Experts", component: <MoeArticle /> },
      { id: "seq2seq", title: "Seq2Seq", component: <Seq2SeqArticle /> },
      { id: "attention", title: "Механизмы внимания", component: <AttentionArticle /> },
      { id: "siamese", title: "Сиамские сети", component: <SiameseArticle /> },
    ],
  },
  {
    id: "training",
    title: "Процессы обучения",
    subsections: [
      { id: "data-preparation", title: "Предобработка данных", component: <DataPreparationArticle /> },
      { id: "training-process", title: "Функции активации", component: <ActivationsArticle /> },
      { id: "loss-functions", title: "Функции потерь", component: <LossArticle /> },
      { id: "optimization-algorithms", title: "Алгоритмы оптимизации", component: <OptimizersArticle /> },
      { id: "regularization", title: "Регуляризация и переобучение", component: <RegularizationArticle /> },
      { id: "normalization", title: "Batch и Layer Normalization", component: <NormalizationArticle /> },
      { id: "metrics", title: "Метрики качества", component: <MetricsArticle /> },
      { id: "cross-validation", title: "Кросс-валидация", component: <CrossValidationArticle /> },
      { id: "hyperparameters", title: "Подбор гиперпараметров", component: <HyperparametersArticle /> },
      { id: "lr-schedules", title: "Расписания скорости обучения", component: <LrSchedulesArticle /> },
      { id: "augmentation", title: "Аугментация данных", component: <AugmentationArticle /> },
      { id: "class-imbalance", title: "Дисбаланс классов", component: <ClassImbalanceArticle /> },
    ],
  },
  {
    id: "paradigms",
    title: "Парадигмы обучения",
    subsections: [
      { id: "supervised", title: "Обучение с учителем", component: <SupervisedArticle /> },
      { id: "unsupervised", title: "Обучение без учителя", component: <UnsupervisedArticle /> },
      { id: "reinforcement", title: "Обучение с подкреплением", component: <ReinforcementArticle /> },
      { id: "self-supervised", title: "Самообучение (self-supervised)", component: <SelfSupervisedArticle /> },
      { id: "semi-supervised", title: "Частичное обучение (semi-supervised)", component: <SemiSupervisedArticle /> },
      { id: "transfer-learning", title: "Перенос обучения (transfer learning)", component: <TransferLearningArticle /> },
      { id: "few-shot", title: "Few-shot и Zero-shot", component: <FewShotArticle /> },
      { id: "federated", title: "Федеративное обучение", component: <FederatedArticle /> },
      { id: "continual", title: "Непрерывное обучение", component: <ContinualArticle /> },
      { id: "active-learning", title: "Активное обучение", component: <ActiveLearningArticle /> },
    ],
  },
  {
    id: "llm",
    title: "Большие и малые языковые модели",
    subsections: [
      { id: "llm", title: "Большие языковые модели (LLM)", component: <LlmArticle /> },
      { id: "slm", title: "Малые языковые модели (SLM)", component: <SlmArticle /> },
      { id: "tokenization", title: "Токенизация", component: <TokenizationArticle /> },
      { id: "embeddings", title: "Эмбеддинги", component: <EmbeddingsArticle /> },
      { id: "pretraining-finetuning", title: "Предобучение и дообучение", component: <PretrainingArticle /> },
      { id: "rlhf", title: "RLHF", component: <RlhfArticle /> },
      { id: "prompt-engineering", title: "Промпт-инжиниринг", component: <PromptEngineeringArticle /> },
      { id: "in-context-learning", title: "In-context learning", component: <InContextArticle /> },
      { id: "rag", title: "RAG (генерация с поиском)", component: <RagArticle /> },
      { id: "context-window", title: "Контекстное окно", component: <ContextWindowArticle /> },
      { id: "hallucinations", title: "Галлюцинации моделей", component: <HallucinationsArticle /> },
      { id: "lora", title: "Fine-tuning и LoRA", component: <LoraArticle /> },
      { id: "quantization", title: "Квантизация моделей", component: <QuantizationArticle /> },
      { id: "distillation", title: "Дистилляция знаний", component: <DistillationArticle /> },
    ],
  },
  {
    id: "agents",
    title: "ИИ-агенты",
    subsections: [
      { id: "ai-agent", title: "Что такое ИИ-агент", component: <AiAgentArticle /> },
      { id: "tool-use", title: "Использование инструментов (tool use)", component: <ToolUseArticle /> },
      { id: "planning", title: "Планирование", component: <PlanningArticle /> },
      { id: "agent-memory", title: "Память агентов", component: <AgentMemoryArticle /> },
      { id: "multi-agent", title: "Мультиагентные системы", component: <MultiAgentArticle /> },
      { id: "react-pattern", title: "Паттерн ReAct", component: <ReactPatternArticle /> },
      { id: "autonomous-agents", title: "Автономные агенты", component: <AutonomousAgentsArticle /> },
    ],
  },
  {
    id: "modern-ai",
    title: "Современный ИИ: AGI и безопасность",
    subsections: [
      { id: "agi", title: "Общий ИИ (AGI)", component: <AgiArticle /> },
      { id: "asi", title: "Суперинтеллект (ASI)", component: <AsiArticle /> },
      { id: "alignment", title: "Согласование (alignment)", component: <AlignmentArticle /> },
      { id: "ai-safety", title: "Безопасность ИИ", component: <AiSafetyArticle /> },
      { id: "anthropic-rsp", title: "Anthropic RSP и уровни ASL", component: <AnthropicRspArticle /> },
      { id: "openai-charter", title: "OpenAI Charter", component: <OpenAiCharterArticle /> },
      { id: "interpretability", title: "Интерпретируемость моделей", component: <InterpretabilityArticle /> },
      { id: "ai-governance", title: "Регулирование и управление рисками", component: <AiGovernanceArticle /> },
    ],
  },
  {
    id: "cv",
    title: "Компьютерное зрение",
    subsections: [
      { id: "image-classification", title: "Классификация изображений", component: <ImageClassificationArticle /> },
      { id: "object-detection", title: "Детекция объектов (YOLO, R-CNN)", component: <ObjectDetectionArticle /> },
      { id: "segmentation", title: "Семантическая сегментация", component: <SegmentationArticle /> },
      { id: "face-recognition", title: "Распознавание лиц", component: <FaceRecognitionArticle /> },
      { id: "ocr", title: "Распознавание текста (OCR)", component: <OcrArticle /> },
      { id: "image-generation", title: "Генерация изображений", component: <ImageGenerationArticle /> },
      { id: "pose-estimation", title: "Оценка позы", component: <PoseEstimationArticle /> },
    ],
  },
  {
    id: "nlp",
    title: "Обработка естественного языка",
    subsections: [
      { id: "word-embeddings", title: "Векторные представления слов (Word2Vec)", component: <WordEmbeddingsArticle /> },
      { id: "ner", title: "Распознавание сущностей (NER)", component: <NerArticle /> },
      { id: "machine-translation", title: "Машинный перевод", component: <MachineTranslationArticle /> },
      { id: "summarization", title: "Суммаризация текста", component: <SummarizationArticle /> },
      { id: "question-answering", title: "Вопросно-ответные системы", component: <QuestionAnsweringArticle /> },
      { id: "sentiment", title: "Анализ тональности", component: <SentimentArticle /> },
      { id: "bert", title: "BERT", component: <BertArticle /> },
      { id: "gpt", title: "GPT", component: <GptArticle /> },
    ],
  },
  {
    id: "rl",
    title: "Обучение с подкреплением",
    subsections: [
      { id: "rl-basics", title: "Основы обучения с подкреплением", component: <RlBasicsArticle /> },
      { id: "q-learning", title: "Q-обучение", component: <QLearningArticle /> },
      { id: "dqn", title: "Deep Q-Network (DQN)", component: <DqnArticle /> },
      { id: "policy-gradient", title: "Policy Gradient", component: <PolicyGradientArticle /> },
      { id: "actor-critic", title: "Actor-Critic", component: <ActorCriticArticle /> },
      { id: "ppo", title: "Proximal Policy Optimization (PPO)", component: <PpoArticle /> },
      { id: "alphago", title: "AlphaGo и игры", component: <AlphaGoArticle /> },
    ],
  },
  {
    id: "frameworks",
    title: "Фреймворки и инструменты",
    subsections: [
      { id: "tensorflow", title: "TensorFlow", component: <TensorFlowArticle /> },
      { id: "pytorch", title: "PyTorch", component: <PyTorchArticle /> },
      { id: "keras", title: "Keras", component: <KerasArticle /> },
      { id: "scikit-learn", title: "Scikit-learn", component: <ScikitLearnArticle /> },
      { id: "huggingface", title: "Hugging Face", component: <HuggingFaceArticle /> },
      { id: "jax", title: "JAX", component: <JaxArticle /> },
      { id: "onnx", title: "ONNX", component: <OnnxArticle /> },
      { id: "cuda", title: "CUDA и вычисления на GPU", component: <CudaArticle /> },
      { id: "tensorboard", title: "TensorBoard", component: <TensorboardArticle /> },
      { id: "experiment-tracking", title: "MLflow и Weights & Biases", component: <ExperimentTrackingArticle /> },
    ],
  },
  {
    id: "mlops",
    title: "Развёртывание и MLOps",
    subsections: [
      { id: "model-serving", title: "Сервинг моделей", component: <ModelServingArticle /> },
      { id: "mlops", title: "MLOps: жизненный цикл модели", component: <MlopsArticle /> },
      { id: "monitoring", title: "Мониторинг моделей", component: <MonitoringArticle /> },
      { id: "edge-ai", title: "Edge AI и встраиваемые модели", component: <EdgeAiArticle /> },
      { id: "ab-testing", title: "A/B тестирование", component: <AbTestingArticle /> },
      { id: "vector-db", title: "Векторные базы данных", component: <VectorDbArticle /> },
      { id: "model-compression", title: "Сжатие моделей", component: <ModelCompressionArticle /> },
    ],
  },
  {
    id: "ru-ai",
    title: "Российский ИИ и AI Journey",
    subsections: [
      { id: "gigachat", title: "GigaChat", component: <GigaChatArticle /> },
      { id: "yandexgpt", title: "YandexGPT", component: <YandexGptArticle /> },
      { id: "kandinsky", title: "Kandinsky", component: <KandinskyArticle /> },
      { id: "ai-journey", title: "Конференция AI Journey", component: <AiJourneyArticle /> },
      { id: "russian-datasets", title: "Отечественные датасеты", component: <RussianDatasetsArticle /> },
      { id: "ru-ai-ecosystem", title: "Экосистема российского ИИ", component: <RuAiEcosystemArticle /> },
    ],
  },
  {
    id: "terminology-dict",
    title: "Словарь терминов",
    subsections: [{ id: "glossary", title: "Все термины", component: <GlossaryView /> }],
  },
];

const totalTopics = sections.reduce((n, s) => n + s.subsections.length, 0);
const readyTopics = sections.reduce(
  (n, s) => n + s.subsections.filter((x) => x.component).length,
  0
);

const KnowledgePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubsection, setSelectedSubsection] =
    useState<Subsection | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    sections[0].id
  );
  const [query, setQuery] = useState("");

  const isMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const [sidebarOpen, setSidebarOpen] = useState(
    () => !(searchParams.get("article") && isMobile())
  );

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (!articleId) return;
    for (const section of sections) {
      const sub = section.subsections.find(
        (s) => s.id === articleId && s.component
      );
      if (sub) {
        setSelectedSubsection(sub);
        setOpenSectionId(section.id);

        if (isMobile()) setSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      }
    }
  }, [searchParams]);

  const handleSectionClick = (id: string) => {
    setOpenSectionId(id === openSectionId ? null : id);
  };

  const selectSub = (section: Section, sub: Subsection) => {
    if (!sub.component) return;
    setSelectedSubsection(sub);
    setOpenSectionId(section.id);
    setSearchParams({ article: sub.id });

    if (isMobile()) setSidebarOpen(false);
  };

  const visibleSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        subsections: s.subsections.filter((sub) =>
          sub.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.subsections.length > 0);
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div className={styles.knowledgePage}>
      <button
        className={styles.burger}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? "Скрыть меню" : "Показать меню"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? (
          <span className={styles.iconClose}>
            <i />
            <i />
          </span>
        ) : (
          <span className={styles.iconBurger}>
            <i />
            <i />
            <i />
          </span>
        )}
      </button>
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? "" : styles.sidebarHidden
        }`}
      >
        <input
          className={styles.search}
          placeholder="Поиск по темам…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav>
          {visibleSections.map((section) => (
            <div key={section.id} className={styles.section}>
              <div
                className={styles.sectionTitle}
                onClick={() => handleSectionClick(section.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSectionClick(section.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={searching || openSectionId === section.id}
              >
                {section.title}
              </div>
              {(searching || openSectionId === section.id) && (
                <ul className={styles.subsectionList}>
                  {section.subsections.map((sub) => {
                    const ready = !!sub.component;
                    return (
                      <li
                        key={sub.id}
                        className={`${
                          selectedSubsection?.id === sub.id ? styles.active : ""
                        } ${!ready ? styles.subDisabled : ""}`}
                        onClick={() => selectSub(section, sub)}
                        onKeyDown={(e) => {
                          if (ready && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            selectSub(section, sub);
                          }
                        }}
                        role="button"
                        tabIndex={ready ? 0 : -1}
                        aria-disabled={!ready}
                        aria-current={
                          selectedSubsection?.id === sub.id ? "page" : undefined
                        }
                      >
                        {sub.title}
                        {!ready && <span className={styles.badge}>скоро</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
          {visibleSections.length === 0 && (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Ничего не найдено
            </p>
          )}
        </nav>
      </aside>

      <main className={styles.content}>
        {selectedSubsection?.component ? (
          <article>{selectedSubsection.component}</article>
        ) : (
          <div className={styles.intro}>
            <h2>База знаний по нейронным сетям</h2>
            <p>
              Каталог из {totalTopics} тем
              {readyTopics >= totalTopics
                ? " — все статьи доступны."
                : `; ${readyTopics} статей уже доступны, остальные в работе.`}{" "}
              Структура соответствует дисциплинам кафедры анализа данных и
              искусственного интеллекта КубГУ, а содержание опирается на
              проверенные учебники и научные работы (см. «Источники» в каждой
              статье).
            </p>
            <p>
              Выберите тему в меню слева или воспользуйтесь поиском. Термины в
              статьях подсвечены — наведите курсор, чтобы увидеть определение.
            </p>
            <p>
              <a
                href="https://kubsu.ru/ru/fktipm/kafedra-analiza-dannyh-i-iskusstvennogo-intellekta"
                target="_blank"
                rel="noreferrer"
              >
                Кафедра анализа данных и ИИ, ФКТиПМ КубГУ ↗
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgePage;
