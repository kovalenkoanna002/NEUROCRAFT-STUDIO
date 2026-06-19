import React from "react";
import {
  Article,
  Title,
  Lead,
  H2,
  Ul,
  Callout,
  Sources,
} from "../components/ArticleKit";
import { REFS } from "../references";

const TokenizationArticle: React.FC = () => (
  <Article>
    <Title>Токенизация</Title>
    <Lead>
      Прежде чем подать текст в модель, его разбивают на токены — небольшие
      единицы (части слов). Модель работает не с буквами и не с целыми словами, а
      именно с токенами.
    </Lead>

    <H2>Почему не слова и не буквы</H2>
    <Ul
      items={[
        "Словарь из всех слов был бы огромным и не справлялся с новыми словами.",
        "Отдельные буквы делают последовательности слишком длинными.",
        "Подслова (subword) — компромисс: частые слова — один токен, редкие — несколько.",
      ]}
    />

    <H2>Популярные алгоритмы</H2>
    <Ul
      items={[
        "BPE (Byte-Pair Encoding) — итеративно склеивает частые пары символов.",
        "WordPiece — используется в BERT.",
        "SentencePiece / Unigram — не зависят от пробелов, удобны для разных языков.",
      ]}
    />

    <Callout variant="info">
      От токенизации зависит «стоимость» запроса: тарифы и длина контекста LLM
      считаются в токенах, а не в словах. Для русского текста токенов на слово,
      как правило, больше, чем для английского.
    </Callout>

    <Sources refs={[REFS.transformer2017, REFS.huggingface, REFS.nikolenko]} />
  </Article>
);

export default TokenizationArticle;
