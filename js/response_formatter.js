/****************************************************************************
 * 🎨 Response Formatter V2 - منسق الردود الاحترافي
 * متوافق كلياً مع Smart Assistant V13
 ****************************************************************************/

class ResponseFormatter {
    constructor() {
        this.cardColors = {
            activity: { primary: '#2196f3', secondary: '#e3f2fd', icon: '🏭' },
            area: { primary: '#4caf50', secondary: '#e8f5e9', icon: '📍' },
            decision104: { primary: '#ff9800', secondary: '#fff3e0', icon: '⭐' },
            license: { primary: '#9c27b0', secondary: '#f3e5f5', icon: '📄' },
            authority: { primary: '#f44336', secondary: '#ffebee', icon: '🏛️' },
            legislation: { primary: '#607d8b', secondary: '#eceff1', icon: '⚖️' },
            technical: { primary: '#00bcd4', secondary: '#e0f7fa', icon: '🔧' },
            guide: { primary: '#3f51b5', secondary: '#e8eaf6', icon: '📚' },
            suggestion: { primary: '#795548', secondary: '#efebe9', icon: '💡' },
            error: { primary: '#f44336', secondary: '#ffcdd2', icon: '⚠️' },
            success: { primary: '#4caf50', secondary: '#c8e6c9', icon: '✅' },
            info: { primary: '#2196f3', secondary: '#bbdefb', icon: 'ℹ️' },
            // ألوان جديدة للأنواع الجديدة
            clarification: { primary: '#6c757d', secondary: '#e9ecef', icon: '❓' },
            confirmation: { primary: '#009688', secondary: '#e0f2f1', icon: '🔢' }
        };
    }
    
    // ==================== تنسيق الرد الرئيسي ====================
    formatResponse(response) {
        if (!response || !response.type) {
            return this.createErrorCard('خطأ في تنسيق الرد: البيانات غير مكتملة');
        }
        
        console.log('🎨 تنسيق رد من نوع:', response.type);
        
        switch (response.type) {
            // --- الأنشطة ---
            case 'activity_full':
                return this.formatActivityFull(response);
            case 'activity_specific':
                return this.formatActivitySpecific(response);
            
            // --- المناطق الصناعية ---
            case 'area_full':
                return this.formatAreaFull(response);
            case 'area_specific':
                return this.formatAreaSpecific(response);
            case 'area_list':
                return this.formatAreaList(response);
            case 'area_count':
                return this.formatAreaCount(response);
            case 'area_dependencies':
                return this.formatAreaDependencies(response);
            
            // --- القرار 104 (جديد V13) ---
            case 'decision104_general':
                return this.formatDecision104General(response);
            case 'decision104_list':
                return this.formatDecision104List(response);
            case 'decision104_match':
                return this.formatDecision104Match(response);
            case 'decision104_not_found':
                return this.formatDecision104NotFound(response);
            
            // --- الحالات التفاعلية (جديد V13) ---
            case 'confirmation_needed':
                return this.formatConfirmation(response);
            case 'clarification_needed':
                return this.formatClarification(response);
            
            // --- حالات عامة ---
            case 'no_results':
                return this.formatNoResults(response);
            case 'command':
                return this.formatCommand(response);
            case 'help':
                return this.formatHelp(response);
            case 'error':
                return this.createErrorCard(response.text);
            
            default:
                return this.formatGeneralResponse(response);
        }
    }

    // ==================== [جديد] تنسيق المطابقة مع قرار 104 ====================
    formatDecision104Match(response) {
        const sector = response.sector === 'A' ? 'القطاع (أ)' : 'القطاع (ب)';
        const incentive = response.incentive;
        const color = response.sector === 'A' ? '#198754' : '#0d6efd'; // أخضر لـ أ، أزرق لـ ب
        
        let content = `<div class="decision-match-card">`;
        
        content += `
            <div class="match-header" style="text-align:center; padding:15px; background:${color}15; border-radius:10px; margin-bottom:15px;">
                <div style="font-size:2rem;">🎉</div>
                <h5 style="color:${color}; font-weight:bold; margin:10px 0;">النشاط مشمول في القرار!</h5>
                <div class="badge" style="background:${color}; font-size:1rem; padding:8px 15px;">${sector}</div>
            </div>
        `;
        
        content += `
            <div class="incentive-box" style="border:2px dashed ${color}; padding:15px; border-radius:10px; margin-bottom:15px; text-align:center;">
                <span style="display:block; color:#666; font-size:0.9rem;">نسبة الحافز الاستثماري</span>
                <strong style="display:block; font-size:1.8rem; color:${color};">${incentive}</strong>
                <span style="display:block; color:#666; font-size:0.8rem;">من التكلفة الاستثمارية</span>
            </div>
        `;
        
        content += `<div class="decision-text">${this.formatText(response.text)}</div>`;
        content += `</div>`;
        
        return this.createCard('decision104', 'نتيجة فحص القرار 104', content, response.confidence);
    }

    formatDecision104NotFound(response) {
        let content = `<div class="decision-not-found">`;
        content += `<div class="alert alert-warning" style="background:#fff3cd; color:#856404; border:none;">
            <i class="fas fa-exclamation-triangle"></i> هذا النشاط غير مدرج بشكل صريح في قوائم القرار 104.
        </div>`;
        content += `<div class="text-content">${this.formatText(response.text)}</div>`;
        content += `</div>`;
        
        return this.createCard('error', 'غير مشمول في القرار', content, 1);
    }

    // ==================== [جديد] تنسيق الاستفسارات والبدائل ====================
    formatConfirmation(response) {
        let content = `<div class="confirmation-box">`;
        content += `<p style="margin-bottom:15px;">${this.formatText(response.text)}</p>`;
        
        if (response.alternatives && response.alternatives.length > 0) {
            content += `<div class="alternatives-list">`;
            response.alternatives.forEach((alt, idx) => {
                const text = alt.displayText || alt.text;
                content += `
                    <div class="alternative-item clickable" onclick="window.assistantUI.sendMessage('${text.replace(/'/g, "\\'")}')" 
                         style="padding:10px; margin:5px 0; background:#f8f9fa; border:1px solid #dee2e6; border-radius:8px; cursor:pointer;">
                        <span class="badge bg-secondary me-2">${idx + 1}</span>
                        ${text}
                    </div>
                `;
            });
            content += `</div>`;
        }
        content += `</div>`;
        
        return this.createCard('confirmation', 'مطلوب تأكيد', content, 1);
    }

    formatClarification(response) {
        return this.createCard('clarification', 'أحتاج توضيحاً', this.formatText(response.text), 1);
    }

    // ==================== تنسيق القرار 104 العام ====================
    formatDecision104General(response) {
        let content = `<div class="decision104-general-card">`;
        content += `<div class="decision-text mb-3">${this.formatText(response.text)}</div>`;
        
        content += `<div class="sectors-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">`;
        content += `<div class="sector-box" style="background: #e7f3ff; padding: 12px; border-radius: 8px; border: 1px solid #74c0fc; text-align: center;">
                        <strong style="color: #1971c2; display: block; margin-bottom: 5px;">📍 القطاع (أ)</strong>
                        <small style="font-size: 0.75rem; color: #495057;">حافز <b style="color:#1971c2">50%</b></small>
                    </div>`;
        content += `<div class="sector-box" style="background: #ebfbee; padding: 12px; border-radius: 8px; border: 1px solid #69db7c; text-align: center;">
                        <strong style="color: #2f9e44; display: block; margin-bottom: 5px;">🌍 القطاع (ب)</strong>
                        <small style="font-size: 0.75rem; color: #495057;">حافز <b style="color:#2f9e44">30%</b></small>
                    </div>`;
        content += `</div>`;

        content += `<div class="action-buttons">
                        <button class="action-btn" onclick="window.assistantUI.sendMessage('قائمة القطاع أ')">📋 أنشطة القطاع أ</button>
                        <button class="action-btn" onclick="window.assistantUI.sendMessage('قائمة القطاع ب')">📋 أنشطة القطاع ب</button>
                    </div>`;
        content += `</div>`;
        
        return this.createCard('decision104', 'شرح قرار الحوافز', content, response.confidence);
    }

    formatDecision104List(response) {
        let content = `<div class="decision-list-container" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">`;
        
        // التعامل مع هيكلية البيانات الجديدة من V13
        const data = response.data || {};
        
        for (const [category, items] of Object.entries(data)) {
            if (Array.isArray(items) && items.length > 0) {
                content += `
                    <div class="category-group" style="margin-bottom: 15px;">
                        <div style="background: #f1f3f5; padding: 8px 12px; border-radius: 6px; font-weight: bold; color: #495057; margin-bottom: 5px;">
                            📌 ${category}
                        </div>
                        <ul style="list-style: none; padding-right: 15px; margin: 0;">`;
                
                items.forEach(item => {
                    content += `<li style="font-size: 0.85rem; margin-bottom: 4px; color: #212529; line-height: 1.4;">• ${item}</li>`;
                });
                
                content += `</ul></div>`;
            }
        }
        
        content += `</div>`;
        const title = response.sector ? `قائمة القطاع (${response.sector})` : 'قائمة الأنشطة';
        return this.createCard('decision104', title, content, response.confidence);
    }

    // ==================== تنسيق الأنشطة ====================
    formatActivityFull(response) {
        const { activity, hasDetails } = response;
        const details = activity.details || {};
        
        let html = '';
        
        // الكارد الرئيسي
        html += this.createCard('activity', 
            `${activity.text}`,
            this.formatText(response.text), // استخدام النص المنسق من V13
            response.confidence
        );
        
        // أزرار المتابعة الذكية
        html += this.createActionButtons(activity);
        
        return html;
    }

    formatActivitySpecific(response) {
        // V13 يرسل النص جاهزاً، نحتاج فقط وضعه في كارد
        const title = response.infoType ? this.getSpecificTitle(response.infoType) : 'معلومات محددة';
        return this.createCard('activity', title, this.formatText(response.text), response.confidence);
    }

    getSpecificTitle(type) {
        const titles = {
            'licensing': '📄 التراخيص المطلوبة',
            'authorities': '🏛️ الجهات المختصة',
            'legislation': '⚖️ السند التشريعي',
            'location': '📍 الموقع المناسب',
            'requirements': '📋 المتطلبات',
            'cost': '💰 التكلفة المتوقعة'
        };
        return titles[type] || 'تفاصيل النشاط';
    }

    // ==================== تنسيق المناطق ====================
    formatAreaFull(response) {
        const { area, hasCoordinates } = response;
        
        let html = this.createCard('area', 
            `منطقة ${area.name}`,
            this.formatText(response.text),
            response.confidence
        );
        
        // زر الخريطة
        if (hasCoordinates && area.x && area.y) {
            const mapUrl = `https://www.google.com/maps?q=${area.y},${area.x}`;
            html += `
                <div class="map-button-container" style="text-align:center; margin-top:-10px; margin-bottom:10px;">
                    <a href="${mapUrl}" target="_blank" class="btn-map" style="background:#28a745; color:white; padding:8px 20px; border-radius:20px; text-decoration:none; font-size:0.9rem;">
                        <i class="fas fa-map-marker-alt"></i> عرض الموقع على الخريطة
                    </a>
                </div>
            `;
        }
        
        return html;
    }

    formatAreaSpecific(response) {
        return this.createCard('area', `تفاصيل: ${response.area.name}`, this.formatText(response.text), response.confidence);
    }

    formatAreaCount(response) {
        return this.createCard('area', 'إحصائيات المناطق', this.formatText(response.text), response.confidence);
    }

    formatAreaList(response) {
        // إذا كان النص يحتوي على قائمة جاهزة من V13
        return this.createCard('area', 'قائمة المناطق', this.formatText(response.text), response.confidence);
    }

    formatAreaDependencies(response) {
        return this.createCard('authority', 'جهات الولاية', this.formatText(response.text), response.confidence);
    }

    // ==================== وظائف مساعدة عامة ====================
    formatNoResults(response) {
        let content = `<div style="text-align:center; padding:10px;">
            <div style="font-size:2rem; margin-bottom:10px;">😕</div>
            <p>${this.formatText(response.text)}</p>
        </div>`;
        return this.createCard('error', 'لم يتم العثور على نتائج', content, 0);
    }

    formatHelp(response) {
        return this.createCard('info', 'المساعدة', this.formatText(response.text), 1);
    }

    formatGeneralResponse(response) {
        return this.createCard('info', 'المساعد الذكي', this.formatText(response.text), response.confidence);
    }

    // ==================== المكونات الأساسية ====================
    createCard(type, title, content, confidence = 0) {
        const colors = this.cardColors[type] || this.cardColors.info;
        const confidenceBar = confidence > 0 ? this.createConfidenceBar(confidence) : '';
        
        return `
            <div class="response-card card-${type}" style="border-right: 4px solid ${colors.primary}; background:white; border-radius:12px; margin-bottom:15px; box-shadow:0 2px 8px rgba(0,0,0,0.05); overflow:hidden;">
                <div class="card-header" style="background: ${colors.secondary}; color: ${colors.primary}; padding:12px 15px; display:flex; align-items:center; gap:10px; font-weight:bold;">
                    <span class="card-icon" style="font-size:1.2rem;">${colors.icon}</span>
                    <span class="card-title">${title}</span>
                </div>
                <div class="card-body" style="padding:15px; font-size:0.95rem; line-height:1.6; color:#333;">
                    ${content}
                </div>
                ${confidenceBar}
            </div>
        `;
    }

    createConfidenceBar(confidence) {
        const percent = Math.round(confidence * 100);
        // لا نعرض الشريط إذا كانت الثقة كاملة (مثل رسائل المساعدة)
        if (percent >= 99) return ''; 
        
        let color = '#4caf50';
        if (percent < 50) color = '#f44336';
        else if (percent < 75) color = '#ff9800';
        
        return `
            <div class="confidence-bar" style="height:4px; background:#f0f0f0; width:100%;">
                <div style="height:100%; width:${percent}%; background:${color}; transition:width 0.5s;"></div>
            </div>
        `;
    }

    // تحويل Markdown بسيط (غامق، قوائم) إلى HTML
    formatText(text) {
        if (!text) return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // تحويل **نص** إلى عريض
            .replace(/\n/g, '<br>') // تحويل سطر جديد
            .replace(/•/g, '<span style="color:#0d6efd;">•</span>') // تلوين النقاط
            .trim();
    }

    createActionButtons(activity) {
        const details = activity.details || {};
        let html = '<div class="action-buttons" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">';
        
        const btnStyle = "padding:6px 12px; border:1px solid #0d6efd; background:white; color:#0d6efd; border-radius:15px; cursor:pointer; font-size:0.8rem; transition:0.2s;";
        
        // أزرار ذكية بناءً على البيانات المتوفرة
        if (details.req) {
            html += `<button style="${btnStyle}" onclick="window.assistantUI.sendMessage('التراخيص المطلوبة لـ ${activity.text}')">📄 التراخيص</button>`;
        }
        if (details.auth) {
            html += `<button style="${btnStyle}" onclick="window.assistantUI.sendMessage('الجهات المختصة بـ ${activity.text}')">🏛️ الجهات</button>`;
        }
        if (details.loc) {
            html += `<button style="${btnStyle}" onclick="window.assistantUI.sendMessage('الموقع المناسب لـ ${activity.text}')">📍 الموقع</button>`;
        }
        
        // زر عام للقرار 104
        html += `<button style="${btnStyle}" onclick="window.assistantUI.sendMessage('هل ${activity.text} في قرار 104؟')">⭐ فحص الحوافز</button>`;
        
        html += '</div>';
        return html;
    }
    
    createErrorCard(message) {
        return this.createCard('error', 'تنبيه', message, 0);
    }
}

// ==================== التصدير ====================
window.ResponseFormatter = ResponseFormatter;
console.log('✅ Response Formatter V2 جاهز');