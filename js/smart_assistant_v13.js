/****************************************************************************
 * 🧠 Smart Assistant V13 - المساعد الذكي المتطور
 * ════════════════════════════════════════════════════════════════════════════
 * ✅ ذاكرة محادثة عميقة (20 رسالة)
 * ✅ استفسار عند الغموض وتأكيد المستخدم
 * ✅ عرض بدائل متشابهة للاختيار
 * ✅ معالجة أسئلة مركبة ومتتابعة
 * ✅ تتبع سياق المحادثة بالكامل
 * ✅ دعم اللهجة المصرية والعامية
 ****************************************************************************/

class IntelligentSmartAssistant {
    constructor() {
        // الذاكرة المتقدمة
        this.memory = {
            conversation: [],
            context: {
                currentEntity: null,
                currentType: null,
                currentData: null,
                currentAlternatives: [],
                conversationStack: [],
                timestamp: null,
                lastQuery: null,
                lastResponse: null
            },
            preferences: {
                languageLevel: 'formal', // formal, colloquial, mixed
                detailLevel: 'detailed', // brief, detailed, expert
                confirmationMode: 'auto' // auto, always, never
            }
        };
        
        // القواعد النصية الجديدة
        this.db = {
            activities: null,
            industrial: null,
            decision104: null
        };
        
        // الإحصائيات المتقدمة
        this.stats = { 
            total: 0, 
            successful: 0,
            ambiguous: 0,
            confirmed: 0,
            corrected: 0
        };
        
        // إعدادات الاستفسار
        this.confirmationSettings = {
            enableForSimilarity: true,
            similarityThreshold: 0.1,
            maxAlternatives: 3,
            askForClarity: true
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Smart Assistant V13 - التهيئة المتقدمة...');
        
        // تحميل القواعد النصية الجديدة
        this.loadTextDatabases();
        
        // تهيئة ذاكرة المحادثة
        this.restoreConversation();
        
        // انتظار تهيئة محرك المتجهات
        if (window.vEngine) {
            window.vEngine.init();
        }
        
        console.log('✅ المساعد المتطور جاهز للعمل');
    }
    
    loadTextDatabases() {
        // الأنشطة - نفس الاسم
        if (typeof masterActivityDB !== 'undefined') {
            this.db.activities = masterActivityDB;
            console.log(`✅ الأنشطة: ${masterActivityDB.length} نشاط`);
        }
        
        // المناطق - اسم جديد
        if (typeof industrialDB !== 'undefined') {
            this.db.industrial = industrialDB;
            console.log(`✅ المناطق: ${industrialDB.length} منطقة`);
        }
        
        // القرار 104 - اسم جديد شامل
        if (typeof decision104DB !== 'undefined') {
            this.db.decision104 = decision104DB;
            console.log(`✅ القرار 104: قاعدة بيانات شاملة`);
        }
    }
    
    /**
     * 🎯 الوظيفة الرئيسية المتقدمة
     */
    async query(userInput) {
        this.stats.total++;
        const originalQuery = userInput.trim();
        
        console.log(`\n${'═'.repeat(70)}`);
        console.log(`💬 "${originalQuery}"`);
        console.log(`${'═'.repeat(70)}\n`);
        
        // 🔥 الخطوة 1: تحليل الاستعلام مع السياق
        const queryAnalysis = this.analyzeWithContext(originalQuery);
        
        // 🔥 الخطوة 2: التحقق من الحاجة للاستفسار
        if (this.needsClarification(queryAnalysis)) {
            return this.askForClarification(queryAnalysis);
        }
        
        // 🔥 الخطوة 3: البحث المتقدم
        let searchResults;
        if (window.vEngine && window.vEngine.isReady) {
            searchResults = await window.vEngine.intelligentSearch(originalQuery, {
                contextType: queryAnalysis.detectedType,
                requireConfirmation: queryAnalysis.isAmbiguous
            });
        } else {
            // البحث المحلي إذا لم يكن المحرك جاهزاً
            searchResults = await this.localSearch(originalQuery);
        }
        
        // 🔥 الخطوة 4: معالجة الغموض وعرض البدائل
        if (searchResults.ambiguous || this.hasSimilarAlternatives(searchResults)) {
            return this.handleAmbiguousResults(originalQuery, searchResults, queryAnalysis);
        }
        
        // 🔥 الخطوة 5: التصنيف الذكي والمعالجة
        const category = this.intelligentClassification(originalQuery, searchResults, queryAnalysis);
        
        // 🔥 الخطوة 6: المعالجة حسب التصنيف
        let response = await this.processByCategory(category, originalQuery, searchResults, queryAnalysis);
        
        // 🔥 الخطوة 7: تحديث الذاكرة والسياق
        this.updateAdvancedMemory(originalQuery, response, queryAnalysis, searchResults);
        
        return response;
    }
    
    /**
     * 🔍 تحليل الاستعلام مع مراعاة السياق
     */
    analyzeWithContext(query) {
        const text = query.toLowerCase();
        const lastContext = this.memory.context;
        
        return {
            original: query,
            text: text,
            words: text.split(/\s+/),
            wordCount: text.split(/\s+/).length,
            
            // السياق من المحادثة السابقة
            hasContext: lastContext.currentEntity !== null,
            contextEntity: lastContext.currentEntity,
            contextType: lastContext.currentType,
            lastQuery: lastContext.lastQuery,
            
            // تحليل النية
            intent: this.detectIntentWithContext(text, lastContext),
            
            // تحديد النوع
            detectedType: this.detectQueryType(text),
            
            // تحليل التعقيد
            complexity: this.assessQueryComplexity(text),
            
            // هل السؤال متابعة؟
            isFollowUp: this.isFollowUpQuestion(text, lastContext),
            
            // هل يحتوي على مصطلحات غامضة؟
            hasAmbiguousTerms: this.hasAmbiguousTerms(text),
            
            // تحليل اللغة
            language: this.analyzeLanguage(text),
            
            timestamp: Date.now()
        };
    }
    
    /**
     * 🎭 اكتشاف النية مع السياق
     */
    detectIntentWithContext(text, context) {
        // إذا كان سؤال متابعة
        if (context.currentEntity && this.isFollowUpQuestion(text, context)) {
            if (/مساحة|حجم|كبير|صغير/.test(text)) return 'area_size';
            if (/موقع|أين|عنوان/.test(text)) return 'location';
            if (/ترخيص|رخصة|إجازة/.test(text)) return 'licensing';
            if (/معلومات|تفاصيل|شرح/.test(text)) return 'more_details';
            if (/سعر|تكلفة|بكام/.test(text)) return 'cost';
            return 'follow_up';
        }
        
        // اكتشاف النية العامة
        if (/كام|كم|عدد/.test(text)) return 'count';
        if (/ما هو|ما هي|تعريف/.test(text)) return 'definition';
        if (/أين|مكان|موقع/.test(text)) return 'location';
        if (/كيف|طريقة|خطوات/.test(text)) return 'procedure';
        if (/هل|؟|\?/.test(text)) return 'yes_no';
        if (/أريد|أبحث عن|عايز/.test(text)) return 'search';
        
        return 'general';
    }
    
    /**
     * 🔤 تحديد نوع الاستعلام
     */
    detectQueryType(text) {
        // أولاً: التحقق من مصطلحات القرار 104
        if (/قرار\s*104|104 لسنة|حافز استثماري|القطاع\s*أ|القطاع\s*ب/.test(text)) {
            return 'decision104';
        }
        
        // ثانياً: المناطق الصناعية
        if (/منطقة|صناعية|مدينة|العاشر|السادات|برج العرب|زهراء|بدر|العبور/.test(text)) {
            return 'industrial';
        }
        
        // ثالثاً: الأنشطة
        if (/فندق|مصنع|مخبز|ورشة|مطعم|صيدلية|عيادة|مستشفى/.test(text)) {
            return 'activity';
        }
        
        // رابعاً: الأسئلة العامة
        if (/كام منطقة|كم منطقة|عدد المناطق/.test(text)) {
            return 'count';
        }
        
        if (/جهات الولاية|الجهة المختصة/.test(text)) {
            return 'dependencies';
        }
        
        return 'general';
    }
    
    /**
     * 📊 تقييم تعقيد الاستعلام
     */
    assessQueryComplexity(text) {
        const wordCount = text.split(/\s+/).length;
        const hasAnd = text.includes('و') || text.includes('وأيضاً') || text.includes('بالإضافة');
        const hasMultipleEntities = this.countEntities(text) > 1;
        
        if (wordCount <= 3) return 'simple';
        if (wordCount <= 6 && !hasAnd) return 'medium';
        if (hasMultipleEntities || hasAnd) return 'complex';
        if (this.hasAmbiguousTerms(text)) return 'ambiguous';
        
        return 'medium';
    }
    
    /**
     * 🔄 التحقق إذا كان سؤال متابعة
     */
    isFollowUpQuestion(text, context) {
        if (!context.currentEntity) return false;
        
        const followUpIndicators = [
            'ماذا عن', 'و', 'أيضاً', 'كمان',
            'بخصوص', 'حول', 'عن', 'فيما يخص',
            'المساحة', 'الموقع', 'التراخيص', 'التكلفة'
        ];
        
        return followUpIndicators.some(indicator => 
            text.includes(indicator) || 
            (text.length < 10 && !this.hasNewEntity(text))
        );
    }
    
    /**
     * ❓ التحقق من المصطلحات الغامضة
     */
    hasAmbiguousTerms(text) {
        const ambiguousTerms = [
            'هو', 'هي', 'ذلك', 'هذا', 'هذه', 'هؤلاء',
            'المكان', 'النشاط', 'المنطقة', 'الشيء', 'الموضوع',
            'في', 'على', 'من'
        ];
        
        // إذا كانت المصطلحات الغامضة تمثل أكثر من 30% من الكلمات
        const words = text.split(/\s+/);
        const ambiguousCount = words.filter(word => 
            ambiguousTerms.includes(word)
        ).length;
        
        return ambiguousCount > 0 && (ambiguousCount / words.length) > 0.3;
    }
    
    /**
     * 🈴 تحليل اللغة المستخدمة
     */
    analyzeLanguage(text) {
        const egyptianTerms = ['كام', 'عايز', 'عاوز', 'ايوه', 'لأ', 'مش', 'يعني ايه'];
        const formalTerms = ['يرجى', 'الرجاء', 'ممكن', 'هل', 'ما هو'];
        
        const egyptianCount = egyptianTerms.filter(term => text.includes(term)).length;
        const formalCount = formalTerms.filter(term => text.includes(term)).length;
        
        if (egyptianCount > formalCount) return 'egyptian';
        if (formalCount > egyptianCount) return 'formal';
        return 'mixed';
    }
    
    /**
     * 🔢 عد الكيانات في النص
     */
    countEntities(text) {
        let count = 0;
        
        // المحافظات
        const governorates = ['القاهرة', 'الإسكندرية', 'الجيزة', 'الشرقية', 'الدقهلية'];
        count += governorates.filter(gov => text.includes(gov)).length;
        
        // المناطق
        const areas = ['العاشر', 'السادات', 'برج العرب', 'زهراء', 'بدر'];
        count += areas.filter(area => text.includes(area)).length;
        
        // الأنشطة
        const activities = ['فندق', 'مصنع', 'مخبز', 'ورشة', 'مطعم'];
        count += activities.filter(activity => text.includes(activity)).length;
        
        return count;
    }
    
    /**
     * 🆕 التحقق من وجود كيان جديد
     */
    hasNewEntity(text) {
        const currentEntity = this.memory.context.currentEntity;
        if (!currentEntity) return true;
        
        // إذا ذكر كيان مختلف عما في السياق
        const entities = this.extractEntities(text);
        return entities.some(entity => 
            entity.text !== currentEntity && 
            !currentEntity.includes(entity.text)
        );
    }
    
    /**
     * 🎯 استخراج كيانات من النص
     */
    extractEntities(text) {
        const entities = [];
        const t = text.toLowerCase();
        
        // المحافظات
        const governorates = ['القاهرة', 'الإسكندرية', 'الجيزة', 'الشرقية', 'الدقهلية'];
        governorates.forEach(gov => {
            if (t.includes(gov.toLowerCase())) {
                entities.push({ type: 'governorate', text: gov });
            }
        });
        
        // المناطق
        const areas = ['العاشر', 'السادات', 'برج العرب', 'زهراء', 'بدر', 'العبور', '6 أكتوبر'];
        areas.forEach(area => {
            if (t.includes(area.toLowerCase())) {
                entities.push({ type: 'area', text: area });
            }
        });
        
        // الأنشطة
        const activities = ['فندق', 'مصنع', 'مخبز', 'ورشة', 'مطعم', 'صيدلية', 'عيادة'];
        activities.forEach(activity => {
            if (t.includes(activity.toLowerCase())) {
                entities.push({ type: 'activity', text: activity });
            }
        });
        
        return entities;
    }
    
    /**
     * ❓ التحقق من الحاجة للاستفسار
     */
    needsClarification(analysis) {
        // إذا كان السؤال غامضاً
        if (analysis.hasAmbiguousTerms && analysis.words.length < 5) {
            return true;
        }
        
        // إذا كان سؤال متابعة ولكن ليس هناك سياق
        if (analysis.isFollowUp && !analysis.hasContext) {
            return true;
        }
        
        // إذا كان الاستعلام قصيراً جداً وغير واضح
        if (analysis.wordCount <= 2 && analysis.detectedType === 'general') {
            return true;
        }
        
        // الإعدادات الخاصة بالمستخدم
        if (this.memory.preferences.confirmationMode === 'always') {
            return true;
        }
        
        return false;
    }
    
    /**
     * ❓ الاستفسار عن توضيح
     */
    askForClarification(analysis) {
        let clarificationText = '';
        
        if (analysis.isFollowUp && !analysis.hasContext) {
            clarificationText = `أعتذر، لم أتمكن من فهم إلى ماذا تشير.\n\n`;
            clarificationText += `💡 يمكنك سؤال مثل:\n`;
            clarificationText += `• "تراخيص فندق 5 نجوم"\n`;
            clarificationText += `• "منطقة العاشر من رمضان"\n`;
            clarificationText += `• "ما هو القرار 104"`;
        } else if (analysis.hasAmbiguousTerms) {
            clarificationText = `أرجو التوضيح، تقصد:\n\n`;
            
            if (analysis.text.includes('هو') || analysis.text.includes('هي')) {
                clarificationText += `1. تريد تعريفاً لشيء معين؟\n`;
                clarificationText += `2. تريد معلومات عن نشاط محدد؟\n`;
                clarificationText += `3. تريد معرفة تكلفة أو تراخيص؟`;
            } else {
                clarificationText += `💡 يرجى إعادة صياغة السؤال بشكل أكثر وضوحاً`;
            }
        } else if (analysis.wordCount <= 2) {
            clarificationText = `هل تقصد:\n\n`;
            clarificationText += `1. معلومات عن منطقة صناعية؟\n`;
            clarificationText += `2. تراخيص لنشاط معين؟\n`;
            clarificationText += `3. تفاصيل عن القرار 104؟\n\n`;
            clarificationText += `أو يمكنك إضافة المزيد من التفاصيل لمساعدتك بشكل أفضل`;
        }
        
        this.memory.context.awaitingClarification = true;
        this.memory.context.clarificationType = analysis.detectedType;
        
        return this.createResponse(
            clarificationText,
            'clarification_needed',
            0.3,
            { requiresClarification: true, clarificationFor: analysis.original }
        );
    }
    
    /**
     * 🔍 البحث المحلي (إذا لم يكن المحرك جاهزاً)
     */
    async localSearch(query) {
        console.log('🔍 بحث محلي (بدون متجهات)...');
        
        const results = {
            activities: [],
            decision104: [],
            industrial: [],
            ambiguous: false
        };
        
        // بحث بسيط في القواعد النصية
        if (this.db.activities) {
            results.activities = this.db.activities
                .filter(activity => 
                    activity.text && 
                    activity.text.toLowerCase().includes(query.toLowerCase().substring(0, 10))
                )
                .slice(0, 5)
                .map((activity, index) => ({
                    id: activity.value,
                    score: 0.8 - (index * 0.1),
                    metadata: { text: activity.text }
                }));
        }
        
        return results;
    }
    
    /**
     * ⚖️ التحقق من وجود بدائل متشابهة
     */
    hasSimilarAlternatives(results) {
        // التحقق في الأنشطة
        if (results.activities.length >= 2) {
            const topTwo = results.activities.slice(0, 2);
            const scoreDiff = Math.abs(topTwo[0].score - topTwo[1].score);
            if (scoreDiff < this.confirmationSettings.similarityThreshold) {
                return true;
            }
        }
        
        // التحقق في المناطق
        if (results.industrial.length >= 2) {
            const topTwo = results.industrial.slice(0, 2);
            const scoreDiff = Math.abs(topTwo[0].score - topTwo[1].score);
            if (scoreDiff < this.confirmationSettings.similarityThreshold) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 🔄 معالجة النتائج الغامضة
     */
    handleAmbiguousResults(query, results, analysis) {
        this.stats.ambiguous++;
        
        // جمع البدائل المتشابهة
        const alternatives = this.collectAlternatives(results);
        
        if (alternatives.length === 0) {
            // إذا لم تكن هناك بدائل واضحة، معالجة عادية
            const category = this.intelligentClassification(query, results, analysis);
            return this.processByCategory(category, query, results, analysis);
        }
        
        // حفظ البدائل في الذاكرة للاستخدام لاحقاً
        this.memory.context.currentAlternatives = alternatives;
        this.memory.context.awaitingConfirmation = true;
        
        // بناء رسالة الاستفسار
        let confirmationText = `وجدت عدة نتائج متشابهة. أيهم تقصد:\n\n`;
        
        alternatives.forEach((alt, index) => {
            confirmationText += `${index + 1}. ${alt.displayText}\n`;
        });
        
        confirmationText += `\n📝 الرجاء اختيار الرقم المناسب أو إعادة صياغة السؤال`;
        
        return this.createResponse(
            confirmationText,
            'confirmation_needed',
            0.4,
            { 
                alternatives: alternatives,
                requiresConfirmation: true,
                originalQuery: query
            }
        );
    }
    
    /**
     * 📋 جمع البدائل المتشابهة
     */
    collectAlternatives(results) {
        const alternatives = [];
        
        // جمع من الأنشطة
        if (results.activities.length >= 2) {
            const topActivities = results.activities.slice(0, this.confirmationSettings.maxAlternatives);
            topActivities.forEach((activity, index) => {
                if (activity.metadata && activity.metadata.text_preview) {
                    alternatives.push({
                        type: 'activity',
                        id: activity.id,
                        score: activity.score,
                        displayText: activity.metadata.text_preview.substring(0, 80) + '...',
                        data: activity.metadata
                    });
                }
            });
        }
        
        // جمع من المناطق
        if (results.industrial.length >= 2) {
            const topIndustrial = results.industrial.slice(0, this.confirmationSettings.maxAlternatives);
            topIndustrial.forEach((area, index) => {
                if (area.metadata && area.metadata.text_preview) {
                    alternatives.push({
                        type: 'industrial',
                        id: area.id,
                        score: area.score,
                        displayText: area.metadata.text_preview.substring(0, 80) + '...',
                        data: area.metadata
                    });
                }
            });
        }
        
        return alternatives;
    }
    
    /**
     * 🧠 التصنيف الذكي
     */
    intelligentClassification(query, results, analysis) {
        // إذا كان هناك نتائج قوية، نستخدم نوع النتيجة الأقوى
        if (results.activities.length > 0 && results.activities[0].score > 0.7) {
            return 'activity';
        }
        
        if (results.industrial.length > 0 && results.industrial[0].score > 0.7) {
            return 'area_specific';
        }
        
        if (results.decision104.length > 0 && results.decision104[0].score > 0.7) {
            return 'decision104_check';
        }
        
        // إذا لم يكن هناك نتائج قوية، نستخدم التحليل اللغوي
        const text = query.toLowerCase();
        
        // القرار 104
        if (/ما هو القرار 104|شرح القرار|تعريف القرار/.test(text)) {
            return 'decision104_general';
        }
        
        if (/الأنشطة.*(القطاع أ|قطاع أ|قطاع\s*a)/i.test(text)) {
            return 'decision104_list_a';
        }
        
        if (/الأنشطة.*(القطاع ب|قطاع ب|قطاع\s*b)/i.test(text)) {
            return 'decision104_list_b';
        }
        
        if (/هل|خاضع|مشمول|وارد/.test(text) && /104|قرار|حافز|حوافز/.test(text)) {
            return 'decision104_check';
        }
        
        // المناطق الصناعية
        if (/كام|عدد|كم/.test(text) && /منطقة|مناطق/.test(text)) {
            return 'area_count';
        }
        
        if (/جهة|جهات/.test(text) && /ولاية|الولاية/.test(text)) {
            return 'area_dependencies';
        }
        
        if (/المناطق|مناطق/.test(text) && /في|محافظة/.test(text)) {
            return 'area_list';
        }
        
        if (/منطقة/.test(text) && (/العاشر|السادات|برج العرب|زهراء|بدر/.test(text))) {
            return 'area_specific';
        }
        
        // كل شيء آخر يعتبر نشاط
        return 'activity';
    }
    
    /**
     * ⚙️ المعالجة حسب التصنيف
     */
    async processByCategory(category, query, results, analysis) {
        console.log(`📂 التصنيف الذكي: ${category}`);
        
        switch (category) {
            case 'decision104_general':
                return this.handleDecision104General();
                
            case 'decision104_list_a':
                return this.handleDecision104List('A');
                
            case 'decision104_list_b':
                return this.handleDecision104List('B');
                
            case 'decision104_check':
                return await this.handleDecision104Check(query, results);
                
            case 'area_count':
                return this.handleAreaCount(query);
                
            case 'area_list':
                return this.handleAreaList(query);
                
            case 'area_dependencies':
                return this.handleAreaDependencies();
                
            case 'area_specific':
                return await this.handleAreaSpecific(query, results);
                
            case 'activity':
                return await this.handleActivityQuery(query, results, analysis);
                
            default:
                return await this.handleGeneric(query, results, analysis);
        }
    }
    
    /**
     * 📋 معالجات القرار 104 المتطورة
     */
    handleDecision104General() {
        const text = `📜 **قرار رئيس مجلس الوزراء رقم 104 لسنة 2022**\n\n${'═'.repeat(60)}\n\nيتعلق بمنح حوافز استثمارية للمشروعات التي تُنشأ بعد صدور قانون الاستثمار رقم 72 لسنة 2017.\n\n📊 **القطاعات:**\n\n🔷 **القطاع (أ)**: حافز استثماري بنسبة **50%** من التكلفة\n   يشمل: الطاقة المتجددة، الهيدروجين الأخضر، الصناعات الاستراتيجية\n\n🔷 **القطاع (ب)**: حافز استثماري بنسبة **30%** من التكلفة\n   يشمل: صناعات أخرى مهمة\n\n💰 **الحوافز:**\n• إعفاءات جمركية\n• تخفيضات ضريبية\n• تسهيلات في الإجراءات\n\n${'═'.repeat(60)}\n\n💡 اسألني: "ما الأنشطة في القطاع أ" أو "هل النشاط X مشمول"`;
        
        return this.createResponse(text, 'decision104', 1, { 
            sector: 'both',
            hasDetails: true 
        });
    }
    
    handleDecision104List(sector) {
        if (!this.db.decision104) {
            return this.createResponse('قاعدة القرار 104 غير متوفرة', 'error', 0);
        }
        
        const sectorKey = sector === 'A' ? 'sectorA' : 'sectorB';
        const sectorData = this.db.decision104[sectorKey];
        
        if (!sectorData) {
            return this.createResponse(`بيانات القطاع ${sector} غير متوفرة`, 'error', 0);
        }
        
        let text = `📋 **أنشطة القطاع (${sector}) - قرار 104 لسنة 2022**\n\n`;
        text += `${'═'.repeat(60)}\n\n`;
        
        let count = 1;
        for (const [category, items] of Object.entries(sectorData)) {
            if (Array.isArray(items)) {
                text += `**${count}. ${category}:**\n`;
                items.slice(0, 3).forEach(item => {
                    text += `   • ${item}\n`;
                });
                if (items.length > 3) {
                    text += `   ... و${items.length - 3} نشاط آخر\n`;
                }
                text += `\n`;
                count++;
            }
        }
        
        text += `${'═'.repeat(60)}\n`;
        text += `💡 حافز استثماري: **${sector === 'A' ? '50%' : '30%'}** من التكلفة`;
        
        return this.createResponse(text, 'decision104_list', 1, { 
            sector: sector,
            data: sectorData 
        });
    }
    
    async handleDecision104Check(query, results) {
        if (!window.vEngine || !window.vEngine.isReady) {
            return this.handleDecision104LocalCheck(query);
        }
        
        const decisionResults = results.decision104 || [];
        
        if (decisionResults.length === 0 || decisionResults[0].score < 0.4) {
            return this.createResponse(
                `❌ **لم يتم العثور على هذا النشاط في قرار 104**\n\n` +
                `الأنشطة المشمولة تركز على:\n` +
                `• الطاقة المتجددة (خلايا شمسية، طاقة رياح)\n` +
                `• الهيدروجين الأخضر ومشتقاته\n` +
                `• الصناعات الغذائية الاستراتيجية\n` +
                `• المنسوجات والملابس الجاهزة`,
                'decision104_not_found',
                0.3
            );
        }
        
        const best = decisionResults[0];
        const metadata = best.metadata || {};
        
        // تحديد القطاع من البيانات الوصفية
        const sector = metadata.metadata?.sector || 'A';
        const sectorName = sector === 'A' ? 'القطاع (أ)' : 'القطاع (ب)';
        const incentive = sector === 'A' ? '50%' : '30%';
        
        const text = `
✅ **نعم، مشمول في قرار 104 لسنة 2022**

${'═'.repeat(60)}

🎯 **القطاع:** ${sectorName}
💰 **الحافز:** ${incentive} من التكلفة

${'═'.repeat(60)}

📋 **التفاصيل:**
${metadata.text_preview || 'تفاصيل النشاط'}

📌 **ملاحظات:**
• للمشروعات المنشأة بعد قانون الاستثمار 72 لسنة 2017
• إعفاءات جمركية وتخفيضات ضريبية
• تسهيلات إجرائية في الجهات الحكومية

💡 **للاستفادة:** راجع الهيئة العامة للاستثمار والمناطق الحرة
        `.trim();
        
        return this.createResponse(text, 'decision104_match', best.score, {
            sector: sector,
            incentive: incentive,
            metadata: metadata
        });
    }
    
    /**
     * 🏭 معالجات المناطق الصناعية المتطورة
     */
    handleAreaCount(query) {
        if (!this.db.industrial) {
            return this.createResponse('قاعدة المناطق غير متوفرة', 'error', 0);
        }
        
        const govMatch = query.match(/(القاهرة|الإسكندرية|الجيزة|القليوبية|الشرقية|الدقهلية)/);
        
        if (govMatch) {
            const gov = govMatch[1];
            const filtered = this.db.industrial.filter(a => 
                a.governorate && a.governorate.includes(gov)
            );
            
            let text = `📊 **عدد المناطق في ${gov}:** ${filtered.length} منطقة\n\n`;
            if (filtered.length > 0) {
                text += `📋 **القائمة:**\n`;
                filtered.slice(0, 8).forEach((a, i) => {
                    text += `${i + 1}. ${a.name}\n`;
                });
                if (filtered.length > 8) text += `... و${filtered.length - 8} أخرى`;
            }
            
            return this.createResponse(text, 'area_count', 0.95, { 
                areas: filtered,
                governorate: gov 
            });
        }
        
        // العدد الإجمالي
        const total = this.db.industrial.length;
        return this.createResponse(
            `📊 **إجمالي المناطق الصناعية في مصر:** ${total} منطقة`,
            'area_count',
            1,
            { total }
        );
    }
    
    async handleAreaSpecific(query, results) {
        const areaResults = results.industrial || [];
        
        if (areaResults.length === 0) {
            return this.handleAreaSpecificLocal(query);
        }
        
        const best = areaResults[0];
        const metadata = best.metadata || {};
        
        // البحث عن البيانات النصية الكاملة
        const areaData = this.findAreaData(best.id, metadata);
        
        if (!areaData) {
            return this.handleAreaSpecificLocal(query);
        }
        
        // تحديد ما إذا كان المستخدم يريد معلومات محددة
        const specificInfo = this.extractSpecificRequest(query);
        
        if (specificInfo) {
            return this.provideSpecificAreaInfo(areaData, specificInfo, best.score);
        }
        
        // معلومات شاملة
        return this.provideComprehensiveAreaInfo(areaData, query, best.score);
    }
    
    /**
     * 📋 معالجات الأنشطة المتطورة
     */
    async handleActivityQuery(query, results, analysis) {
        const activityResults = results.activities || [];
        
        if (activityResults.length === 0) {
            return this.createResponse(
                'لم أجد نشاطاً مطابقاً.\n\n💡 جرب:\n• "تراخيص فندق 5 نجوم"\n• "متطلبات مصنع أدوية"\n• "إجراءات فتح مطعم"',
                'no_results',
                0.2
            );
        }
        
        const best = activityResults[0];
        
        // إذا كانت هناك بدائل متشابهة وكانت الدرجات متقاربة
        if (activityResults.length >= 2) {
            const secondBest = activityResults[1];
            const scoreDiff = best.score - secondBest.score;
            
            if (scoreDiff < 0.15) {
                // عرض البدائل للمستخدم للاختيار
                const alternatives = activityResults.slice(0, 3).map((result, idx) => ({
                    id: result.id,
                    score: result.score,
                    text: result.metadata?.text_preview || `نشاط ${idx + 1}`
                }));
                
                let altText = `وجدت عدة أنشطة متشابهة. أي منهم تقصد:\n\n`;
                alternatives.forEach((alt, idx) => {
                    altText += `${idx + 1}. ${alt.text.substring(0, 60)}...\n`;
                });
                altText += `\n📝 الرجاء اختيار الرقم المناسب`;
                
                this.memory.context.currentAlternatives = alternatives;
                this.memory.context.awaitingConfirmation = true;
                
                return this.createResponse(
                    altText,
                    'confirmation_needed',
                    0.5,
                    { alternatives: alternatives, type: 'activity' }
                );
            }
        }
        
        // البحث عن البيانات النصية الكاملة
        const activityData = this.findActivityData(best.id, best.metadata);
        
        if (!activityData) {
            return this.createResponse(
                `وجدت "${best.metadata?.text_preview || 'النشاط'}" لكن التفاصيل غير متوفرة`,
                'partial',
                best.score
            );
        }
        
        // حفظ في السياق
        this.memory.context.currentEntity = activityData.text;
        this.memory.context.currentType = 'activity';
        this.memory.context.currentData = activityData;
        
        // تحديد المعلومات المطلوبة
        const specificInfo = this.extractSpecificRequest(query);
        
        if (specificInfo) {
            return this.provideSpecificActivityInfo(activityData, specificInfo, best.score);
        }
        
        // معلومات شاملة
        return this.provideComprehensiveActivityInfo(activityData, query, best.score, analysis);
    }
    
    /**
     * 🔧 دوال مساعدة متقدمة
     */
    extractSpecificRequest(query) {
        const text = query.toLowerCase();
        
        if (/ترخيص|تراخيص|رخص|إجازة/.test(text)) return 'licensing';
        if (/جهة|جهات|مختص|مسئول/.test(text)) return 'authorities';
        if (/سند|تشريع|قانون|لوائح/.test(text)) return 'legislation';
        if (/موقع|مكان|أين|عنوان/.test(text)) return 'location';
        if (/مساحة|حجم|متر|فدان/.test(text)) return 'area';
        if (/تكلفة|سعر|بكام|مصاريف/.test(text)) return 'cost';
        if (/مدة|زمن|وقت/.test(text)) return 'duration';
        if (/متطلبات|شروط|اشتراطات/.test(text)) return 'requirements';
        if (/إجراءات|خطوات|طريقة/.test(text)) return 'procedures';
        
        return null;
    }
    
    findActivityData(id, metadata) {
        if (!this.db.activities) return null;
        
        // البحث باستخدام المعرف من المتجهات
        let found = this.db.activities.find(a => a.value === id);
        
        if (!found && metadata?.original_data?.id) {
            found = this.db.activities.find(a => a.value === metadata.original_data.id);
        }
        
        // البحث باستخدام النص
        if (!found && metadata?.text_preview) {
            const searchText = metadata.text_preview.substring(0, 40);
            found = this.db.activities.find(a => 
                a.text && a.text.includes(searchText)
            );
        }
        
        return found;
    }
    
    findAreaData(id, metadata) {
        if (!this.db.industrial) return null;
        
        // 1. المحاولة الأولى: البحث المطابق بالمعرف (ID)
        let found = this.db.industrial.find(a => a.id == id); // == للمقارنة المرنة بين string/number
        
        // 2. المحاولة الثانية: البحث بالاسم القادم من البيانات الوصفية
        if (!found && metadata?.text_preview) {
            // تنظيف النص للبحث (إزالة الكلمات الزائدة لزيادة دقة المطابقة)
            const searchText = metadata.text_preview
                .split(' ')
                .filter(w => w.length > 3) // نأخذ الكلمات المهمة فقط
                .slice(0, 3) // نأخذ أول 3 كلمات
                .join(' ');

            if (searchText.length > 2) {
                found = this.db.industrial.find(a => 
                    a.name && a.name.includes(searchText)
                );
            }
        }

        // 3. المحاولة الثالثة: البحث العكسي (هل اسم المنطقة في القاعدة جزء من النص المختار؟)
        if (!found && metadata?.text_preview) {
             const fullText = metadata.text_preview;
             found = this.db.industrial.find(a => 
                a.name && fullText.includes(a.name)
             );
        }
        
        return found;
    }
    
    /**
     * 💾 تحديث الذاكرة المتقدمة
     */
    updateAdvancedMemory(query, response, analysis, searchResults) {
        const memoryEntry = {
            query: query,
            response: response.text,
            type: response.type,
            confidence: response.confidence,
            analysis: analysis,
            timestamp: Date.now(),
            context: {
                entity: this.memory.context.currentEntity,
                type: this.memory.context.currentType,
                data: this.memory.context.currentData
            }
        };
        
        this.memory.conversation.push(memoryEntry);
        
        // الاحتفاظ بآخر 20 رسالة
        if (this.memory.conversation.length > 20) {
            this.memory.conversation.shift();
        }
        
        // تحديث السياق
        this.memory.context.lastQuery = query;
        this.memory.context.lastResponse = response;
        this.memory.context.timestamp = Date.now();
        
        // تحديث الإحصائيات
        if (response.confidence > 0.6) {
            this.stats.successful++;
        }
        
        // حفظ في localStorage
        this.saveConversation();
    }
    
    /**
     * 💾 حفظ واسترجاع المحادثة
     */
    saveConversation() {
        try {
            localStorage.setItem('smart_assistant_conversation_v13', 
                JSON.stringify(this.memory.conversation));
            localStorage.setItem('smart_assistant_context_v13',
                JSON.stringify(this.memory.context));
        } catch (e) {
            console.warn('⚠️ فشل حفظ المحادثة:', e);
        }
    }
    
    restoreConversation() {
        try {
            const savedConv = localStorage.getItem('smart_assistant_conversation_v13');
            const savedContext = localStorage.getItem('smart_assistant_context_v13');
            
            if (savedConv) {
                this.memory.conversation = JSON.parse(savedConv);
            }
            
            if (savedContext) {
                this.memory.context = { ...this.memory.context, ...JSON.parse(savedContext) };
            }
            
            console.log(`📚 تم استرجاع ${this.memory.conversation.length} رسالة من المحادثة`);
        } catch (e) {
            console.warn('⚠️ فشل استرجاع المحادثة:', e);
        }
    }
    
    /**
     * 📦 إنشاء استجابة منظمة
     */
    createResponse(text, type, confidence, extraData = {}) {
        return {
            text,
            type,
            confidence,
            timestamp: Date.now(),
            memoryContext: {
                currentEntity: this.memory.context.currentEntity,
                currentType: this.memory.context.currentType
            },
            ...extraData
        };
    }
    
    /**
     * 🔄 التوافق مع الإصدارات القديمة
     */
    async showDetails(entityId, entityType, fallbackText = '') {
        console.log(`🔍 عرض تفاصيل: ${entityId} (${entityType}) - النص: ${fallbackText}`);
        
        // تجهيز كائنMetadata للبحث
        const searchMeta = { text_preview: fallbackText };

        if (entityType === 'activity') {
            const data = this.findActivityData(entityId, searchMeta);
            if (data) {
                return this.provideComprehensiveActivityInfo(data, 'تفاصيل', 1, {});
            }
        }
        
        // التعامل مع النوعين (area أو industrial)
        if (entityType === 'area' || entityType === 'industrial') {
            const data = this.findAreaData(entityId, searchMeta);
            if (data) {
                return this.provideComprehensiveAreaInfo(data, 'تفاصيل', 1);
            }
        }
        
        return this.createResponse('عذراً، تفاصيل هذا العنصر غير متوفرة في قاعدة البيانات النصية.', 'error', 0);
    }
    
    // توابع التوافق مع V12
    async handleGeneric(query, results, analysis) {
        if (!window.vEngine || !window.vEngine.isReady) {
            return this.createResponse('محرك البحث غير جاهز', 'error', 0);
        }
        
        // جمع أفضل النتائج
        const allResults = [
            ...(results.activities || []).map(r => ({ ...r, type: 'activity' })),
            ...(results.industrial || []).map(r => ({ ...r, type: 'area' })),
            ...(results.decision104 || []).map(r => ({ ...r, type: 'decision104' }))
        ].sort((a, b) => b.score - a.score);
        
        if (allResults.length === 0) {
            return this.createResponse(
                'عذراً، لم أجد معلومات مطابقة.\n\n💡 جرب:\n• "ما تراخيص مصنع الأدوية"\n• "المناطق في القاهرة"\n• "ما هو القرار 104"',
                'no_results',
                0
            );
        }
        
        const best = allResults[0];
        
        // التوجيه حسب النوع
        if (best.type === 'activity') {
            return this.handleActivityQuery(query, results, analysis);
        }
        
        if (best.type === 'area') {
            return this.handleAreaSpecific(query, results);
        }
        
        if (best.type === 'decision104') {
            return this.handleDecision104Check(query, results);
        }
        
        return this.createResponse('لم أفهم السؤال', 'no_results', 0);
    }
}

// ============================================================================
// دوال المساعدة للتفاصيل المحددة
// ============================================================================

IntelligentSmartAssistant.prototype.provideSpecificActivityInfo = function(activityData, infoType, confidence) {
    const details = activityData.details || {};
    
    let text = '';
    let title = '';
    
    switch (infoType) {
        case 'licensing':
            title = `📋 التراخيص المطلوبة لـ ${activityData.text}`;
            text = details.req || 'لا توجد معلومات تفصيلية عن التراخيص';
            break;
            
        case 'authorities':
            title = `🏛️ الجهات المختصة بـ ${activityData.text}`;
            text = details.auth || 'لا توجد معلومات عن الجهات المختصة';
            break;
            
        case 'legislation':
            title = `⚖️ التشريعات المنظمة لـ ${activityData.text}`;
            text = details.leg || 'لا توجد معلومات عن التشريعات';
            break;
            
        case 'location':
            title = `📍 الموقع المناسب لـ ${activityData.text}`;
            text = details.loc || 'لا توجد معلومات عن الموقع';
            break;
            
        case 'requirements':
            title = `📝 المتطلبات الأساسية لـ ${activityData.text}`;
            text = details.req || 'لا توجد معلومات عن المتطلبات';
            break;
            
        default:
            title = `ℹ️ معلومات عن ${activityData.text}`;
            text = 'المعلومات المطلوبة غير متوفرة';
    }
    
    const responseText = `${title}\n\n${'═'.repeat(60)}\n\n${text}\n\n${'═'.repeat(60)}`;
    
    return this.createResponse(responseText, 'activity_specific', confidence, {
        activity: activityData,
        infoType: infoType
    });
};

IntelligentSmartAssistant.prototype.provideComprehensiveActivityInfo = function(activityData, query, confidence, analysis) {
    const details = activityData.details || {};
    const language = analysis?.language || 'formal';
    
    let text = `🏢 **${activityData.text}**\n\n${'═'.repeat(60)}\n\n`;
    
    // استخدام اللغة المناسبة
    if (language === 'egyptian') {
        text += `📋 **طبيعة الشغل:**\n${details.act || 'مفيش تفاصيل'}\n\n`;
        text += `📝 **التراخيص المطلوبة:**\n${details.req || 'مفيش بيانات'}\n\n`;
        text += `🏛️ **الجهات المسؤولة:**\n${details.auth || 'معرفش'}\n\n`;
        text += `📍 **المكان المناسب:**\n${details.loc || 'في أي مكان'}\n\n`;
        text += `⚖️ **القوانين:**\n${details.leg || 'القوانين العادية'}\n\n`;
    } else {
        text += `📋 **طبيعة النشاط:**\n${details.act || 'لا توجد معلومات تفصيلية'}\n\n`;
        text += `📝 **التراخيص المطلوبة:**\n${details.req || 'يرجى مراجعة الجهة المختصة'}\n\n`;
        text += `🏛️ **الجهات المختصة:**\n${details.auth || 'غير محدد'}\n\n`;
        text += `📍 **الموقع المناسب:**\n${details.loc || 'غير محدد'}\n\n`;
        text += `⚖️ **التشريعات المنظمة:**\n${details.leg || 'القوانين العامة'}\n\n`;
    }
    
    if (details.link) {
        text += `🔗 **الدليل الإرشادي:** ${details.link}\n\n`;
    }
    
    text += `${'═'.repeat(60)}\n`;
    text += `💡 اسألني عن أي جزء محدد (تراخيص، جهات، إجراءات...)`;
    
    return this.createResponse(text, 'activity_full', confidence, {
        activity: activityData,
        hasDetails: !!details.act
    });
};

IntelligentSmartAssistant.prototype.provideSpecificAreaInfo = function(areaData, infoType, confidence) {
    let text = '';
    let title = '';
    
    switch (infoType) {
        case 'location':
            title = `📍 موقع ${areaData.name}`;
            text = `المحافظة: ${areaData.governorate || 'غير محدد'}`;
            if (areaData.x && areaData.y) {
                text += `\nالإحداثيات: ${areaData.x}, ${areaData.y}`;
                text += `\n🗺️ رابط الخريطة: https://www.google.com/maps?q=${areaData.y},${areaData.x}`;
            }
            break;
            
        case 'area':
            title = `📏 مساحة ${areaData.name}`;
            text = `${areaData.area || 'غير محدد'} فدان`;
            break;
            
        case 'authorities':
            title = `🏛️ جهة الولاية لـ ${areaData.name}`;
            text = areaData.dependency || 'غير محدد';
            break;
            
        case 'decision':
            title = `📜 قرار إنشاء ${areaData.name}`;
            text = areaData.decision || 'غير متوفر';
            break;
            
        default:
            title = `ℹ️ معلومات عن ${areaData.name}`;
            text = 'المعلومات المطلوبة غير متوفرة';
    }
    
    const responseText = `${title}\n\n${'═'.repeat(60)}\n\n${text}\n\n${'═'.repeat(60)}`;
    
    return this.createResponse(responseText, 'area_specific', confidence, {
        area: areaData,
        infoType: infoType
    });
};

IntelligentSmartAssistant.prototype.provideComprehensiveAreaInfo = function(areaData, query, confidence) {
    let text = `🏭 **${areaData.name}**\n\n${'═'.repeat(60)}\n\n`;
    
    text += `📍 **المحافظة:** ${areaData.governorate || 'غير محدد'}\n`;
    text += `🏛️ **جهة الولاية:** ${areaData.dependency || 'غير محدد'}\n`;
    text += `📏 **المساحة:** ${areaData.area || 'غير محدد'} فدان\n\n`;
    
    if (areaData.decision) {
        text += `📜 **قرار الإنشاء:**\n${areaData.decision}\n\n`;
    }
    
    if (areaData.x && areaData.y) {
        text += `🗺️ **الموقع على الخريطة:**\nhttps://www.google.com/maps?q=${areaData.y},${areaData.x}\n\n`;
    }
    
    text += `${'═'.repeat(60)}\n`;
    text += `💡 اسألني عن: مساحة، موقع، جهة الولاية، أو قرار الإنشاء`;
    
    return this.createResponse(text, 'area_full', confidence, {
        area: areaData,
        hasCoordinates: !!(areaData.x && areaData.y)
    });
};

IntelligentSmartAssistant.prototype.handleAreaSpecificLocal = function(query) {
    if (!this.db.industrial) {
        return this.createResponse('قاعدة المناطق غير متوفرة', 'error', 0);
    }
    
    const searchTerms = ['العاشر', 'السادات', 'برج العرب', 'زهراء', 'بدر', 'العبور'];
    let found = null;
    
    for (const term of searchTerms) {
        if (query.includes(term)) {
            found = this.db.industrial.find(a => a.name.includes(term));
            if (found) break;
        }
    }
    
    if (!found) {
        return this.createResponse(
            `لم أجد المنطقة المطلوبة.\n\n💡 جرب: "المناطق في القاهرة" أو "كام منطقة"`,
            'no_results',
            0.2
        );
    }
    
    return this.provideComprehensiveAreaInfo(found, query, 0.9);
};

IntelligentSmartAssistant.prototype.handleDecision104LocalCheck = function(query) {
    if (!this.db.decision104) {
        return this.createResponse('قاعدة القرار 104 غير متوفرة', 'error', 0);
    }
    
    // بحث نصي بسيط
    const searchText = query.toLowerCase();
    let foundActivity = null;
    let foundSector = null;
    
    // البحث في القطاع أ
    if (this.db.decision104.sectorA) {
        for (const [category, items] of Object.entries(this.db.decision104.sectorA)) {
            if (Array.isArray(items)) {
                const match = items.find(item => 
                    item.toLowerCase().includes(searchText.substring(0, 20))
                );
                if (match) {
                    foundActivity = match;
                    foundSector = 'A';
                    break;
                }
            }
        }
    }
    
    // البحث في القطاع ب
    if (!foundActivity && this.db.decision104.sectorB) {
        for (const [category, items] of Object.entries(this.db.decision104.sectorB)) {
            if (Array.isArray(items)) {
                const match = items.find(item => 
                    item.toLowerCase().includes(searchText.substring(0, 20))
                );
                if (match) {
                    foundActivity = match;
                    foundSector = 'B';
                    break;
                }
            }
        }
    }
    
    if (!foundActivity) {
        return this.createResponse(
            `❌ النشاط غير مشمول في قرار 104`,
            'decision104_not_found',
            0.3
        );
    }
    
    const sectorName = foundSector === 'A' ? 'القطاع (أ)' : 'القطاع (ب)';
    const incentive = foundSector === 'A' ? '50%' : '30%';
    
    const text = `
✅ **نعم، مشمول في قرار 104 لسنة 2022**

${'═'.repeat(60)}

📋 **النشاط:** ${foundActivity}

🎯 **القطاع:** ${sectorName}
💰 **الحافز:** ${incentive} من التكلفة

${'═'.repeat(60)}

📌 للمشروعات المنشأة بعد قانون الاستثمار 72 لسنة 2017
    `.trim();
    
    return this.createResponse(text, 'decision104_match', 0.8, {
        sector: foundSector,
        incentive: incentive
    });
};

// ============================================================================
// التصدير والتهيئة
// ============================================================================

window.finalAssistantV13 = new IntelligentSmartAssistant();

// التوافق مع الكود القديم
window.assistant = {
    getResponse: (query) => window.finalAssistantV13.query(query),
    showLicenseDetails: (id) => window.finalAssistantV13.showDetails(id, 'activity')
};

window.smartAssistant = window.finalAssistantV13; // للتوافق مع V11/V12


console.log('✅ Smart Assistant V13 - المساعد الذكي المتطور جاهز!');
