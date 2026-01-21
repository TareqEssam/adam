/****************************************************************************
 * 🧠 Vector Engine V4 - المحرك الدلالي الذكي المتطور
 * ════════════════════════════════════════════════════════════════════════════
 * ✅ Multi-Vector Search: بحث في 5 متجهات لكل سجل
 * ✅ Dynamic Threshold: عتبة ثقة ديناميكية ذكية
 * ✅ Arabic-Egyptian NLP: معالجة متقدمة للهجة المصرية
 * ✅ Context-Aware Ranking: ترتيب ذكي حسب السياق
 * ✅ Metadata Enhancement: تحسين باستخدام البيانات الوصفية
 ****************************************************************************/

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

class AdvancedVectorEngine {
    constructor() {
        // النموذج الدلالي المتقدم للعربية المصرية
        this.extractor = null;
        
        // قواعد المتجهات الجديدة
        this.vectorDB = {
            activities: { vectors: [], metadata: [] },
            decision104: { vectors: [], metadata: [] },
            industrial: { vectors: [], metadata: [] }
        };
        
        // إعدادات البحث المتقدم
        this.searchConfig = {
            vectorWeights: {
                'full': 1.0,          // العنوان الأساسي
                'contextual': 0.9,    // النص مع السياق
                'key_phrases': 0.8,   // العبارات الرئيسية
                'summary': 0.7,       // الملخص
                'no_stopwords': 0.6   // بدون كلمات حشو
            },
            minConfidence: 0.2,
            maxResults: 15
        };
        
        // نظام التعلم المتطور
        this.learning = {
            queryHistory: new Map(),
            entityPatterns: new Map(),
            successfulMatches: new Map(),
            confidenceStats: [],
            ambiguousResolutions: new Map() // حلول الأسئلة الغامضة
        };
        
        // معالج النصوص العربية المتقدم
        this.textProcessor = new ArabicEgyptianTextProcessor();
        
        this.isReady = false;
        
        
        // نستخدم .. للخروج من مجلد js ثم الدخول لمجلد data
        this.vectorURLs = {
            activities: '../data/activity_vectors.js',
            decision104: '../data/decision104_vectors.js',
            industrial: '../data/industrial_vectors.js'
        };
        
        this.init();
    }
    
    async init() {
        console.log("🚀 Vector Engine V4 - التهيئة المتقدمة...");
        try {
            // تحميل النموذج المتقدم للعربية المصرية
            this.extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
            console.log("✅ النموذج الدلالي المتقدم جاهز (مخصص للعربية المصرية)");
            
            // تحميل قواعد المتجهات الجديدة
            await this.loadVectorDatabases();
            
            // استعادة بيانات التعلم
            await this.restoreLearning();
            
            this.isReady = true;
            console.log("✅ المحرك المتقدم جاهز للعمل");
            console.log(`📊 إحصائيات: ${this.vectorDB.activities.vectors.length} نشاط، ${this.vectorDB.decision104.vectors.length} قرار، ${this.vectorDB.industrial.vectors.length} منطقة`);
            
            window.dispatchEvent(new CustomEvent('vectorEngineReady'));
        } catch (error) {
            console.error("❌ فشل التهيئة المتقدمة:", error);
        }
    }
    
    async loadVectorDatabases() {
        console.log("📂 تحميل قواعد المتجهات الجديدة...");
        
        for (const [key, url] of Object.entries(this.vectorURLs)) {
            try {
                console.log(`⏳ تحميل ${key}...`);
                
                // استخدام ديناميكي للوظيفة import() لتحميل ملفات JS
                const module = await import(url + '?t=' + Date.now());
                const data = module.default || module[key + 'VectorsData'];
                
                if (!data || !data.data) {
                    console.warn(`⚠️ بيانات ${key} غير متوفرة بالهيكل المتوقع`);
                    continue;
                }
                
                // معالجة بيانات المتجهات المتعددة
                this.processMultiVectorData(key, data.data);
                console.log(`✅ ${key}: ${data.data.length} سجل (5 متجهات لكل سجل)`);
                
            } catch (error) {
                console.error(`❌ خطأ في تحميل ${key}:`, error);
                // تحميل نسخة احتياطية محلية إذا فشل التحميل الخارجي
                await this.loadFallbackData(key);
            }
        }
    }
    
    processMultiVectorData(dbKey, vectorData) {
        if (!vectorData || !Array.isArray(vectorData)) {
            console.warn(`⚠️ بيانات ${dbKey} غير صالحة`);
            return;
        }
        
        this.vectorDB[dbKey].vectors = [];
        this.vectorDB[dbKey].metadata = [];
        
        vectorData.forEach(item => {
            if (!item.embeddings || !item.embeddings.multilingual_minilm) {
                return;
            }
            
            const embeddings = item.embeddings.multilingual_minilm.embeddings;
            
            // تخزين جميع المتجهات لكل سجل
            this.vectorDB[dbKey].vectors.push({
                id: item.id,
                embeddings: embeddings,
                dimension: 384 // تأكيد من البيانات
            });
            
            // تخزين البيانات الوصفية للتحسين
            this.vectorDB[dbKey].metadata.push({
                id: item.id,
                original_data: item.original_data,
                metadata: item.metadata || {},
                text_preview: item.original_data?.text_preview || ''
            });
        });
    }
    
    async loadFallbackData(dbKey) {
        console.log(`🔄 تحميل بيانات احتياطية لـ ${dbKey}...`);
        // هنا يمكن إضافة بيانات احتياطية محلية
    }
    
    /**
     * 🎯 البحث الذكي المتطور
     */
    async intelligentSearch(query, options = {}) {
        const {
            limit = this.searchConfig.maxResults,
            contextType = 'general',
            requireConfirmation = false
        } = options;
        
        if (!this.isReady) {
            console.warn("⚠️ المحرك غير جاهز");
            return { activities: [], decision104: [], industrial: [], ambiguous: false };
        }
        
        console.log(`🔍 بحث متطور: "${query}"`);
        
        // 1. تحليل الاستعلام المتقدم
        const analysis = this.analyzeQuery(query, contextType);
        
        // 2. استخراج كيانات متقدم مع اللهجة المصرية
        const entities = await this.advancedEntityExtraction(query, analysis);
        
        // 3. إنشاء متجه استعلام رئيسي
        const mainQueryVector = await this.getVector(query);
        
        // 4. البحث في جميع قواعد البيانات
        const allResults = {
            activities: await this.searchInDatabase('activities', mainQueryVector, entities, analysis),
            decision104: await this.searchInDatabase('decision104', mainQueryVector, entities, analysis),
            industrial: await this.searchInDatabase('industrial', mainQueryVector, entities, analysis)
        };
        
        // 5. تطبيق العتبة الديناميكية الذكية
        const dynamicThreshold = this.calculateDynamicThreshold(analysis.complexity, allResults);
        
        // 6. ترشيح النتائج بناءً على العتبة
        const filteredResults = this.filterResultsByThreshold(allResults, dynamicThreshold);
        
        // 7. تعزيز النتائج بالبيانات الوصفية
        const enhancedResults = this.enhanceWithMetadata(filteredResults, analysis);
        
        // 8. التعلم من هذا البحث
        this.learnFromSearch(query, enhancedResults, analysis);
        
        // 9. تحديد إذا كان الاستعلام غامضاً ويحتاج تأكيد
        const isAmbiguous = this.checkForAmbiguity(enhancedResults, analysis);
        
        return {
            ...enhancedResults,
            ambiguous: isAmbiguous,
            analysis: analysis,
            confidenceThreshold: dynamicThreshold
        };
    }
    
    /**
     * 🔍 تحليل الاستعلام المتقدم
     */
    analyzeQuery(query, contextType) {
        const text = query.toLowerCase();
        
        return {
            original: query,
            length: query.length,
            wordCount: query.split(/\s+/).length,
            
            // تحليل التعقيد
            complexity: this.assessComplexity(text),
            
            // تحديد النوع
            type: this.determineQueryType(text),
            
            // استخراج الكلمات المفتاحية
            keywords: this.extractKeywords(text),
            
            // تحليل النية
            intent: this.detectIntent(text),
            
            // تحليل اللهجة المصرية
            containsEgyptianDialect: this.detectEgyptianDialect(text),
            
            // السياق
            context: contextType
        };
    }
    
    /**
     * 🎭 استخراج كيانات متقدم مع اللهجة المصرية
     */
    async advancedEntityExtraction(query, analysis) {
        const entities = [];
        const text = query.toLowerCase();
        
        // 1. الأرقام المهمة (قرارات، أرقام)
        const numbers = query.match(/\d+/g);
        if (numbers) {
            numbers.forEach(num => {
                if (num === '104') {
                    entities.push({ type: 'decision', value: num, text: 'قرار 104', weight: 2.0 });
                } else if (num === '72') {
                    entities.push({ type: 'law', value: num, text: 'قانون 72', weight: 1.5 });
                }
            });
        }
        
        // 2. المحافظات المصرية
        const governorates = this.textProcessor.EGYPTIAN_GOVERNORATES;
        governorates.forEach(gov => {
            if (text.includes(gov.toLowerCase())) {
                entities.push({ 
                    type: 'governorate', 
                    value: gov, 
                    text: gov, 
                    weight: 1.5,
                    isEgyptian: true 
                });
            }
        });
        
        // 3. المناطق الصناعية (بالعامية المصرية أيضاً)
        const areaPatterns = this.textProcessor.INDUSTRIAL_AREA_PATTERNS;
        areaPatterns.forEach(({ name, aliases, egyptianNames }) => {
            const allNames = [name, ...aliases, ...egyptianNames];
            if (allNames.some(n => text.includes(n.toLowerCase()))) {
                entities.push({ 
                    type: 'area', 
                    value: name, 
                    text: name, 
                    weight: 1.8,
                    isEgyptian: true 
                });
            }
        });
        
        // 4. الأنشطة (بالفصحى والعامية)
        const activityPatterns = this.textProcessor.ACTIVITY_PATTERNS;
        activityPatterns.forEach(({ formal, egyptian, category, weight }) => {
            const allTerms = [formal, ...egyptian];
            if (allTerms.some(term => text.includes(term.toLowerCase()))) {
                entities.push({ 
                    type: 'activity', 
                    value: formal, 
                    text: formal, 
                    weight: weight,
                    category: category,
                    isEgyptian: egyptian.some(e => text.includes(e.toLowerCase()))
                });
            }
        });
        
        // 5. الكيانات المتخصصة من التعلم
        this.learning.entityPatterns.forEach((pattern, key) => {
            if (text.includes(key.toLowerCase()) && !entities.find(e => e.value === pattern.value)) {
                entities.push({ ...pattern, learned: true });
            }
        });
        
        return entities;
    }
    
    /**
     * 🔎 البحث في قاعدة محددة مع جميع المتجهات
     */
    async searchInDatabase(dbKey, queryVector, entities, analysis) {
        const database = this.vectorDB[dbKey];
        if (!database.vectors || database.vectors.length === 0) {
            return [];
        }
        
        let allScores = [];
        
        // البحث في كل سجل مع جميع متجهاته
        database.vectors.forEach(item => {
            let maxScore = 0;
            let bestVectorType = '';
            
            // تجربة جميع أنواع المتجهات لكل سجل
            Object.entries(item.embeddings).forEach(([vectorType, vector]) => {
                if (!vector || !Array.isArray(vector)) return;
                
                // حساب التشابه
                const similarity = this.cosineSimilarity(queryVector, vector);
                
                // تطبيق وزن هذا النوع من المتجهات
                const weightedScore = similarity * (this.searchConfig.vectorWeights[vectorType] || 0.5);
                
                // تحديث أعلى درجة
                if (weightedScore > maxScore) {
                    maxScore = weightedScore;
                    bestVectorType = vectorType;
                }
            });
            
            if (maxScore > 0) {
                allScores.push({
                    id: item.id,
                    score: maxScore,
                    vectorType: bestVectorType,
                    db: dbKey
                });
            }
        });
        
        // تعزيز الدرجات بالمطابقة مع الكيانات
        if (entities.length > 0) {
            allScores = this.boostWithEntities(allScores, entities, dbKey);
        }
        
        // تعزيز بالبيانات الوصفية
        allScores = this.boostWithMetadata(allScores, database.metadata, analysis);
        
        // الترتيب التنازلي
        allScores.sort((a, b) => b.score - a.score);
        
        // إرجاع النتائج مع معلومات إضافية
        return allScores.slice(0, this.searchConfig.maxResults).map(score => ({
            ...score,
            metadata: database.metadata.find(m => m.id === score.id),
            requiresConfirmation: score.score > 0.4 && score.score < 0.7 // يحتاج تأكيد في المنطقة المتوسطة
        }));
    }
    
    /**
     * ⚡ تعزيز الدرجات بالمطابقة مع الكيانات
     */
    boostWithEntities(scores, entities, dbKey) {
        return scores.map(score => {
            const metadata = this.vectorDB[dbKey].metadata.find(m => m.id === score.id);
            if (!metadata) return score;
            
            let boost = 0;
            
            entities.forEach(entity => {
                // التحقق من مطابقة النص
                const textToCheck = metadata.text_preview + ' ' + 
                                  JSON.stringify(metadata.original_data) + ' ' +
                                  JSON.stringify(metadata.metadata);
                
                if (textToCheck.toLowerCase().includes(entity.text.toLowerCase())) {
                    boost += entity.weight * 0.3;
                }
            });
            
            return {
                ...score,
                score: Math.min(1.0, score.score + boost),
                entityBoost: boost
            };
        });
    }
    
    /**
     * 📊 تعزيز بالبيانات الوصفية
     */
    boostWithMetadata(scores, metadataList, analysis) {
        return scores.map(score => {
            const metadata = metadataList.find(m => m.id === score.id);
            if (!metadata) return score;
            
            let boost = 0;
            
            // تعزيز بناءً على نوع الاستعلام
            if (analysis.type === 'decision104' && metadata.metadata?.sector) {
                boost += 0.15;
            }
            
            // تعزيز بناءً على المحافظة إذا ذكرت
            if (analysis.keywords.governorate && 
                metadata.metadata?.governorate?.includes(analysis.keywords.governorate)) {
                boost += 0.2;
            }
            
            // تعزيز بناءً على التعلم السابق
            const learning = this.learning.successfulMatches.get(score.id);
            if (learning) {
                boost += Math.min(0.1, learning.count * 0.02);
            }
            
            return {
                ...score,
                score: Math.min(1.0, score.score + boost),
                metadataBoost: boost
            };
        });
    }
    
    /**
     * 🎯 حساب العتبة الديناميكية الذكية
     */
    calculateDynamicThreshold(complexity, results) {
        // العتبة الأساسية حسب التعقيد
        const baseThresholds = {
            'simple': 0.4,
            'medium': 0.35,
            'complex': 0.3,
            'ambiguous': 0.25
        };
        
        let threshold = baseThresholds[complexity] || 0.35;
        
        // تعديل بناءً على جودة النتائج
        const allScores = [
            ...results.activities.map(r => r.score),
            ...results.decision104.map(r => r.score),
            ...results.industrial.map(r => r.score)
        ].filter(score => score > 0);
        
        if (allScores.length > 0) {
            const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
            // إذا كانت النتائج جيدة، نخفض العتبة قليلاً للسماح بنتائج أكثر
            if (avgScore > 0.6) {
                threshold *= 0.9;
            }
            // إذا كانت النتائج ضعيفة، نرفع العتبة
            else if (avgScore < 0.3) {
                threshold *= 1.1;
            }
        }
        
        // عدم النزول عن حد أدنى
        return Math.max(this.searchConfig.minConfidence, Math.min(0.8, threshold));
    }
    
    /**
     * 🎭 تقييم تعقيد الاستعلام
     */
    assessComplexity(text) {
        const words = text.split(/\s+/).length;
        
        if (words <= 3) return 'simple';
        if (words <= 6) return 'medium';
        if (text.includes('و') || text.includes('أيضاً') || text.includes('بالإضافة')) {
            return 'complex';
        }
        if (this.hasAmbiguousTerms(text)) return 'ambiguous';
        return 'medium';
    }
    
    /**
     * 🔤 تحديد نوع الاستعلام
     */
    determineQueryType(text) {
        if (/قرار\s*104|104|حافز|حوافز/.test(text)) return 'decision104';
        if (/منطقة|صناعية|مدينة|المدينة|العاشر|السادات/.test(text)) return 'industrial';
        if (/فندق|مصنع|مخبز|ورشة|مطعم|صيدلية/.test(text)) return 'activity';
        if (/كام|كم|عدد|أين|متى/.test(text)) return 'general';
        return 'unknown';
    }
    
    /**
     * 🎯 اكتشاف النية
     */
    detectIntent(text) {
        if (/ترخيص|رخصة|إجازة/.test(text)) return 'licensing';
        if (/مساحة|كيلو|فدان/.test(text)) return 'area';
        if (/موقع|أين|عنوان/.test(text)) return 'location';
        if (/معلومات|تفاصيل|شرح/.test(text)) return 'information';
        if (/هل|؟|\?/.test(text)) return 'question';
        return 'general';
    }
    
    /**
     * 🇪🇬 اكتشاف اللهجة المصرية
     */
    detectEgyptianDialect(text) {
        const egyptianTerms = [
            'كام', 'بكام', 'عايز', 'عاوز', 'عيز', 'قول', 'قولي',
            'مش', 'مش عارف', 'مش فاكر', 'ايوه', 'لأ', 
            'يعني ايه', 'ايه هو', 'في ايه'
        ];
        
        return egyptianTerms.some(term => text.includes(term));
    }
    
    /**
     * 🔑 استخراج الكلمات المفتاحية
     */
    extractKeywords(text) {
        const keywords = {
            governorate: null,
            activity: null,
            number: null,
            type: null
        };
        
        // المحافظات
        this.textProcessor.EGYPTIAN_GOVERNORATES.forEach(gov => {
            if (text.includes(gov.toLowerCase())) {
                keywords.governorate = gov;
            }
        });
        
        // الأنشطة
        this.textProcessor.ACTIVITY_PATTERNS.forEach(({ formal, egyptian }) => {
            const allTerms = [formal, ...egyptian];
            if (allTerms.some(term => text.includes(term.toLowerCase()))) {
                keywords.activity = formal;
            }
        });
        
        // الأرقام
        const numbers = text.match(/\d+/g);
        if (numbers) keywords.number = numbers[0];
        
        return keywords;
    }
    
    /**
     * ❓ التحقق من وجود مصطلحات غامضة
     */
    hasAmbiguousTerms(text) {
        const ambiguousTerms = [
            'هو', 'هي', 'ذلك', 'هذا', 'هذه',
            'المكان', 'النشاط', 'المنطقة', 'الشيء'
        ];
        
        return ambiguousTerms.some(term => text.includes(term));
    }
    
    /**
     * ❓ تحديد إذا كان الاستعلام غامضاً
     */
    checkForAmbiguity(results, analysis) {
        // إذا كان هناك أكثر من نتيجة متقاربة في الدرجة
        const topActivities = results.activities.slice(0, 3);
        const topIndustrial = results.industrial.slice(0, 3);
        
        if (topActivities.length >= 2) {
            const scoreDiff = topActivities[0].score - topActivities[1].score;
            if (scoreDiff < 0.1) return true;
        }
        
        if (topIndustrial.length >= 2) {
            const scoreDiff = topIndustrial[0].score - topIndustrial[1].score;
            if (scoreDiff < 0.1) return true;
        }
        
        // إذا كان الاستعلام عاماً جداً
        if (analysis.complexity === 'ambiguous') return true;
        
        // إذا كان الاستعلام يحتوي على مصطلحات غامضة
        if (this.hasAmbiguousTerms(analysis.original.toLowerCase())) return true;
        
        return false;
    }
    
    /**
     * 🎯 ترشيح النتائج بناءً على العتبة
     */
    filterResultsByThreshold(results, threshold) {
        const filtered = {};
        
        Object.keys(results).forEach(key => {
            filtered[key] = results[key]
                .filter(item => item.score >= threshold)
                .sort((a, b) => b.score - a.score);
        });
        
        return filtered;
    }
    
    /**
     * 📊 تعزيز النتائج بالبيانات الوصفية
     */
    enhanceWithMetadata(results, analysis) {
        Object.keys(results).forEach(key => {
            results[key] = results[key].map(item => {
                const metadata = this.vectorDB[key].metadata.find(m => m.id === item.id);
                return {
                    ...item,
                    metadata: metadata || {},
                    confidence: this.calculateConfidenceLevel(item.score, analysis),
                    suggestions: this.generateSuggestions(item, analysis)
                };
            });
        });
        
        return results;
    }
    
    /**
     * 📈 حساب مستوى الثقة
     */
    calculateConfidenceLevel(score, analysis) {
        if (score >= 0.8) return 'high';
        if (score >= 0.6) return 'medium';
        if (score >= 0.4) return 'low';
        return 'very_low';
    }
    
    /**
     * 💡 توليد اقتراحات
     */
    generateSuggestions(item, analysis) {
        const suggestions = [];
        
        if (item.score >= 0.7 && item.score < 0.85) {
            suggestions.push('نتيجة قوية جداً');
        }
        
        if (item.metadataBoost > 0.1) {
            suggestions.push('مطابقة قوية مع البيانات الوصفية');
        }
        
        if (item.entityBoost > 0.1) {
            suggestions.push('مطابقة مع كيانات محددة');
        }
        
        return suggestions;
    }
    
    /**
     * 📚 التعلم من البحث
     */
    learnFromSearch(query, results, analysis) {
        // حفظ الاستعلام
        const queryKey = query.toLowerCase().trim();
        const existing = this.learning.queryHistory.get(queryKey);
        
        if (existing) {
            existing.count++;
            existing.lastUsed = Date.now();
        } else {
            this.learning.queryHistory.set(queryKey, {
                count: 1,
                firstUsed: Date.now(),
                lastUsed: Date.now(),
                analysis: analysis
            });
        }
        
        // حفظ المطابقات الناجحة
        Object.values(results).forEach(resultList => {
            resultList.slice(0, 2).forEach(result => {
                if (result.score > 0.6) {
                    const existing = this.learning.successfulMatches.get(result.id);
                    if (existing) {
                        existing.count++;
                        existing.queries.push(query);
                    } else {
                        this.learning.successfulMatches.set(result.id, {
                            count: 1,
                            queries: [query],
                            firstMatch: Date.now()
                        });
                    }
                }
            });
        });
        
        // حفظ إحصائيات الثقة
        this.learning.confidenceStats.push({
            query: query,
            analysis: analysis,
            topScores: {
                activities: results.activities[0]?.score || 0,
                decision104: results.decision104[0]?.score || 0,
                industrial: results.industrial[0]?.score || 0
            },
            timestamp: Date.now()
        });
        
        // الاحتفاظ بآخر 100 فقط
        if (this.learning.confidenceStats.length > 100) {
            this.learning.confidenceStats.shift();
        }
        
        // حفظ في localStorage
        this.saveLearning();
    }
    
    /**
     * 🔧 دوال مساعدة
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dot / denom;
    }
    
    async getVector(text) {
        const output = await this.extractor(text, { 
            pooling: 'mean', 
            normalize: true 
        });
        return Array.from(output.data);
    }
    
    async saveLearning() {
        try {
            const data = {
                queryHistory: Array.from(this.learning.queryHistory.entries()),
                successfulMatches: Array.from(this.learning.successfulMatches.entries()),
                confidenceStats: this.learning.confidenceStats.slice(-100),
                timestamp: Date.now()
            };
            
            localStorage.setItem('vector_engine_learning_v4', JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ فشل حفظ التعلم:', e);
        }
    }
    
    async restoreLearning() {
        try {
            const saved = localStorage.getItem('vector_engine_learning_v4');
            if (saved) {
                const data = JSON.parse(saved);
                
                this.learning.queryHistory = new Map(data.queryHistory || []);
                this.learning.successfulMatches = new Map(data.successfulMatches || []);
                this.learning.confidenceStats = data.confidenceStats || [];
                
                console.log(`📚 تم استرجاع المعرفة (${this.learning.queryHistory.size} استعلام)`);
            }
        } catch (e) {
            console.warn('⚠️ فشل استرجاع التعلم:', e);
        }
    }
    
    // للتوافق مع الكود القديم
    async search(query, limit = 10) {
        return this.intelligentSearch(query, { limit });
    }
}

/**
 * 🇪🇬 معالج النصوص العربية المصرية المتقدم
 */
class ArabicEgyptianTextProcessor {
    constructor() {
        this.EGYPTIAN_GOVERNORATES = [
            'القاهرة', 'الإسكندرية', 'الجيزة', 'القليوبية', 'الشرقية',
            'الدقهلية', 'البحيرة', 'المنوفية', 'الغربية', 'كفر الشيخ',
            'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء',
            'جنوب سيناء', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
            'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح'
        ];
        
        this.INDUSTRIAL_AREA_PATTERNS = [
            { 
                name: 'العاشر من رمضان', 
                aliases: ['العاشر', '10 رمضان'],
                egyptianNames: ['عاشر رمضان', 'العاشر رمضان']
            },
            { 
                name: 'السادات', 
                aliases: ['مدينة السادات'],
                egyptianNames: ['السادات']
            },
            { 
                name: 'برج العرب', 
                aliases: ['برج'],
                egyptianNames: ['برج العرب', 'برج العرب الجديدة']
            },
            { 
                name: 'زهراء المعادي', 
                aliases: ['زهراء', 'الزهراء'],
                egyptianNames: ['الزهراء']
            },
            { 
                name: '6 أكتوبر', 
                aliases: ['أكتوبر', 'ستة أكتوبر'],
                egyptianNames: ['ستة اكتوبر', 'سادس اكتوبر']
            },
            { 
                name: 'بدر', 
                aliases: ['مدينة بدر'],
                egyptianNames: ['بدر']
            },
            { 
                name: 'العبور', 
                aliases: ['مدينة العبور'],
                egyptianNames: ['العبور']
            }
        ];
        
        this.ACTIVITY_PATTERNS = [
            { 
                formal: 'فندق', 
                egyptian: ['أوتيل', 'فندق سياحي', 'فندقة'],
                category: 'سياحة',
                weight: 1.5
            },
            { 
                formal: 'مصنع', 
                egyptian: ['معمل', 'مصنع'],
                category: 'صناعي',
                weight: 1.4
            },
            { 
                formal: 'مخبز', 
                egyptian: ['فرن', 'مخبز'],
                category: 'غذائي',
                weight: 1.3
            },
            { 
                formal: 'ورشة', 
                egyptian: ['ورشة', 'وراشة'],
                category: 'صناعي',
                weight: 1.2
            },
            { 
                formal: 'مطعم', 
                egyptian: ['مطعم', 'اكل'],
                category: 'غذائي',
                weight: 1.3
            },
            { 
                formal: 'صيدلية', 
                egyptian: ['صيدلية', 'دوا'],
                category: 'صحي',
                weight: 1.4
            }
        ];
        
        this.EGYPTIAN_STOP_WORDS = [
            'يعني', 'خلاص', 'طب', 'تمام', 'يا', 'يا ريت',
            'مش', 'ممكن', 'بس', 'على فكرة', 'أصل', 'بالظبط'
        ];
    }
    
    normalizeEgyptianText(text) {
        if (!text || !text.trim()) return '';
        
        let normalized = text.toLowerCase();
        
        // تحويل العامية إلى فصحى
        const dialectMap = {
            'كام': 'كم',
            'عايز': 'أريد',
            'عاوز': 'أريد',
            'عيز': 'أريد',
            'قول': 'قل',
            'قولي': 'قل لي',
            'ايوه': 'نعم',
            'لأ': 'لا',
            'مش': 'ليس',
            'يعني ايه': 'ما معنى',
            'ايه هو': 'ما هو'
        };
        
        Object.entries(dialectMap).forEach(([dialect, formal]) => {
            normalized = normalized.replace(new RegExp(dialect, 'g'), formal);
        });
        
        // إزالة كلمات التوقف المصرية
        this.EGYPTIAN_STOP_WORDS.forEach(word => {
            normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        
        return normalized.trim();
    }
}

// التصدير والتهيئة
window.vEngine = new AdvancedVectorEngine();

console.log('✅ Vector Engine V4 - النظام المتقدم جاهز!');
