
/****************************************************************************
 * 🎨 Assistant UI - الواجهة التفاعلية الكاملة
 * متوافق مع Smart Assistant V13
 ****************************************************************************/

class AssistantUI {
    constructor() {
        // المكونات الأساسية
        this.voice = null;
        this.formatter = null;
        
        // عناصر DOM
        this.elements = {};
        
        // الحالة
        this.isOpen = false;
        this.isMinimized = false;
        this.currentMode = 'text'; // 'text' | 'voice'
        
        // إعدادات
        this.settings = {
            autoScroll: true,
            soundEffects: true
        };
        
        this.initialize();
    }
    
    // ==================== التهيئة ====================
    async initialize() {
        try {
            // إنشاء عناصر الواجهة
            this.createUI();
            
            // تهيئة المكونات المساعدة
            // ملاحظة: المساعد الذكي V13 يتم تحميله عالمياً في window.finalAssistantV13
            this.formatter = new ResponseFormatter();
            
            if (window.VoiceHandler) {
                this.voice = new VoiceHandler(
                    (transcript, confidence) => this.handleVoiceResult(transcript, confidence),
                    (error) => this.handleVoiceError(error)
                );
            }
            
            // ربط الأحداث
            this.bindEvents();
            
            // رسالة ترحيب
            this.showWelcomeMessage();
            
            console.log('✅ واجهة المساعد UI جاهزة ومرتبطة بـ V13');
            
        } catch (error) {
            console.error('❌ فشل تهيئة الواجهة:', error);
        }
    }
    
    // ==================== إنشاء عناصر الواجهة ====================
    createUI() {
        // الأيقونة العائمة
        const fab = document.createElement('div');
        fab.id = 'assistant-fab';
        fab.className = 'assistant-fab';
        fab.innerHTML = `
            <div class="fab-icon">
                <i class="fas fa-robot"></i>
            </div>
            <div class="fab-pulse"></div>
        `;
        document.body.appendChild(fab);
        this.elements.fab = fab;
        
        // نافذة المحادثة
        const chatWindow = document.createElement('div');
        chatWindow.id = 'assistant-window';
        chatWindow.className = 'assistant-window';
        chatWindow.innerHTML = this.createWindowHTML();
        document.body.appendChild(chatWindow);
        this.elements.window = chatWindow;
        
        // تخزين المراجع
        this.elements.header = chatWindow.querySelector('.chat-header');
        this.elements.messagesContainer = chatWindow.querySelector('.messages-container');
        this.elements.inputArea = chatWindow.querySelector('.input-area');
        this.elements.textInput = chatWindow.querySelector('#chat-input');
        this.elements.sendBtn = chatWindow.querySelector('#send-btn');
        this.elements.voiceBtn = chatWindow.querySelector('#voice-btn');
        this.elements.closeBtn = chatWindow.querySelector('#close-btn');
        this.elements.minimizeBtn = chatWindow.querySelector('#minimize-btn');
        this.elements.muteBtn = chatWindow.querySelector('#mute-btn');
        this.elements.statusBar = chatWindow.querySelector('.status-bar');
        this.elements.thinkingIndicator = chatWindow.querySelector('.thinking-indicator');
    }
    
    // ==================== HTML نافذة المحادثة ====================
    createWindowHTML() {
        return `
            <div class="chat-header">
                <div class="header-left">
                    <div class="assistant-avatar"><i class="fas fa-user-astronaut"></i></div>
                    <div class="header-info">
                        <div class="assistant-name">المساعد الذكي</div>
                        <div class="assistant-status">متصل (V13)</div>
                    </div>
                </div>
                <div class="header-right">
                    <button id="mute-btn" class="header-btn" title="كتم الصوت">
                        <span class="btn-icon"><i class="fas fa-volume-up"></i></span>
                    </button>
                    <button id="minimize-btn" class="header-btn" title="تصغير">
                        <span class="btn-icon"><i class="fas fa-minus"></i></span>
                    </button>
                    <button id="close-btn" class="header-btn" title="إغلاق">
                        <span class="btn-icon"><i class="fas fa-times"></i></span>
                    </button>
                </div>
            </div>
            
            <div class="status-bar">
                <div class="status-text">جاهز للمساعدة</div>
                <div class="status-indicator online"></div>
            </div>
            
            <div class="messages-container" id="messages">
                <!-- الرسائل تُضاف هنا ديناميكياً -->
            </div>
            
            <div class="thinking-indicator" style="display: none;">
                <div class="thinking-dots">
                    <span></span><span></span><span></span>
                </div>
                <span>جاري البحث والتحليل...</span>
            </div>
            
            <div class="input-area">
                <div class="input-container">
                    <input 
                        type="text" 
                        id="chat-input" 
                        placeholder="اكتب سؤالك هنا... أو اضغط المايك"
                        autocomplete="off"
                    />
                    <button id="voice-btn" class="icon-btn" title="التحدث">
                        <span class="btn-icon"><i class="fas fa-microphone"></i></span>
                    </button>
                    <button id="send-btn" class="icon-btn send-btn" title="إرسال">
                        <span class="btn-icon"><i class="fas fa-paper-plane"></i></span>
                    </button>
                </div>
                <div class="voice-feedback" style="display: none;">
                    <div class="voice-wave">
                        <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <span class="voice-text">جاري الاستماع...</span>
                </div>
            </div>
        `;
    }
    
    // ==================== ربط الأحداث ====================
    bindEvents() {
        this.elements.fab.addEventListener('click', () => this.toggleWindow());
        this.elements.closeBtn.addEventListener('click', () => this.closeWindow());
        this.elements.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
        
        this.elements.sendBtn.addEventListener('click', () => this.sendTextMessage());
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendTextMessage();
            }
        });
        
        if (this.voice) {
            this.elements.voiceBtn.addEventListener('click', () => this.toggleVoiceMode());
            this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
            
            this.voice.on('listeningStart', () => this.onListeningStart());
            this.voice.on('listeningEnd', () => this.onListeningEnd());
            this.voice.on('speakingStart', () => this.onSpeakingStart());
            this.voice.on('speakingEnd', () => this.onSpeakingEnd());
            this.voice.on('interimResult', (data) => this.onInterimResult(data));
        } else {
            this.elements.voiceBtn.style.display = 'none';
            this.elements.muteBtn.style.display = 'none';
        }
        
        this.makeDraggable();
    }
    
    // ==================== التحكم بالنافذة ====================
    toggleWindow() {
        if (this.isOpen) this.closeWindow();
        else this.openWindow();
    }
    
    openWindow() {
        this.elements.window.classList.add('open');
        this.elements.fab.classList.add('hidden');
        this.isOpen = true;
        this.isMinimized = false;
        setTimeout(() => this.elements.textInput.focus(), 300);
    }
    
    closeWindow() {
        this.elements.window.classList.remove('open');
        this.elements.fab.classList.remove('hidden');
        this.isOpen = false;
        if (this.voice && this.voice.isListening) this.voice.stopListening();
        if (this.voice && this.voice.isSpeaking) this.voice.stopSpeaking();
    }
    
    minimizeWindow() {
        this.isMinimized = !this.isMinimized;
        this.elements.window.classList.toggle('minimized', this.isMinimized);
    }
    
    // ==================== إرسال الرسائل ====================
    async sendTextMessage() {
        const text = this.elements.textInput.value.trim();
        if (!text) return;
        
        this.addMessage('user', text);
        this.elements.textInput.value = '';
        await this.processQuery(text);
    }
    
    // ==================== 🧠 المعالجة الأساسية (Core Logic) ====================
    async processQuery(query) {
        this.showThinking(true);
        
        try {
            let response;
            
            // 🔥 الاتصال بالمساعد الذكي الجديد V13
            if (window.finalAssistantV13) {
                console.log("🤖 إرسال إلى V13:", query);
                response = await window.finalAssistantV13.query(query);
            } else {
                // حالة الطوارئ (إذا لم يحمل الملف بعد)
                console.warn("⚠️ المساعد V13 غير جاهز");
                response = { type: 'error', text: 'المساعد الذكي قيد التحميل، يرجى الانتظار لحظة...' };
            }
            
            this.showThinking(false);
            
            // أوامر خاصة
            if (response.type === 'command' && response.action === 'close') {
                if (this.voice) {
                    this.voice.speak(response.text, () => setTimeout(() => this.closeWindow(), 1000));
                } else {
                    setTimeout(() => this.closeWindow(), 1000);
                }
                return;
            }
            
            // تنسيق وعرض الرد
            const formattedHTML = this.formatter.formatResponse(response);
            this.addMessage('assistant', formattedHTML, true);
            
            // القراءة الصوتية
            if (this.currentMode === 'voice' && response.text && this.voice) {
                const speechText = this.extractSpeechText(response);
                this.voice.speak(speechText);
            }
            
        } catch (error) {
            console.error('❌ خطأ في معالجة السؤال:', error);
            this.showThinking(false);
            const errorHTML = this.formatter.createErrorCard('عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.');
            this.addMessage('assistant', errorHTML, true);
        }
    }
    
    // ==================== استخراج النص للنطق ====================
    extractSpeechText(response) {
        // تنظيف النص من الرموز والماركداون للقراءة الصوتية
        let text = response.text || '';
        
        // إزالة الرموز مثل ** و #
        text = text.replace(/[*#_]/g, '');
        
        // تحسينات خاصة حسب النوع
        if (response.type === 'activity_full') {
            return `وجدت معلومات عن ${response.activity?.text || 'النشاط'}. يمكنك قراءة التفاصيل على الشاشة.`;
        }
        
        if (response.type === 'decision104_match') {
            return `نعم، هذا النشاط مشمول في قرار 104. التفاصيل معروضة أمامك.`;
        }
        
        // تقصير النص الطويل جداً
        if (text.length > 200) {
            return text.substring(0, 200) + "... وهناك المزيد من التفاصيل.";
        }
        
        return text;
    }
    
    // ==================== إدارة الرسائل ====================
    addMessage(sender, content, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        if (isHTML) {
            bubble.innerHTML = content;
        } else {
            bubble.textContent = content;
        }
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        bubble.appendChild(time);
        messageDiv.appendChild(bubble);
        
        this.elements.messagesContainer.appendChild(messageDiv);
        
        if (this.settings.autoScroll) {
            this.scrollToBottom();
        }
    }
    
    showWelcomeMessage() {
        const welcomeHTML = `
            <div class="welcome-card">
                <div class="welcome-icon">👋</div>
                <div class="welcome-title">أهلاً بك!</div>
                <div class="welcome-text">
                    أنا مساعدك الذكي المطور (V13).
                </div>
                <div class="welcome-features">
                    <div class="feature-item">✓ تفاصيل الأنشطة والتراخيص</div>
                    <div class="feature-item">✓ المناطق الصناعية</div>
                    <div class="feature-item">✓ حوافز قرار 104</div>
                </div>
                <div class="welcome-actions">
                    <button onclick="window.assistantUI.sendMessage('ما هي أنشطة القطاع أ؟')">
                        💡 أنشطة القطاع (أ)
                    </button>
                </div>
            </div>
        `;
        this.addMessage('assistant', welcomeHTML, true);
    }
    
    // ==================== دوال الصوت ====================
    toggleVoiceMode() {
        if (!this.voice) return;
        if (this.voice.isListening) {
            this.voice.stopListening();
            this.currentMode = 'text';
        } else {
            this.voice.startListening();
            this.currentMode = 'voice';
        }
    }
    
    handleVoiceResult(transcript, confidence) {
        this.addMessage('user', transcript);
        this.processQuery(transcript);
    }
    
    handleVoiceError(error) {
        this.updateStatus('خطأ في الصوت', 'error');
        setTimeout(() => this.updateStatus('متصل', 'online'), 3000);
    }
    
    onListeningStart() {
        this.elements.voiceBtn.classList.add('listening');
        this.elements.inputArea.querySelector('.voice-feedback').style.display = 'flex';
        this.updateStatus('جاري الاستماع...', 'listening');
    }
    
    onListeningEnd() {
        this.elements.voiceBtn.classList.remove('listening');
        this.elements.inputArea.querySelector('.voice-feedback').style.display = 'none';
        this.updateStatus('متصل', 'online');
    }
    
    onSpeakingStart() {
        this.updateStatus('جاري التحدث...', 'speaking');
    }
    
    onSpeakingEnd() {
        this.updateStatus('متصل', 'online');
    }
    
    onInterimResult(data) {
        const feedbackEl = this.elements.inputArea.querySelector('.voice-text');
        if (feedbackEl) feedbackEl.textContent = data.transcript || 'جاري الاستماع...';
    }
    
    toggleMute() {
        if (!this.voice) return;
        const isMuted = this.voice.toggleMute();
        this.elements.muteBtn.querySelector('.btn-icon').innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        this.elements.muteBtn.title = isMuted ? 'تشغيل الصوت' : 'كتم الصوت';
    }
    
    // ==================== أدوات مساعدة ====================
    showThinking(show) {
        this.elements.thinkingIndicator.style.display = show ? 'flex' : 'none';
        if (show) this.scrollToBottom();
    }
    
    updateStatus(text, type = 'online') {
        const statusEl = this.elements.statusBar.querySelector('.status-text');
        const indicatorEl = this.elements.statusBar.querySelector('.status-indicator');
        statusEl.textContent = text;
        indicatorEl.className = `status-indicator ${type}`;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }
    
    makeDraggable() {
        let isDragging = false;
        let initialX, initialY;
        
        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            // دعم اللمس والماوس
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const currentX = clientX - initialX;
            const currentY = clientY - initialY;
            
            this.elements.window.style.left = `${currentX}px`;
            this.elements.window.style.top = `${currentY}px`;
            this.elements.window.style.right = 'auto';
            this.elements.window.style.bottom = 'auto';
        };
        
        const startDrag = (e) => {
            if (e.target.closest('button')) return;
            
            // دعم اللمس
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            isDragging = true;
            initialX = clientX - this.elements.window.offsetLeft;
            initialY = clientY - this.elements.window.offsetTop;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        };
        
        const stopDrag = () => {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        };
        
        this.elements.header.addEventListener('mousedown', startDrag);
        this.elements.header.addEventListener('touchstart', startDrag, { passive: false });
    }
    
    // ==================== واجهة عامة ====================
    sendMessage(text) {
        if (!this.isOpen) this.openWindow();
        setTimeout(() => {
            this.elements.textInput.value = text;
            this.sendTextMessage();
        }, 100);
    }
    
    selectActivity(activityText) {
        this.sendMessage(activityText);
    }
    
    // ==================== دالة اختيار بديل محدد (معدلة) ====================
    async selectOption(id, type, text) {
        // تنظيف النص للعرض
        const displayText = text.length > 50 ? text.substring(0, 50) + "..." : text;
        this.addMessage('user', displayText);
        
        this.showThinking(true);
        
        try {
            let response;
            if (window.finalAssistantV13) {
                // 🔥 التعديل هنا: نرسل 'text' كمعامل ثالث للبحث عنه إذا فشل الـ ID
                response = await window.finalAssistantV13.showDetails(id, type, text);
            } else {
                response = { type: 'error', text: 'المساعد غير جاهز' };
            }

            this.showThinking(false);
            
            const formattedHTML = this.formatter.formatResponse(response);
            this.addMessage('assistant', formattedHTML, true);
            
            if (this.currentMode === 'voice') {
                this.voice.speak("إليك التفاصيل المطلوبة");
            }

        } catch (error) {
            console.error('❌ خطأ في اختيار البديل:', error);
            this.showThinking(false);
            this.addMessage('assistant', this.formatter.createErrorCard('تعذر جلب التفاصيل'), true);
        }
    }

// ==================== تهيئة عند التحميل ====================
document.addEventListener('DOMContentLoaded', () => {
    window.assistantUI = new AssistantUI();
});

