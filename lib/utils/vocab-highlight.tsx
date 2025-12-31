/**
 * Highlight Vocabulary Helper
 * Format contoh kalimat dengan kata vocab yang di-bold dan italic
 */

/**
 * Highlight kata vocab dalam kalimat dengan <strong><em>
 * Contoh: "I like to run in the morning" + "run" 
 * → "I like to <strong><em>run</em></strong> in the morning"
 */
export function highlightVocabInSentence(sentence: string, vocabWord: string): string {
    if (!sentence || !vocabWord) return sentence;

    // Case-insensitive replacement untuk handle "Run" vs "run"
    const regex = new RegExp(`\\b(${vocabWord})\\b`, 'gi');

    return sentence.replace(regex, '<strong><em>$1</em></strong>');
}

/**
 * Component untuk render HTML yang sudah di-highlight
 * Gunakan dangerouslySetInnerHTML untuk render <strong><em>
 */
export function VocabSentence({ sentence, vocab }: { sentence: string; vocab: string }) {
    const highlighted = highlightVocabInSentence(sentence, vocab);

    return (
        <span
            className="text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: highlighted }}
        />
    );
}

/**
 * Parse example sentence untuk extract highlighted words
 * Contoh: "I like to ***run*** in the morning"
 * Markdown style: menggunakan *** untuk bold+italic
 */
export function parseMarkdownHighlight(sentence: string): string {
    return sentence.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
}
