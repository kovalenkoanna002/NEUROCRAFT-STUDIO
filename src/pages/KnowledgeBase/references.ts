export interface Reference {
  authors: string;
  title: string;
  source: string;
  url?: string;
}

export const REFS: Record<string, Reference> = {
  nikolenko: {
    authors: "Николенко С. И., Кадурин А. А., Архангельская Е. О.",
    title: "Глубокое обучение. Погружение в мир нейронных сетей",
    source: "СПб.: Питер, 2018. — 480 с. ISBN 978-5-4461-1537-2",
    url: "https://www.piter.com/product/glubokoe-obuchenie",
  },
  goodfellow: {
    authors: "Goodfellow I., Bengio Y., Courville A.",
    title: "Deep Learning",
    source: "MIT Press, 2016. — 800 p. ISBN 978-0-262-03561-3",
    url: "https://www.deeplearningbook.org/",
  },
  lecun1998: {
    authors: "LeCun Y., Bottou L., Bengio Y., Haffner P.",
    title: "Gradient-Based Learning Applied to Document Recognition",
    source: "Proceedings of the IEEE, 1998. Vol. 86, № 11. — P. 2278–2324",
  },
  rumelhart1986: {
    authors: "Rumelhart D. E., Hinton G. E., Williams R. J.",
    title: "Learning representations by back-propagating errors",
    source: "Nature, 1986. Vol. 323. — P. 533–536",
    url: "https://www.nature.com/articles/323533a0",
  },
  nairHinton2010: {
    authors: "Nair V., Hinton G. E.",
    title: "Rectified Linear Units Improve Restricted Boltzmann Machines",
    source: "Proceedings of ICML, 2010",
    url: "https://www.cs.toronto.edu/~hinton/absps/reluICML.pdf",
  },
  kubsuDept: {
    authors: "Кафедра анализа данных и искусственного интеллекта, ФКТиПМ",
    title:
      "Дисциплины «Математические модели нейронных сетей», «Нейросетевые технологии», «Глубокое обучение», «Технологии компьютерного зрения»",
    source: "Кубанский государственный университет",
    url: "https://kubsu.ru/ru/fktipm/kafedra-analiza-dannyh-i-iskusstvennogo-intellekta",
  },
  kubsuProgram: {
    authors: "Кубанский государственный университет",
    title:
      "Образовательная программа «Прикладная информатика (Искусственный интеллект и машинное обучение)», направление 09.03.03",
    source: "Факультет компьютерных технологий и прикладной математики",
    url: "https://www.kubsu.ru/ru/fktipm/prikladnaya-informatika-iskusstvennyy-intellekt-i-mashinnoe-obuchenie",
  },
  rosenblatt1958: {
    authors: "Rosenblatt F.",
    title:
      "The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain",
    source: "Psychological Review, 1958. Vol. 65, № 6. — P. 386–408",
  },
  lstm1997: {
    authors: "Hochreiter S., Schmidhuber J.",
    title: "Long Short-Term Memory",
    source: "Neural Computation, 1997. Vol. 9, № 8. — P. 1735–1780",
    url: "https://direct.mit.edu/neco/article/9/8/1735/6109",
  },
  gru2014: {
    authors: "Cho K. et al.",
    title:
      "Learning Phrase Representations using RNN Encoder–Decoder for Statistical Machine Translation",
    source: "EMNLP, 2014. arXiv:1406.1078",
    url: "https://arxiv.org/abs/1406.1078",
  },
  transformer2017: {
    authors: "Vaswani A. et al.",
    title: "Attention Is All You Need",
    source: "Advances in Neural Information Processing Systems (NeurIPS), 2017",
    url: "https://arxiv.org/abs/1706.03762",
  },
  gan2014: {
    authors: "Goodfellow I. et al.",
    title: "Generative Adversarial Nets",
    source:
      "Advances in Neural Information Processing Systems (NeurIPS), 2014. — P. 2672–2680",
    url: "https://arxiv.org/abs/1406.2661",
  },
  vae2013: {
    authors: "Kingma D. P., Welling M.",
    title: "Auto-Encoding Variational Bayes",
    source: "International Conference on Learning Representations (ICLR), 2014. arXiv:1312.6114",
    url: "https://arxiv.org/abs/1312.6114",
  },
  gnn2009: {
    authors: "Scarselli F. et al.",
    title: "The Graph Neural Network Model",
    source: "IEEE Transactions on Neural Networks, 2009. Vol. 20, № 1. — P. 61–80",
  },
  gcn2017: {
    authors: "Kipf T. N., Welling M.",
    title: "Semi-Supervised Classification with Graph Convolutional Networks",
    source: "International Conference on Learning Representations (ICLR), 2017",
    url: "https://arxiv.org/abs/1609.02907",
  },
  dropout2014: {
    authors: "Srivastava N. et al.",
    title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
    source: "Journal of Machine Learning Research, 2014. Vol. 15. — P. 1929–1958",
    url: "https://jmlr.org/papers/v15/srivastava14a.html",
  },
  batchnorm2015: {
    authors: "Ioffe S., Szegedy C.",
    title:
      "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift",
    source: "International Conference on Machine Learning (ICML), 2015. arXiv:1502.03167",
    url: "https://arxiv.org/abs/1502.03167",
  },
  tensorflow: {
    authors: "Abadi M. et al.",
    title:
      "TensorFlow: Large-Scale Machine Learning on Heterogeneous Distributed Systems",
    source: "Google Research, 2016. arXiv:1603.04467; tensorflow.org",
    url: "https://www.tensorflow.org/",
  },
  pytorch: {
    authors: "Paszke A. et al.",
    title:
      "PyTorch: An Imperative Style, High-Performance Deep Learning Library",
    source: "Advances in Neural Information Processing Systems (NeurIPS), 2019",
    url: "https://pytorch.org/",
  },
  keras: {
    authors: "Chollet F. et al.",
    title: "Keras — высокоуровневый API для глубокого обучения",
    source: "Официальная документация, 2015–н.в.",
    url: "https://keras.io/",
  },
  sklearn: {
    authors: "Pedregosa F. et al.",
    title: "Scikit-learn: Machine Learning in Python",
    source: "Journal of Machine Learning Research, 2011. Vol. 12. — P. 2825–2830",
    url: "https://scikit-learn.org/",
  },
  huggingface: {
    authors: "Wolf T. et al.",
    title: "Transformers: State-of-the-Art Natural Language Processing",
    source: "Proceedings of EMNLP, 2020. — P. 38–45",
    url: "https://huggingface.co/",
  },
  kolmogorov1957: {
    authors: "Колмогоров А. Н.",
    title:
      "О представлении непрерывных функций нескольких переменных в виде суперпозиции непрерывных функций одного переменного и сложения",
    source: "Доклады АН СССР, 1957. Т. 114, № 5. — С. 953–956",
  },
  arnold1957: {
    authors: "Арнольд В. И.",
    title:
      "О функциях трёх переменных (о представлении непрерывных функций суперпозициями функций меньшего числа переменных)",
    source: "Доклады АН СССР, 1957. Т. 114, № 4. — С. 679–681",
  },
  cybenko1989: {
    authors: "Cybenko G.",
    title: "Approximation by Superpositions of a Sigmoidal Function",
    source: "Mathematics of Control, Signals and Systems, 1989. Vol. 2. — P. 303–314",
  },
  kan2024: {
    authors: "Liu Z. et al.",
    title: "KAN: Kolmogorov–Arnold Networks",
    source: "arXiv:2404.19756, 2024",
    url: "https://arxiv.org/abs/2404.19756",
  },
  searle1980: {
    authors: "Searle J. R.",
    title: "Minds, Brains, and Programs",
    source: "Behavioral and Brain Sciences, 1980. Vol. 3, № 3. — P. 417–457",
  },
  bostrom2014: {
    authors: "Bostrom N.",
    title: "Superintelligence: Paths, Dangers, Strategies",
    source: "Oxford University Press, 2014",
  },
  openaiCharter: {
    authors: "OpenAI",
    title: "OpenAI Charter",
    source: "Официальный документ, 2018",
    url: "https://openai.com/charter/",
  },
  anthropicRSP: {
    authors: "Anthropic",
    title: "Responsible Scaling Policy (AI Safety Levels, ASL)",
    source: "Официальный документ Anthropic",
    url: "https://www.anthropic.com/news/anthropics-responsible-scaling-policy",
  },
  aiJourney: {
    authors: "Сбер",
    title:
      "AI Journey — международная конференция по искусственному интеллекту",
    source: "Материалы конференции AI Journey",
    url: "https://aij.ru/",
  },
  he2016: {
    authors: "He K., Zhang X., Ren S., Sun J.",
    title: "Deep Residual Learning for Image Recognition",
    source: "IEEE CVPR, 2016. arXiv:1512.03385",
    url: "https://arxiv.org/abs/1512.03385",
  },
  ho2020: {
    authors: "Ho J., Jain A., Abbeel P.",
    title: "Denoising Diffusion Probabilistic Models",
    source: "Advances in Neural Information Processing Systems (NeurIPS), 2020",
    url: "https://arxiv.org/abs/2006.11239",
  },
  lewis2020: {
    authors: "Lewis P. et al.",
    title:
      "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    source: "Advances in Neural Information Processing Systems (NeurIPS), 2020",
    url: "https://arxiv.org/abs/2005.11401",
  },
  mikolov2013: {
    authors: "Mikolov T. et al.",
    title: "Efficient Estimation of Word Representations in Vector Space",
    source: "arXiv:1301.3781, 2013",
    url: "https://arxiv.org/abs/1301.3781",
  },
  mnih2015: {
    authors: "Mnih V. et al.",
    title: "Human-level control through deep reinforcement learning",
    source: "Nature, 2015. Vol. 518. — P. 529–533",
    url: "https://www.nature.com/articles/nature14236",
  },
  sutton2018: {
    authors: "Sutton R. S., Barto A. G.",
    title: "Reinforcement Learning: An Introduction",
    source: "2nd ed. — MIT Press, 2018",
    url: "http://incompleteideas.net/book/the-book-2nd.html",
  },
  silver2016: {
    authors: "Silver D. et al.",
    title:
      "Mastering the game of Go with deep neural networks and tree search",
    source: "Nature, 2016. Vol. 529. — P. 484–489",
    url: "https://www.nature.com/articles/nature16961",
  },
  schulman2017: {
    authors: "Schulman J. et al.",
    title: "Proximal Policy Optimization Algorithms",
    source: "arXiv:1707.06347, 2017",
    url: "https://arxiv.org/abs/1707.06347",
  },
  watkins1992: {
    authors: "Watkins C. J. C. H., Dayan P.",
    title: "Q-learning",
    source: "Machine Learning, 1992. Vol. 8. — P. 279–292",
  },
  hinton2015: {
    authors: "Hinton G., Vinyals O., Dean J.",
    title: "Distilling the Knowledge in a Neural Network",
    source: "arXiv:1503.02531, 2015",
    url: "https://arxiv.org/abs/1503.02531",
  },
  redmon2016: {
    authors: "Redmon J., Divvala S., Girshick R., Farhadi A.",
    title: "You Only Look Once: Unified, Real-Time Object Detection",
    source: "IEEE CVPR, 2016. arXiv:1506.02640",
    url: "https://arxiv.org/abs/1506.02640",
  },
  gigachat: {
    authors: "Сбер",
    title: "GigaChat — российская мультимодальная нейросетевая модель",
    source: "Официальная документация Сбера",
    url: "https://developers.sber.ru/portal/products/gigachat",
  },
  yandexgpt: {
    authors: "Яндекс",
    title: "YandexGPT — языковая модель Яндекса",
    source: "Официальная документация Яндекса",
    url: "https://ya.ru/ai/gpt",
  },
  kandinsky: {
    authors: "Сбер",
    title: "Kandinsky — генеративная модель изображений",
    source: "Сбер / проект Kandinsky",
    url: "https://www.sberbank.com/promo/kandinsky/",
  },
};
