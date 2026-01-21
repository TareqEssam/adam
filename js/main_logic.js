/**
 * 🧠 Main Logic V2 - المحرك الموحد الذكي
 * يعالج البحث في جميع الشاشات مع نظام طوارئ عند فشل المحرك الذكي
 */

// تهيئة الكائنات العالمية
window.licenseDB = window.licenseDB || {};
window.productionStagesDB = window.productionStagesDB || {};
window.technicalNotesDB = window.technicalNotesDB || {};
window.licenseFieldsDB = window.licenseFieldsDB || {};

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 جاري تهيئة النظام الشامل...");

    // 1. بناء جسور البيانات
    if (typeof masterActivityDB !== 'undefined') {
        masterActivityDB.forEach(act => {
            window.licenseDB[act.value] = act.details;
            window.productionStagesDB[act.value] = act.productionStages;
            window.technicalNotesDB[act.value] = act.technicalNotes;
            window.licenseFieldsDB[act.value] = act.dynamicLicenseFields;
        });
        
        // ملء القائمة المنسدلة للنشاط
        populateActivitySelect(masterActivityDB);
    }

    // 2. تشغيل أنظمة البحث لجميع الشاشات
    initializeAllSearchSystems();

    // 3. تهيئة التجهيزات (الشاشة 7)
    if (typeof initSiteDescriptionSystem === 'function') {
        initSiteDescriptionSystem();
    }
});

/**
 * ⚙️ دالة لتهيئة جميع أنظمة البحث في المشروع
 */
function initializeAllSearchSystems() {
    // 1. بحث الأنشطة والتراخيص (الشاشة 4)
    setupSmartSearch({
        inputId: 'activityTypeSearch',
        resultsId: 'activityTypeSearchResults',
        onSelect: (item) => selectActivityForForm(item.value, item.text),
        dbSource: typeof masterActivityDB !== 'undefined' ? masterActivityDB : [],
        searchType: 'activity'
    });

    // 2. بحث القرار 104 (الشاشة 6)
    setupSmartSearch({
        inputId: 'activitySearch', // تأكد من وجود هذا الـ ID في HTML الشاشة 6
        resultsId: 'searchResults',
        onSelect: (item) => {
            // منطق عرض تفاصيل القرار 104
            if (window.finalAssistantV13) {
                // محاكاة استجابة المساعد لعرض التفاصيل
                const mockResults = { decision104: [{ score: 1, metadata: { text_preview: item.text, metadata: item } }] };
                window.finalAssistantV13.handleDecision104Check(item.text, mockResults).then(response => {
                    const formatter = new ResponseFormatter();
                    const html = formatter.formatResponse(response);
                    document.getElementById('activityDetails').innerHTML = html;
                    document.getElementById('activityDetails').style.display = 'block';
                });
            }
        },
        dbSource: typeof decision104DB !== 'undefined' ? flattenDecisionDB(decision104DB) : [],
        searchType: 'decision104'
    });

    // 3. بحث المناطق الصناعية (في المودال أو الشاشة)
    // إذا كان هناك حقل بحث للمناطق
    const indSearch = document.querySelector('.industrial-search-input');
    if (indSearch) {
        indSearch.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            // هنا نستخدم بحث نصي بسيط لأن الجدول موجود بالفعل
            filterIndustrialTable(query);
        });
    }
}

/**
 * 🛠️ إعداد حقل بحث ذكي (Generic Search Handler)
 * يعمل مع المحرك الذكي، وإذا فشل يعود للبحث النصي التقليدي
 */
function setupSmartSearch({ inputId, resultsId, onSelect, dbSource, searchType }) {
    const searchInput = document.getElementById(inputId);
    const resultsContainer = document.getElementById(resultsId);

    if (!searchInput || !resultsContainer) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(async () => {
            let results = [];
            
            // محاولة استخدام المحرك الذكي أولاً
            if (window.vEngine && window.vEngine.isReady) {
                try {
                    const vectorResults = await window.vEngine.search(query, 10);
                    // استخراج النتائج حسب النوع
                    if (searchType === 'activity') results = vectorResults.activities || [];
                    else if (searchType === 'decision104') results = vectorResults.decision104 || [];
                    else if (searchType === 'industrial') results = vectorResults.industrial || [];
                    
                    // تحويل هيكل النتائج ليتوافق مع العرض
                    results = results.map(r => ({
                        value: r.id,
                        text: r.metadata?.metadata?.text || r.metadata?.text_preview || 'بدون اسم',
                        score: r.score
                    }));
                } catch (err) {
                    console.warn("⚠️ فشل البحث الذكي، جاري الانتقال للبحث المحلي", err);
                    results = localFallbackSearch(query, dbSource);
                }
            } else {
                // ⚠️ نظام الطوارئ: البحث المحلي البسيط (بسبب خطأ CORS أو عدم التحميل)
                results = localFallbackSearch(query, dbSource);
            }

            renderDropdownResults(results, query, resultsContainer, searchInput, onSelect);
        }, 150);
    });

    // إخفاء النتائج عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

/**
 * 🔍 بحث محلي بسيط (Fallback)
 */
function localFallbackSearch(query, database) {
    if (!database) return [];
    
    const lowerQuery = query.toLowerCase();
    return database
        .filter(item => {
            const text = (item.text || item.name || '').toLowerCase();
            return text.includes(lowerQuery);
        })
        .slice(0, 10)
        .map(item => ({
            value: item.value || item.id,
            text: item.text || item.name,
            score: 1.0 // درجة وهمية
        }));
}

/**
 * 🎨 عرض النتائج في القائمة
 */
function renderDropdownResults(results, query, container, input, onSelectCallback) {
    if (!results || results.length === 0) {
        container.style.display = 'none';
        return;
    }

    let html = '';
    results.forEach(item => {
        // تمييز النص
        const text = item.text;
        const highlightedText = text.replace(new RegExp(`(${query})`, 'gi'), '<span style="background:#fff3cd;">$1</span>');
        
        html += `
            <div class="search-result-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">
                <div class="d-flex justify-content-between align-items-center">
                    <span style="font-weight:500; font-size:0.9rem;">${highlightedText}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.style.display = 'block';

    // إضافة مستمعي النقر
    const items = container.querySelectorAll('.search-result-item');
    items.forEach((div, index) => {
        div.addEventListener('click', () => {
            input.value = results[index].text;
            container.style.display = 'none';
            if (onSelectCallback) onSelectCallback(results[index]);
        });
    });
}

/**
 * ✅ دالة مساعدة لتسطيح قاعدة بيانات القرار 104 للبحث
 */
function flattenDecisionDB(db) {
    let flat = [];
    // دمج القطاع أ و ب
    const sectors = [db.sectorA, db.sectorB];
    sectors.forEach(sector => {
        if (!sector) return;
        Object.keys(sector).forEach(category => {
            if (Array.isArray(sector[category])) {
                sector[category].forEach(activity => {
                    flat.push({ text: activity, value: activity, category: category });
                });
            }
        });
    });
    return flat;
}

/**
 * 📋 دالة اختيار النشاط وتعبئة الاستمارة (للشاشة 4)
 */
function selectActivityForForm(value, text) {
    const selectElement = document.getElementById('activityTypeSelect');
    if (!selectElement) return;

    // تحديث القائمة المنسدلة
    let optionFound = false;
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === value) {
            selectElement.selectedIndex = i;
            optionFound = true;
            break;
        }
    }

    if (!optionFound) {
        const newOption = new Option(text, value);
        selectElement.add(newOption);
        selectElement.value = value;
    }

    // تشغيل التحديثات
    updateLicenseRequirements();
}

// دالة مساعدة لملء القائمة المنسدلة
function populateActivitySelect(database) {
    const selectElement = document.getElementById('activityTypeSelect');
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">-- اختر النشاط --</option>';
    database.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.value;
        option.text = activity.text;
        selectElement.appendChild(option);
    });
}

// دالة تحديث التراخيص (موجودة سابقاً ولكن تأكد من وجودها)
function updateLicenseRequirements() {
    const select = document.getElementById('activityTypeSelect');
    const selectedValue = select.value;
    if (!selectedValue) return;

    const activity = typeof masterActivityDB !== 'undefined' 
        ? masterActivityDB.find(item => item.value === selectedValue)
        : null;

    if (activity) {
        if(document.getElementById('actLicense')) document.getElementById('actLicense').innerText = activity.text;
        if(document.getElementById('reqLicense')) document.getElementById('reqLicense').innerText = activity.details?.req || 'غير متوفر';
        if(document.getElementById('authLicense')) document.getElementById('authLicense').innerText = activity.details?.auth || 'غير متوفر';
        if(document.getElementById('reqLocation')) document.getElementById('reqLocation').innerText = activity.details?.loc || 'غير متوفر';
        if(document.getElementById('legalBasis')) document.getElementById('legalBasis').innerText = activity.details?.leg || 'غير متوفر';
        
        // زر الدليل
        const guideLinkArea = document.getElementById('guideLinkArea');
        if (guideLinkArea) {
            if (activity.details?.link) {
                 const linkURL = activity.details.link;
                 const googleViewerURL = `https://docs.google.com/viewer?url=${encodeURIComponent(linkURL)}&embedded=true`;
                 guideLinkArea.innerHTML = `
                    <a href="${googleViewerURL}" target="_blank" class="btn btn-sm btn-info ml-2"><i class="fa fa-eye"></i> عرض</a>
                    <a href="${linkURL}" download class="btn btn-sm btn-success"><i class="fa fa-download"></i> تحميل</a>`;
            } else {
                guideLinkArea.innerHTML = '';
            }
        }

        if(document.getElementById('guideNameDisplay')) document.getElementById('guideNameDisplay').innerText = activity.details?.guid || 'غير متوفر';
        if(document.getElementById('licenseResultArea')) document.getElementById('licenseResultArea').style.display = 'block';

        const techNotesArea = document.getElementById('technicalNotesTextarea');
        if (techNotesArea) techNotesArea.value = activity.technicalNotes || '';

        if (typeof loadDynamicLicenseFields === 'function') loadDynamicLicenseFields(selectedValue);
        if (typeof updateSpecializedFacilityVisibility === 'function') updateSpecializedFacilityVisibility(selectedValue);
        if (typeof initProductionFlow === 'function') initProductionFlow(selectedValue);
        if (typeof updateActivityTypeBadge === 'function') updateActivityTypeBadge(selectedValue);
    }
}