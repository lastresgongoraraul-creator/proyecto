"""
trending_service.py
───────────────────
Extrae "temas de tendencia" de un lote de mensajes de chat usando TF-IDF.
Es stateless: recibe los mensajes en la petición, devuelve los top keywords.
El estado (ventana de mensajes) vive en el chat-service para no acoplar los
dos microservicios a una BD compartida en tiempo real.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Stopwords combinadas ES + EN para chats de videojuegos
STOP_WORDS = [
    # Español
    "de", "la", "el", "en", "y", "a", "los", "las", "un", "una",
    "que", "es", "se", "no", "con", "por", "del", "al", "para",
    "lo", "más", "su", "este", "como", "si", "pero", "ya", "le",
    "me", "te", "mi", "tu", "hay", "bien", "muy", "también",
    # Inglés
    "the", "is", "it", "in", "on", "at", "to", "a", "an", "and",
    "or", "but", "of", "for", "this", "that", "i", "me", "my",
    "you", "he", "she", "we", "they", "are", "was", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would",
    "its", "not", "from", "with", "can", "so", "if", "up", "as",
    "just", "like", "get", "got", "im", "dont", "its", "what",
    # Jerga de chat
    "jaja", "jeje", "lol", "xd", "ok", "sí", "no", "q",
    "k", "x", "tb", "tmb", "pq", "xq",
]


class TrendingService:
    """
    Servicio de extracción de tendencias.

    Uso:
        service = TrendingService()
        topics = service.extract_topics(messages, top_n=8)
    """

    def extract_topics(self, messages: list[str], top_n: int = 8) -> list[dict]:
        """
        Dado un listado de mensajes, extrae las palabras / términos más
        relevantes usando TF-IDF.

        Args:
            messages: Lista de strings (textos de chat).
            top_n:    Número de topics a devolver.

        Returns:
            Lista de dicts {"term": str, "score": float, "count": int}
            ordenada de mayor a menor score.
        """
        if not messages:
            return []

        # Necesitamos al menos 2 documentos para TF-IDF
        # Si hay muy pocos, usamos frecuencia de términos directa
        if len(messages) < 2:
            return self._fallback_freq(messages, top_n)

        try:
            vectorizer = TfidfVectorizer(
                stop_words=STOP_WORDS,
                min_df=1,
                max_df=0.95,
                ngram_range=(1, 2),   # unigramas + bigramas para capturar frases
                token_pattern=r"(?u)\b[a-záéíóúüñ\w]{3,}\b",
                max_features=500,
            )

            tfidf_matrix = vectorizer.fit_transform(messages)
            feature_names = vectorizer.get_feature_names_out()

            # Suma de scores TF-IDF por término a lo largo de todos los docs
            scores = np.asarray(tfidf_matrix.sum(axis=0)).flatten()

            # Frecuencia bruta (nº de mensajes que contienen el término)
            binary_matrix = (tfidf_matrix > 0).toarray()
            counts = binary_matrix.sum(axis=0)

            top_indices = scores.argsort()[::-1][:top_n]

            return [
                {
                    "term": feature_names[i],
                    "score": round(float(scores[i]), 4),
                    "count": int(counts[i])
                }
                for i in top_indices
                if scores[i] > 0
            ]

        except Exception as exc:
            logger.warning("TF-IDF extraction failed, falling back: %s", exc)
            return self._fallback_freq(messages, top_n)

    # ─── Fallback para cuando hay muy pocos mensajes ─────────────────────────
    def _fallback_freq(self, messages: list[str], top_n: int) -> list[dict]:
        from collections import Counter
        import re

        stop = set(STOP_WORDS)
        counter: Counter = Counter()

        for msg in messages:
            words = re.findall(r"[a-záéíóúüñ\w]{3,}", msg.lower())
            for w in words:
                if w not in stop:
                    counter[w] += 1

        return [
            {"term": term, "score": float(count), "count": count}
            for term, count in counter.most_common(top_n)
        ]


# Singleton
_trending_service: TrendingService | None = None


def get_trending_service() -> TrendingService:
    global _trending_service
    if _trending_service is None:
        _trending_service = TrendingService()
    return _trending_service
