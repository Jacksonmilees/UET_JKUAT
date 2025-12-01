const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || process.env.OTP_PORT || 5001;

app.use(bodyParser.json());
app.use(express.static('public'));

// Enable CORS for UET JKUAT frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

let browser = null;
let page = null;
let isReady = false;
let isInitializing = false;
let sessionStatus = 'disconnected';

// Store OTPs with expiration
const otpStore = new Map();

// Helper to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to create OTP message
function createOTPMessage(otp, customMessage = null) {
    if (customMessage) {
        return customMessage.replace('{otp}', otp);
    }
    return `*UET JKUAT Ministry*\n\nYour verification code is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.\n\n_This is an automated message from UET JKUAT Funding Platform._`;
}

// Clean up expired OTPs
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of otpStore.entries()) {
        if (now > data.expiresAt) {
            otpStore.delete(key);
        }
    }
}, 60000);

// Check WhatsApp login status
async function checkWhatsAppLogin() {
    if (!page) {
        sessionStatus = 'no_page';
        return false;
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const loginCheck = await page.evaluate(() => {
            const indicators = {
                chatList: !!document.querySelector('[data-testid="chat-list"]'),
                sidebar: !!document.querySelector('[data-testid="side"]'),
                searchInput: !!document.querySelector('[data-testid="search-input"]'),
                newChatBtn: !!document.querySelector('[data-testid="new-chat-btn"]'),
                menuBtn: !!document.querySelector('[data-testid="menu"]'),
                qrCode: !!document.querySelector('[data-testid="qrcode"]'),
                qrContainer: !!document.querySelector('canvas[aria-label*="QR"]'),
                hasLoginText: document.body.textContent.includes('To use WhatsApp on your computer'),
                hasChatText: document.body.textContent.includes('Search or start new chat'),
                interactiveCount: document.querySelectorAll('button, [role="button"], input, [contenteditable]').length
            };
            
            if (indicators.qrCode || (indicators.hasLoginText)) {
                return { loggedIn: false, reason: 'qr_code_detected' };
            }
            
            const strongIndicators = [
                indicators.chatList,
                indicators.sidebar, 
                indicators.newChatBtn,
                indicators.menuBtn,
                indicators.searchInput
            ].filter(Boolean).length;
            
            if (strongIndicators >= 2) {
                return { loggedIn: true, reason: 'strong_indicators', count: strongIndicators };
            }
            
            if (indicators.hasChatText && !indicators.hasLoginText) {
                return { loggedIn: true, reason: 'chat_interface_text' };
            }
            
            if (indicators.interactiveCount > 10 && !indicators.qrCode) {
                return { loggedIn: true, reason: 'interactive_elements', count: indicators.interactiveCount };
            }
            
            return { loggedIn: false, reason: 'insufficient_evidence' };
        });
        
        sessionStatus = loginCheck.loggedIn ? 'logged_in' : 'not_logged_in';
        
        if (loginCheck.loggedIn) {
            console.log(`✅ UET JKUAT WhatsApp LOGGED IN (${loginCheck.reason})`);
        } else {
            console.log(`❌ NOT LOGGED IN (${loginCheck.reason})`);
        }
        
        return loginCheck.loggedIn;
        
    } catch (error) {
        sessionStatus = 'error';
        console.log('❌ Error checking login:', error.message);
        return false;
    }
}

// Initialize WhatsApp
async function initializeWhatsApp() {
    if (isInitializing) {
        console.log('⏳ Already initializing...');
        return;
    }
    
    isInitializing = true;
    isReady = false;
    
    try {
        console.log('🚀 Starting UET JKUAT WhatsApp OTP Service...');
        
        const userDataDir = './whatsapp_uet_jkuat_session';
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        
        const launchOptions = {
            headless: "new", // Headless for Heroku
            userDataDir: userDataDir,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-gpu',
                '--no-first-run',
                '--disable-default-apps',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ],
            defaultViewport: null,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        };
        
        console.log('🔧 Launching Chrome for UET JKUAT...');
        browser = await puppeteer.launch(launchOptions);
        
        const pages = await browser.pages();
        page = pages[0] || await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('📱 Navigating to WhatsApp Web...');
        await page.goto('https://web.whatsapp.com/', { 
            waitUntil: 'domcontentloaded',
            timeout: 60000 
        });
        
        console.log('⏳ Checking login status...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        let isLoggedIn = await checkWhatsAppLogin();
        
        if (isLoggedIn) {
            console.log('🎉 Already logged in! UET JKUAT OTP service ready.');
            isReady = true;
            isInitializing = false;
            return;
        }
        
        console.log('📱 QR Code detected. Please scan with your phone...');
        console.log('💡 This will enable automated OTP sending for UET JKUAT');
        
        const maxChecks = 300;
        let checks = 0;
        
        const checkInterval = setInterval(async () => {
            checks++;
            
            try {
                isLoggedIn = await checkWhatsAppLogin();
                
                if (isLoggedIn) {
                    console.log('🎉 LOGIN SUCCESSFUL! UET JKUAT OTP service is now active.');
                    isReady = true;
                    isInitializing = false;
                    clearInterval(checkInterval);
                    return;
                }
                
                if (checks >= maxChecks) {
                    console.log('⏰ Login timeout.');
                    clearInterval(checkInterval);
                    isInitializing = false;
                }
                
                if (checks % 30 === 0) {
                    console.log(`⏳ Still waiting for QR scan... (${Math.floor(checks * 2 / 60)} min elapsed)`);
                }
                
            } catch (error) {
                console.log('❌ Login check error:', error.message);
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        isReady = false;
        isInitializing = false;
        sessionStatus = 'failed';
        
        if (browser) {
            try {
                await browser.close();
            } catch (e) {}
            browser = null;
            page = null;
        }
    }
}

// Send WhatsApp message
async function sendWhatsAppMessage(phoneNumber, message) {
    if (!isReady || !page) {
        throw new Error('WhatsApp automation not ready');
    }
    
    try {
        console.log(`🚀 Sending OTP to ${phoneNumber}...`);
        
        const sessionCheck = await checkWhatsAppLogin();
        if (!sessionCheck) {
            isReady = false;
            throw new Error('WhatsApp session lost');
        }
        
        const chatUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        await page.goto(chatUrl, { 
            waitUntil: 'networkidle0',
            timeout: 20000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        const hasError = await page.evaluate(() => {
            const bodyText = document.body.textContent || '';
            return bodyText.includes('Phone number shared via url is invalid');
        });
        
        if (hasError) {
            throw new Error('Invalid phone number');
        }
        
        const sendButton = await page.waitForSelector('[data-testid="compose-btn-send"], [data-icon="send"]', {
            timeout: 10000
        });
        
        if (sendButton) {
            await sendButton.click();
            console.log('✅ OTP sent successfully!');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        }
        
        throw new Error('Send button not found');
        
    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
        throw error;
    }
}

// API ENDPOINTS

// Send OTP
app.post('/send-otp', async (req, res) => {
    const { phone, email, customMessage } = req.body;
    
    const identifier = phone || email;
    
    if (!identifier) {
        return res.status(400).json({ 
            success: false, 
            message: 'Phone number or email is required',
            error: 'MISSING_IDENTIFIER'
        });
    }
    
    const otp = generateOTP();
    const message = createOTPMessage(otp, customMessage);
    
    // Store OTP
    otpStore.set(identifier, {
        otp: otp,
        expiresAt: Date.now() + (5 * 60 * 1000),
        attempts: 0
    });
    
    console.log(`📱 UET JKUAT OTP REQUEST for ${identifier}: ${otp}`);
    
    if (isReady && phone) {
        try {
            await sendWhatsAppMessage(phone, message);
            
            return res.json({ 
                success: true, 
                message: 'OTP sent via WhatsApp', 
                expiresIn: '5 minutes',
                mode: 'automated',
                provider: 'WhatsApp'
            });
            
        } catch (err) {
            console.error('❌ Automation failed:', err.message);
            
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send OTP',
                error: 'AUTOMATION_FAILED'
            });
        }
    } else {
        console.log('⚠️ Automation not ready');
        
        return res.json({ 
            success: true, 
            message: 'OTP generated (automation initializing)',
            otp: otp, // For testing - remove in production
            expiresIn: '5 minutes',
            mode: 'manual'
        });
    }
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
    const { phone, email, otp } = req.body;
    
    const identifier = phone || email;
    
    if (!identifier || !otp) {
        return res.status(400).json({ 
            success: false, 
            message: 'Identifier and OTP are required',
            error: 'MISSING_FIELDS'
        });
    }
    
    const storedData = otpStore.get(identifier);
    
    if (!storedData) {
        return res.status(404).json({ 
            success: false, 
            message: 'OTP not found or expired',
            error: 'OTP_NOT_FOUND'
        });
    }
    
    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(identifier);
        return res.status(400).json({ 
            success: false, 
            message: 'OTP has expired',
            error: 'OTP_EXPIRED'
        });
    }
    
    storedData.attempts++;
    
    if (storedData.attempts > 5) {
        otpStore.delete(identifier);
        return res.status(429).json({ 
            success: false, 
            message: 'Too many verification attempts',
            error: 'TOO_MANY_ATTEMPTS'
        });
    }
    
    if (storedData.otp === otp) {
        otpStore.delete(identifier);
        console.log(`✅ OTP VERIFIED for ${identifier}`);
        
        return res.json({ 
            success: true, 
            message: 'OTP verified successfully'
        });
    } else {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid OTP',
            error: 'INVALID_OTP',
            attemptsRemaining: 5 - storedData.attempts
        });
    }
});

// Status endpoint
app.get('/status', async (req, res) => {
    let currentStatus = sessionStatus;
    
    if (page && isReady) {
        try {
            const liveCheck = await checkWhatsAppLogin();
            currentStatus = liveCheck ? 'ready' : 'session_lost';
        } catch (e) {
            currentStatus = 'check_failed';
        }
    }
    
    res.json({
        service: 'UET JKUAT WhatsApp OTP',
        status: 'running',
        automation: {
            isReady: isReady,
            isInitializing: isInitializing,
            sessionStatus: currentStatus
        },
        activeOTPs: otpStore.size,
        uptime: Math.floor(process.uptime())
    });
});

// Restart automation
app.post('/restart', async (req, res) => {
    console.log('🔄 Restarting UET JKUAT OTP service...');
    
    isReady = false;
    
    if (browser) {
        try {
            await browser.close();
        } catch (e) {}
        browser = null;
        page = null;
    }
    
    setTimeout(() => initializeWhatsApp(), 1000);
    
    res.json({ 
        success: true, 
        message: 'OTP service restarting...'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'UET JKUAT OTP',
        ready: isReady
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 UET JKUAT WhatsApp OTP Service running on port ${PORT}`);
    console.log(`📱 Status: http://localhost:${PORT}/status`);
    console.log(`💊 Health: http://localhost:${PORT}/health`);
    initializeWhatsApp();
});
