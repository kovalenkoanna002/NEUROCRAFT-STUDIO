import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  Ul,
  CodeBlock,
  Callout,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const CODE = `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)
print(clf.score(X_test, y_test))`;

const ScikitLearnArticle: React.FC = () => (
  <Article>
    <Title>Scikit-learn</Title>
    <Lead>
      Scikit-learn — библиотека классического машинного обучения на Python: не
      нейросети, но регрессии, деревья, кластеризация и инструменты подготовки
      данных.
    </Lead>

    <H2>Что внутри</H2>
    <Ul
      items={[
        "Классификация, регрессия, кластеризация, снижение размерности.",
        "Единый интерфейс fit / predict / transform для всех моделей.",
        "Готовые инструменты: масштабирование, кросс-валидация, метрики, подбор гиперпараметров.",
      ]}
    />

    <H2>Пример</H2>
    <CodeBlock code={CODE} language="python" />

    <Callout variant="info">
      На табличных данных классические методы (градиентный бустинг, случайный лес)
      нередко не уступают нейросетям и обучаются быстрее. Scikit-learn — отличная
      отправная точка.
    </Callout>

    <H2>Что внутри помимо моделей</H2>
    <Ul
      items={[
        "Pipeline — объединяет предобработку и модель в единый объект.",
        "Подбор гиперпараметров: GridSearchCV, RandomizedSearchCV.",
        "Метрики и кросс-валидация для честной оценки качества.",
      ]}
    />

    <Sources refs={[REFS.sklearn, REFS.goodfellow]} />
  </Article>
);

export default ScikitLearnArticle;
