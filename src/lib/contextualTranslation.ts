/**
 * 上下文感知翻译系统 - 分析段落/页面上下文，提供更准确的翻译
 */

interface ContextualSentence {
  id: string;
  text: string;
  position: number;
  dependencies: string[]; // 依赖的其他句子ID
  semanticRelations: SemanticRelation[];
}

interface SemanticRelation {
  type: 'reference' | 'continuation' | 'contrast' | 'causation' | 'temporal';
  targetSentenceId: string;
  confidence: number;
}

interface ContextualTranslation {
  sentenceId: string;
  originalText: string;
  translatedText: string;
  confidence: number;
  contextualAdjustments: ContextualAdjustment[];
}

interface ContextualAdjustment {
  type: 'pronoun' | 'tense' | 'terminology' | 'tone' | 'cultural';
  original: string;
  adjusted: string;
  reason: string;
}

interface DocumentContext {
  id: string;
  title?: string;
  domain: string;
  sentences: ContextualSentence[];
  globalTerminology: Map<string, string>;
  documentTone: 'formal' | 'informal' | 'technical' | 'academic' | 'creative';
  createdAt: number;
}

class ContextualTranslationEngine {
  private documentContexts = new Map<string, DocumentContext>();
  private contextPatterns = new Map<string, RegExp[]>();
  private terminologyExtractor: TerminologyExtractor;
  private semanticAnalyzer: SemanticAnalyzer;
  private tonalAnalyzer: TonalAnalyzer;
  private initialized = false;

  constructor() {
    this.terminologyExtractor = new TerminologyExtractor();
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.tonalAnalyzer = new TonalAnalyzer();
  }

  /**
   * 初始化上下文感知系统
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.initializeContextPatterns();
    await this.terminologyExtractor.initialize();
    await this.semanticAnalyzer.initialize();
    await this.tonalAnalyzer.initialize();

    this.initialized = true;
    console.log('Contextual Translation Engine initialized');
  }

  /**
   * 初始化上下文模式
   */
  private async initializeContextPatterns(): Promise<void> {
    // 代词模式
    this.contextPatterns.set('pronouns', [
      /\b(this|that|these|those|it|they|them|their|its)\b/gi,
      /\b(这|那|它|他们|她们|它们|其|其中)\b/g
    ]);

    // 时态模式
    this.contextPatterns.set('temporal', [
      /\b(before|after|then|next|previously|subsequently|meanwhile|simultaneously)\b/gi,
      /\b(之前|之后|然后|接下来|先前|随后|同时|与此同时)\b/g
    ]);

    // 因果关系模式
    this.contextPatterns.set('causation', [
      /\b(because|since|therefore|thus|consequently|as a result|due to)\b/gi,
      /\b(因为|由于|所以|因此|结果|导致)\b/g
    ]);

    // 对比模式
    this.contextPatterns.set('contrast', [
      /\b(however|but|nevertheless|on the other hand|in contrast|whereas)\b/gi,
      /\b(然而|但是|不过|另一方面|相比之下|而)\b/g
    ]);
  }

  /**
   * 创建文档上下文
   */
  async createDocumentContext(
    documentId: string,
    sentences: string[],
    metadata?: {
      title?: string;
      domain?: string;
      url?: string;
    }
  ): Promise<DocumentContext> {
    const contextualSentences = await this.analyzeSentences(sentences);
    const globalTerminology = await this.terminologyExtractor.extractGlobalTerminology(sentences);
    const documentTone = await this.tonalAnalyzer.analyzeTone(sentences.join(' '));

    const context: DocumentContext = {
      id: documentId,
      title: metadata?.title,
      domain: metadata?.domain || await this.detectDomain(sentences),
      sentences: contextualSentences,
      globalTerminology,
      documentTone,
      createdAt: Date.now()
    };

    this.documentContexts.set(documentId, context);
    return context;
  }

  /**
   * 分析句子关系
   */
  private async analyzeSentences(sentences: string[]): Promise<ContextualSentence[]> {
    const contextualSentences: ContextualSentence[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const id = `sentence_${i}`;
      
      const dependencies = await this.findDependencies(sentence, sentences, i);
      const semanticRelations = await this.semanticAnalyzer.analyzeRelations(
        sentence, sentences, i
      );

      contextualSentences.push({
        id,
        text: sentence,
        position: i,
        dependencies,
        semanticRelations
      });
    }

    return contextualSentences;
  }

  /**
   * 查找句子依赖关系
   */
  private async findDependencies(
    sentence: string,
    allSentences: string[],
    currentIndex: number
  ): Promise<string[]> {
    const dependencies: string[] = [];

    // 检查代词引用
    const pronounPatterns = this.contextPatterns.get('pronouns') || [];
    let hasPronoun = false;
    
    for (const pattern of pronounPatterns) {
      if (pattern.test(sentence)) {
        hasPronoun = true;
        break;
      }
    }

    if (hasPronoun && currentIndex > 0) {
      // 查找前面的句子作为依赖
      const lookBack = Math.min(3, currentIndex); // 最多回溯3个句子
      for (let i = currentIndex - lookBack; i < currentIndex; i++) {
        dependencies.push(`sentence_${i}`);
      }
    }

    // 检查连接词
    const connectionPatterns = [
      ...this.contextPatterns.get('temporal') || [],
      ...this.contextPatterns.get('causation') || [],
      ...this.contextPatterns.get('contrast') || []
    ];

    for (const pattern of connectionPatterns) {
      if (pattern.test(sentence) && currentIndex > 0) {
        dependencies.push(`sentence_${currentIndex - 1}`);
        break;
      }
    }

    return dependencies;
  }

  /**
   * 上下文感知翻译
   */
  async translateWithContext(
    documentId: string,
    sentenceIndex: number,
    source: string,
    target: string,
    baseTranslation?: string
  ): Promise<ContextualTranslation> {
    const context = this.documentContexts.get(documentId);
    if (!context) {
      throw new Error(`Document context not found: ${documentId}`);
    }

    const sentence = context.sentences[sentenceIndex];
    if (!sentence) {
      throw new Error(`Sentence not found: ${sentenceIndex}`);
    }

    // 获取基础翻译
    let translatedText = baseTranslation || sentence.text;
    const adjustments: ContextualAdjustment[] = [];

    // 应用上下文调整
    translatedText = await this.applyContextualAdjustments(
      sentence,
      context,
      translatedText,
      source,
      target,
      adjustments
    );

    // 计算置信度
    const confidence = this.calculateContextualConfidence(sentence, context, adjustments);

    return {
      sentenceId: sentence.id,
      originalText: sentence.text,
      translatedText,
      confidence,
      contextualAdjustments: adjustments
    };
  }

  /**
   * 应用上下文调整
   */
  private async applyContextualAdjustments(
    sentence: ContextualSentence,
    context: DocumentContext,
    translation: string,
    source: string,
    target: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjustedTranslation = translation;

    // 1. 代词消歧
    adjustedTranslation = await this.resolvePronounReferences(
      sentence,
      context,
      adjustedTranslation,
      source,
      target,
      adjustments
    );

    // 2. 术语一致性
    adjustedTranslation = await this.enforceTerminologyConsistency(
      context,
      adjustedTranslation,
      adjustments
    );

    // 3. 语调一致性
    adjustedTranslation = await this.adjustTone(
      context,
      adjustedTranslation,
      source,
      target,
      adjustments
    );

    // 4. 时态一致性
    adjustedTranslation = await this.adjustTense(
      sentence,
      context,
      adjustedTranslation,
      source,
      target,
      adjustments
    );

    // 5. 文化适应性调整
    adjustedTranslation = await this.applyCulturalAdjustments(
      adjustedTranslation,
      source,
      target,
      context.domain,
      adjustments
    );

    return adjustedTranslation;
  }

  /**
   * 代词引用消歧
   */
  private async resolvePronounReferences(
    sentence: ContextualSentence,
    context: DocumentContext,
    translation: string,
    source: string,
    target: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    if (sentence.dependencies.length === 0) return translation;

    let adjustedTranslation = translation;

    // 查找前文中的主语/宾语
    for (const depId of sentence.dependencies) {
      const depSentence = context.sentences.find(s => s.id === depId);
      if (!depSentence) continue;

      // 提取潜在的指代对象
      const referents = await this.extractReferents(depSentence.text, source);
      
      // 替换模糊的代词
      if (source === 'en' && target === 'zh') {
        adjustedTranslation = this.replaceEnglishPronouns(
          adjustedTranslation,
          referents,
          adjustments
        );
      } else if (source === 'zh' && target === 'en') {
        adjustedTranslation = this.replaceChinesePronouns(
          adjustedTranslation,
          referents,
          adjustments
        );
      }
    }

    return adjustedTranslation;
  }

  /**
   * 提取指代对象
   */
  private async extractReferents(text: string, language: string): Promise<string[]> {
    const referents: string[] = [];

    if (language === 'en') {
      // 提取英语主语
      const subjectPattern = /^([A-Z][a-zA-Z\s]*?)(?:\s+(?:is|are|was|were|has|have|will|can|could|should|would))/;
      const match = text.match(subjectPattern);
      if (match) {
        referents.push(match[1].trim());
      }
    } else if (language === 'zh') {
      // 提取中文主语（简化处理）
      const subjectPattern = /^([^，。！？；]*?)(?:是|在|有|会|能|应该|将要)/;
      const match = text.match(subjectPattern);
      if (match) {
        referents.push(match[1].trim());
      }
    }

    return referents;
  }

  /**
   * 替换英语代词
   */
  private replaceEnglishPronouns(
    translation: string,
    referents: string[],
    adjustments: ContextualAdjustment[]
  ): string {
    if (referents.length === 0) return translation;

    let adjusted = translation;
    const primaryReferent = referents[0];

    // 替换常见代词
    const pronounReplacements = [
      { pattern: /\b它\b/g, replacement: primaryReferent },
      { pattern: /\b这个\b/g, replacement: `这个${primaryReferent}` },
      { pattern: /\b那个\b/g, replacement: `那个${primaryReferent}` }
    ];

    pronounReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(adjusted)) {
        const original = adjusted;
        adjusted = adjusted.replace(pattern, replacement);
        
        if (original !== adjusted) {
          adjustments.push({
            type: 'pronoun',
            original: pattern.toString(),
            adjusted: replacement,
            reason: `代词消歧，指代对象：${primaryReferent}`
          });
        }
      }
    });

    return adjusted;
  }

  /**
   * 替换中文代词
   */
  private replaceChinesePronouns(
    translation: string,
    referents: string[],
    adjustments: ContextualAdjustment[]
  ): string {
    if (referents.length === 0) return translation;

    let adjusted = translation;
    const primaryReferent = referents[0];

    // 替换常见代词
    const pronounReplacements = [
      { pattern: /\bit\b/g, replacement: `the ${primaryReferent}` },
      { pattern: /\bthis\b/g, replacement: `this ${primaryReferent}` },
      { pattern: /\bthat\b/g, replacement: `that ${primaryReferent}` }
    ];

    pronounReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(adjusted)) {
        const original = adjusted;
        adjusted = adjusted.replace(pattern, replacement);
        
        if (original !== adjusted) {
          adjustments.push({
            type: 'pronoun',
            original: pattern.toString(),
            adjusted: replacement,
            reason: `Pronoun disambiguation, referent: ${primaryReferent}`
          });
        }
      }
    });

    return adjusted;
  }

  /**
   * 强制术语一致性
   */
  private async enforceTerminologyConsistency(
    context: DocumentContext,
    translation: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjustedTranslation = translation;

    for (const [term, preferredTranslation] of context.globalTerminology.entries()) {
      // 查找翻译中的术语变体
      const variations = this.findTermVariations(term, adjustedTranslation);
      
      variations.forEach(variation => {
        if (variation !== preferredTranslation) {
          adjustedTranslation = adjustedTranslation.replace(variation, preferredTranslation);
          
          adjustments.push({
            type: 'terminology',
            original: variation,
            adjusted: preferredTranslation,
            reason: `术语一致性调整，统一使用：${preferredTranslation}`
          });
        }
      });
    }

    return adjustedTranslation;
  }

  /**
   * 查找术语变体
   */
  private findTermVariations(term: string, text: string): string[] {
    const variations: string[] = [];
    const lowerTerm = term.toLowerCase();
    
    // 简单的变体检测（可以扩展为更复杂的算法）
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.includes(lowerTerm) || lowerTerm.includes(cleanWord)) {
        if (cleanWord.length > 2) {
          variations.push(word);
        }
      }
    });

    return variations;
  }

  /**
   * 调整语调
   */
  private async adjustTone(
    context: DocumentContext,
    translation: string,
    source: string,
    target: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    const requiredTone = context.documentTone;
    let adjustedTranslation = translation;

    // 根据目标语调调整翻译
    if (target === 'zh') {
      adjustedTranslation = await this.adjustChineseTone(
        translation, requiredTone, adjustments
      );
    } else if (target === 'en') {
      adjustedTranslation = await this.adjustEnglishTone(
        translation, requiredTone, adjustments
      );
    }

    return adjustedTranslation;
  }

  /**
   * 调整中文语调
   */
  private async adjustChineseTone(
    translation: string,
    requiredTone: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjusted = translation;

    switch (requiredTone) {
      case 'formal':
        // 正式语调调整
        adjusted = adjusted
          .replace(/\b你\b/g, '您')
          .replace(/\b挺\b/g, '相当')
          .replace(/\b很棒\b/g, '优秀');
        break;
        
      case 'technical':
        // 技术语调调整
        adjusted = adjusted
          .replace(/\b做\b/g, '执行')
          .replace(/\b用\b/g, '使用')
          .replace(/\b好的\b/g, '有效的');
        break;
        
      case 'academic':
        // 学术语调调整
        adjusted = adjusted
          .replace(/\b我们认为\b/g, '本研究认为')
          .replace(/\b发现\b/g, '研究发现')
          .replace(/\b结果\b/g, '研究结果');
        break;
    }

    if (adjusted !== translation) {
      adjustments.push({
        type: 'tone',
        original: translation,
        adjusted,
        reason: `语调调整为${requiredTone}风格`
      });
    }

    return adjusted;
  }

  /**
   * 调整英文语调
   */
  private async adjustEnglishTone(
    translation: string,
    requiredTone: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjusted = translation;

    switch (requiredTone) {
      case 'formal':
        // 正式语调调整
        adjusted = adjusted
          .replace(/\bcan't\b/g, 'cannot')
          .replace(/\bwon't\b/g, 'will not')
          .replace(/\bget\b/g, 'obtain');
        break;
        
      case 'technical':
        // 技术语调调整
        adjusted = adjusted
          .replace(/\bmake\b/g, 'create')
          .replace(/\buse\b/g, 'utilize')
          .replace(/\bshow\b/g, 'demonstrate');
        break;
        
      case 'academic':
        // 学术语调调整
        adjusted = adjusted
          .replace(/\bI think\b/g, 'This research suggests')
          .replace(/\bfind\b/g, 'observe')
          .replace(/\bresults\b/g, 'findings');
        break;
    }

    if (adjusted !== translation) {
      adjustments.push({
        type: 'tone',
        original: translation,
        adjusted,
        reason: `Tone adjusted to ${requiredTone} style`
      });
    }

    return adjusted;
  }

  /**
   * 调整时态
   */
  private async adjustTense(
    sentence: ContextualSentence,
    context: DocumentContext,
    translation: string,
    source: string,
    target: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    // 查找时态指示词
    const temporalRelations = sentence.semanticRelations.filter(r => r.type === 'temporal');
    
    if (temporalRelations.length === 0) return translation;

    // 基于时态关系调整翻译
    // 这里简化处理，实际实现需要更复杂的语法分析
    let adjustedTranslation = translation;

    // TODO: 实现更完整的时态一致性逻辑

    return adjustedTranslation;
  }

  /**
   * 文化适应性调整
   */
  private async applyCulturalAdjustments(
    translation: string,
    source: string,
    target: string,
    domain: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjustedTranslation = translation;

    // 中英文化差异调整
    if (source === 'en' && target === 'zh') {
      adjustedTranslation = await this.applyChineseCulturalAdjustments(
        translation, domain, adjustments
      );
    } else if (source === 'zh' && target === 'en') {
      adjustedTranslation = await this.applyEnglishCulturalAdjustments(
        translation, domain, adjustments
      );
    }

    return adjustedTranslation;
  }

  /**
   * 中文文化调整
   */
  private async applyChineseCulturalAdjustments(
    translation: string,
    domain: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjusted = translation;

    // 商务文化调整
    if (domain === 'business') {
      adjusted = adjusted
        .replace(/\bdear\s+([^,]+),/gi, '尊敬的$1：')
        .replace(/\bbest regards\b/gi, '此致敬礼')
        .replace(/\bsincerely\b/gi, '诚挚地');
    }

    // 学术文化调整
    if (domain === 'academic') {
      adjusted = adjusted
        .replace(/\bwe believe\b/gi, '我们认为')
        .replace(/\bin conclusion\b/gi, '综上所述')
        .replace(/\bfurthermore\b/gi, '此外');
    }

    if (adjusted !== translation) {
      adjustments.push({
        type: 'cultural',
        original: translation,
        adjusted,
        reason: `中文文化适应性调整（${domain}领域）`
      });
    }

    return adjusted;
  }

  /**
   * 英文文化调整
   */
  private async applyEnglishCulturalAdjustments(
    translation: string,
    domain: string,
    adjustments: ContextualAdjustment[]
  ): Promise<string> {
    let adjusted = translation;

    // 商务文化调整
    if (domain === 'business') {
      adjusted = adjusted
        .replace(/\b尊敬的([^：]+)：/g, 'Dear $1,')
        .replace(/\b此致敬礼\b/g, 'Best regards')
        .replace(/\b诚挚地\b/g, 'Sincerely');
    }

    // 学术文化调整
    if (domain === 'academic') {
      adjusted = adjusted
        .replace(/\b我们认为\b/g, 'We believe that')
        .replace(/\b综上所述\b/g, 'In conclusion')
        .replace(/\b此外\b/g, 'Furthermore');
    }

    if (adjusted !== translation) {
      adjustments.push({
        type: 'cultural',
        original: translation,
        adjusted,
        reason: `English cultural adaptation (${domain} domain)`
      });
    }

    return adjusted;
  }

  /**
   * 计算上下文置信度
   */
  private calculateContextualConfidence(
    sentence: ContextualSentence,
    context: DocumentContext,
    adjustments: ContextualAdjustment[]
  ): number {
    let confidence = 0.5; // 基础置信度

    // 依赖关系加分
    confidence += sentence.dependencies.length * 0.1;

    // 语义关系加分
    confidence += sentence.semanticRelations.length * 0.1;

    // 调整次数影响
    confidence += Math.min(adjustments.length * 0.05, 0.2);

    // 全局术语库影响
    confidence += context.globalTerminology.size > 0 ? 0.1 : 0;

    return Math.min(1.0, confidence);
  }

  /**
   * 检测文档领域
   */
  private async detectDomain(sentences: string[]): Promise<string> {
    const allText = sentences.join(' ').toLowerCase();
    
    const domainKeywords = {
      'tech': ['api', 'software', 'programming', 'algorithm', 'database', 'computer'],
      'business': ['revenue', 'profit', 'market', 'strategy', 'management', 'customer'],
      'academic': ['research', 'study', 'analysis', 'theory', 'methodology', 'hypothesis'],
      'medical': ['patient', 'treatment', 'diagnosis', 'medicine', 'therapy', 'clinical'],
      'legal': ['contract', 'law', 'legal', 'court', 'regulation', 'compliance']
    };

    let maxScore = 0;
    let detectedDomain = 'general';

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (allText.includes(keyword)) {
          score++;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }

    return detectedDomain;
  }

  /**
   * 获取文档上下文
   */
  getDocumentContext(documentId: string): DocumentContext | undefined {
    return this.documentContexts.get(documentId);
  }

  /**
   * 清理过期上下文
   */
  cleanupExpiredContexts(maxAge: number = 24 * 60 * 60 * 1000): number {
    const cutoffTime = Date.now() - maxAge;
    let cleanedCount = 0;

    for (const [id, context] of this.documentContexts.entries()) {
      if (context.createdAt < cutoffTime) {
        this.documentContexts.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      activeContexts: this.documentContexts.size,
      patterns: this.contextPatterns.size,
      initialized: this.initialized
    };
  }
}

// 辅助类：术语提取器
class TerminologyExtractor {
  private commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    '的', '是', '在', '有', '和', '或', '但', '与', '为', '由', '从', '到'
  ]);

  async initialize(): Promise<void> {
    // 初始化术语提取器
  }

  async extractGlobalTerminology(sentences: string[]): Promise<Map<string, string>> {
    const terminology = new Map<string, string>();
    const allText = sentences.join(' ');
    
    // 简化的术语提取逻辑
    const words = allText.split(/\s+/);
    const termFrequency = new Map<string, number>();

    // 统计词频
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !this.commonWords.has(cleanWord)) {
        termFrequency.set(cleanWord, (termFrequency.get(cleanWord) || 0) + 1);
      }
    });

    // 选择高频术语
    for (const [term, frequency] of termFrequency.entries()) {
      if (frequency >= 3) { // 至少出现3次
        terminology.set(term, term); // 简化处理，实际应该有翻译映射
      }
    }

    return terminology;
  }
}

// 辅助类：语义分析器
class SemanticAnalyzer {
  async initialize(): Promise<void> {
    // 初始化语义分析器
  }

  async analyzeRelations(
    sentence: string,
    allSentences: string[],
    currentIndex: number
  ): Promise<SemanticRelation[]> {
    const relations: SemanticRelation[] = [];

    // 简化的语义关系检测
    if (currentIndex > 0) {
      const prevSentence = allSentences[currentIndex - 1];
      
      // 检测因果关系
      if (/because|since|therefore|thus/.test(sentence.toLowerCase())) {
        relations.push({
          type: 'causation',
          targetSentenceId: `sentence_${currentIndex - 1}`,
          confidence: 0.8
        });
      }

      // 检测对比关系
      if (/however|but|nevertheless/.test(sentence.toLowerCase())) {
        relations.push({
          type: 'contrast',
          targetSentenceId: `sentence_${currentIndex - 1}`,
          confidence: 0.7
        });
      }

      // 检测延续关系
      if (/also|additionally|furthermore|moreover/.test(sentence.toLowerCase())) {
        relations.push({
          type: 'continuation',
          targetSentenceId: `sentence_${currentIndex - 1}`,
          confidence: 0.6
        });
      }
    }

    return relations;
  }
}

// 辅助类：语调分析器
class TonalAnalyzer {
  async initialize(): Promise<void> {
    // 初始化语调分析器
  }

  async analyzeTone(text: string): Promise<'formal' | 'informal' | 'technical' | 'academic' | 'creative'> {
    const lowerText = text.toLowerCase();

    // 技术特征
    if (/\b(algorithm|api|database|software|programming|code|system|technology)\b/.test(lowerText)) {
      return 'technical';
    }

    // 学术特征
    if (/\b(research|study|methodology|hypothesis|analysis|findings|conclusion|literature)\b/.test(lowerText)) {
      return 'academic';
    }

    // 正式特征
    if (/\b(hereby|whereas|furthermore|nevertheless|consequently|respectively)\b/.test(lowerText)) {
      return 'formal';
    }

    // 创意特征
    if (/\b(imagine|creative|innovative|inspiring|amazing|wonderful|fantastic)\b/.test(lowerText)) {
      return 'creative';
    }

    // 默认为非正式
    return 'informal';
  }
}

// 导出单例
export const contextualTranslationEngine = new ContextualTranslationEngine();
export default ContextualTranslationEngine;
