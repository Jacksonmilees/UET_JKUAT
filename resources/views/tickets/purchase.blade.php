<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- SEO Meta Tags -->
    <title>Support MOUT JKUAT Ministry Equipment Fundraiser - Win Amazing Gifts!</title>
    <meta name="description" content="Join MOUT JKUAT Ministry's equipment fundraiser. Buy a KES 50 ticket for a chance to win amazing gifts while supporting our outreach mission.">
    <meta name="keywords" content="MOUT JKUAT Ministry, equipment fundraiser, support ministry, win gifts, Kenya charity">
    <meta name="robots" content="index, follow">

    <!-- OpenGraph Meta Tags -->
    <meta property="og:title" content="Support MOUT JKUAT Ministry Equipment Fundraiser - Win Amazing Gifts!">
    <meta property="og:description" content="Join our equipment fundraiser. Buy a KES 50 ticket for a chance to win amazing gifts while supporting our ministry's mission.">
    <meta property="og:image" content="https://res.cloudinary.com/djxav0anz/image/upload/c_scale,w_1200,f_auto,q_auto/v1739796117/soundproject_dlfare.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ request()->fullUrl() }}">

    <!-- Icons -->
    <link rel="icon" href="https://res.cloudinary.com/djxav0anz/image/upload/c_scale,w_64,f_auto/v1739796117/soundproject_dlfare.jpg">
    <link rel="apple-touch-icon" href="https://res.cloudinary.com/djxav0anz/image/upload/c_scale,w_180,f_auto/v1739796117/soundproject_dlfare.jpg">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            50: '#ecfdf5',
                            100: '#d1fae5',
                            200: '#a7f3d0',
                            300: '#6ee7b7',
                            400: '#34d399',
                            500: '#10b981',
                            600: '#059669',
                            700: '#047857',
                            800: '#065f46',
                            900: '#064e3b',
                        }
                    },
                    animation: {
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                        'fade-in': 'fadeIn 1s ease-out forwards',
                        'slide-in': 'slideIn 0.7s ease-out forwards',
                        'float': 'float 6s ease-in-out infinite',
                        'shimmer': 'shimmer 2.5s infinite',
                    },
                    keyframes: {
                        fadeInUp: {
                            '0%': { opacity: '0', transform: 'translateY(20px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' }
                        },
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' }
                        },
                        slideIn: {
                            '0%': { transform: 'translateX(-30px)', opacity: '0' },
                            '100%': { transform: 'translateX(0)', opacity: '1' }
                        },
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-10px)' }
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '-200% 0' },
                            '100%': { backgroundPosition: '200% 0' }
                        }
                    }
                }
            },
            variants: {
                extend: {
                    transform: ['hover', 'focus', 'group-hover'],
                    scale: ['hover', 'focus', 'group-hover'],
                }
            }
        }
    </script>

    <!-- Custom Styles -->
    <style>
        /* Modern Form Styling */
        .form-group {
            @apply relative mb-6;
        }

        .form-group input {
            @apply w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        .form-group label {
            @apply absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 pointer-events-none bg-white px-2 font-medium;
        }

        .form-group input:focus + label,
        .form-group input:not(:placeholder-shown) + label {
            @apply top-0 text-xs text-primary-600 -translate-y-1/2 scale-95 bg-white font-semibold;
        }

        .input-icon {
            @apply absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 transition-colors duration-200;
        }

        .form-group input:focus ~ .input-icon {
            @apply text-primary-600;
        }

        /* Loading Spinner */
        .loading-spinner {
            @apply animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full;
        }

        /* Gift Reveal Animation */
        .gift-box {
            perspective: 1000px;
            transform-style: preserve-3d;
        }

        .gift-lid {
            transform-origin: center top;
            transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .gift-box.open .gift-lid {
            transform: rotateX(-110deg);
        }

        .gift-content {
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.6s ease-out 0.3s;
        }

        .gift-box.open .gift-content {
            transform: translateY(0);
            opacity: 1;
        }

        /* Shimmer Effect */
        .btn-shimmer {
            background: linear-gradient(90deg, 
                rgba(5, 150, 105, 0.8) 0%, 
                rgba(16, 185, 129, 0.95) 25%, 
                rgba(5, 150, 105, 0.8) 50%, 
                rgba(16, 185, 129, 0.95) 75%, 
                rgba(5, 150, 105, 0.8) 100%);
            background-size: 200% 100%;
            animation: shimmer 2.5s infinite;
        }

        /* Confetti Animation */
        @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }

        /* Scroll Progress Indicator */
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(to right, #10b981, #34d399);
            z-index: 100;
            transition: width 0.2s ease;
        }

        /* Card Hover Effects */
        .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(16, 185, 129, 0.6);
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(5, 150, 105, 0.8);
        }

        /* Toast Notification Styles */
        .toast-container {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 1000;
            max-width: 20rem;
        }

        .toast {
            background: white;
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            margin-bottom: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transform: translateX(100%);
            animation: slideIn 0.3s ease-out forwards;
            border-left: 4px solid;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .toast.success {
            border-color: #10b981;
        }

        .toast.error {
            border-color: #ef4444;
        }

        .toast .toast-icon {
            flex-shrink: 0;
        }

        .toast .toast-message {
            color: #1f2937;
            font-weight: 500;
            line-height: 1.4;
        }

        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-50 via-green-50 to-primary-50 min-h-screen font-sans">
    <!-- Scroll Progress Indicator -->
    <div class="scroll-progress"></div>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Fixed Ticket Information -->
    <div class="fixed bottom-4 right-4 z-50 opacity-0 animate-fade-in" style="animation-delay: 1.5s;">
        <div class="bg-white rounded-full shadow-xl py-3 px-6 flex items-center space-x-3 border-2 border-primary-300">
            <div class="bg-primary-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            <span class="font-bold text-primary-700">Ticket: KES 50</span>
        </div>
    </div>

    <div class="relative">
        <!-- Hero Section -->
        <section class="py-16 px-4 sm:py-20 sm:px-6 lg:px-8 opacity-0 animate-fade-in" style="animation-duration: 1s;">
            <div class="max-w-5xl mx-auto text-center">
                <div class="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full font-medium mb-8 opacity-0 animate-fade-in" style="animation-delay: 0.3s; animation-duration: 0.8s;">
                    <span class="animate-pulse mr-2">🎵</span> Sound Equipment Fundraiser
                </div>
                
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 opacity-0 animate-fade-in" style="animation-delay: 0.5s; animation-duration: 0.8s;">
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500">
                        Support MOUT JKUAT Ministry
                    </span>
                </h1>
                
                <p class="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto opacity-0 animate-fade-in" style="animation-delay: 0.7s; animation-duration: 0.8s;">
                    Join our equipment fundraiser to expand our ministry's outreach. Buy a ticket for KES 50 and win exciting gifts!
                </p>

                <div class="inline-flex items-center btn-shimmer text-white px-8 py-4 rounded-full font-bold mb-12 shadow-lg cursor-pointer transform transition hover:scale-105 opacity-0 animate-fade-in" style="animation-delay: 0.9s; animation-duration: 0.8s;">
                    <a href="#purchase" class="flex items-center">
                        Ticket: KES 50
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </a>
                </div>

                <div class="relative rounded-2xl overflow-hidden shadow-2xl mb-14 mx-auto max-w-3xl opacity-0 animate-fade-in" style="animation-delay: 1.1s; animation-duration: 0.8s;">
                    <img src="https://res.cloudinary.com/djxav0anz/image/upload/c_scale,w_1200,f_auto,q_auto/v1739796117/soundproject_dlfare.jpg" alt="MOUT JKUAT Ministry Equipment Fundraiser" class="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div class="absolute bottom-6 left-0 right-0 text-center">
                        <span class="inline-flex items-center bg-white/90 backdrop-blur-sm text-primary-700 px-4 py-2 rounded-full font-medium shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Win Amazing Prizes!
                        </span>
                    </div>
                </div>

                <!-- Gift Box Section -->
                <div class="bg-white/95 rounded-2xl p-6 shadow-xl mb-14 mx-auto max-w-2xl card-hover">
                    <h2 class="text-2xl font-bold text-primary-700 mb-4 flex items-center justify-center">
                        <span class="animate-pulse mr-2">🎁</span> Win Amazing Gifts!
                    </h2>
                    <p class="text-gray-700 mb-6">Purchase a ticket and get a chance to win!</p>
                    
                    <div class="gift-box mx-auto w-56 relative mb-8">
                        <div class="gift-lid absolute -top-6 left-0 right-0 h-10 bg-primary-500 rounded-lg z-20 shadow-lg"></div>
                        <div class="gift-base relative z-10 bg-primary-600 h-36 rounded-lg p-4 shadow-lg overflow-hidden">
                            <div class="absolute left-0 right-0 top-0 h-2 bg-primary-500"></div>
                            <div class="gift-ribbon absolute top-0 bottom-0 left-1/2 w-3 bg-primary-400 -translate-x-1/2"></div>
                            <div class="gift-ribbon absolute left-0 right-0 top-1/2 h-3 bg-primary-400 -translate-y-1/2"></div>
                            <div class="gift-content text-center text-white pt-10">
                                <p class="font-bold">Special Surprise!</p>
                                <p class="text-sm text-primary-100 mt-1">Click to Reveal</p>
                            </div>
                        </div>
                    </div>
                    
                    <button id="revealGiftBtn" class="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
                        Reveal Gifts
                    </button>
                </div>
            </div>
        </section>

        <!-- Mission Statement Section -->
        <section class="relative py-12 px-4 sm:px-6 lg:px-8 mb-16 opacity-0 animate-fade-in" style="animation-delay: 1.3s; animation-duration: 0.8s;">
            <div class="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <div class="grid md:grid-cols-2 gap-8 items-center">
                    <div class="relative">
                        <div class="absolute -top-4 -left-4 w-16 h-16 bg-primary-100 rounded-full animate-pulse-slow"></div>
                        <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-100 rounded-full animate-pulse-slow" style="animation-delay: 1s;"></div>
                        <div class="relative bg-primary-600 rounded-xl p-6 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <h3 class="text-xl font-bold mb-2">Our Mission</h3>
                            <p class="mb-4">To reach out to our community through music, worship, and sound ministry, spreading hope and faith.</p>
                        </div>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-primary-800 mb-4">Why We Need Your Support</h2>
                        <p class="text-gray-700 mb-4">Our ministry aims to expand our reach and impact by upgrading our sound equipment. This will allow us to:</p>
                        <ul class="space-y-2">
                            <li class="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Conduct better worship sessions</span>
                            </li>
                            <li class="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Reach more people with our message</span>
                            </li>
                            <li class="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Improve the quality of our events</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Form Section -->
        <section id="purchase" class="py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-lg mx-auto">
                <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                    <!-- Subtle Background Pattern -->
                    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iIzEwYjk4MSIvPjwvc3ZnPg==')] opacity-5 pointer-events-none"></div>

                    <h2 class="text-3xl font-extrabold text-center text-gray-900 mb-10 relative z-10">
                        Get Your Ticket Now
                        <div class="h-1 w-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full mx-auto mt-3"></div>
                    </h2>

                    <form id="purchaseForm" class="space-y-6 relative z-10">
                        <!-- CSRF Token -->
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        
                        <!-- Phone Number Field -->
                        <div class="relative">
                            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <input type="tel" id="phone_number" name="phone_number" class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 text-gray-800" placeholder="M-PESA Number (254XXXXXXXXX)" required>
                        </div>
                        
                        <!-- Full Name Field -->
                        <div class="relative">
                            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input type="text" id="buyer_name" name="buyer_name" class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 text-gray-800" placeholder="Full Name" required>
                        </div>
                        
                        <!-- Contact Number Field -->
                        <div class="relative">
                            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2c0 .738.402 1.378 1 1.723V15a1 1 0 001 1h2a1 1 0 001-1v-2.277c.598-.345 1-.985 1-1.723zm2-6h-4a1 1 0 00-1 1v.01c0 .55.45 1 1 1h4a1 1 0 001-1V6a1 1 0 00-1-1zm6 5a8 8 0 11-16 0 8 8 0 0116 0z" />
                                </svg>
                            </div>
                            <input type="tel" id="buyer_contact" name="buyer_contact" class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 text-gray-800" placeholder="Contact Number" required>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" id="submitBtn" class="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all hover:scale-105">
                            <span>Purchase Now (KES 50)</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </form>

                    <!-- Loading State -->
                    <div id="loading" class="hidden text-center py-8">
                        <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p class="mt-4 text-gray-600 font-medium">Processing Payment...</p>
                        <p class="text-sm text-gray-500 mt-2 animate-pulse">Please wait while we connect to M-PESA</p>
                    </div>

                    <!-- Success State -->
                    <div id="ticketSuccess" class="hidden text-center py-8">
                        <div class="success-animation mb-6">
                            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-3">Success! 🎉</h3>
                        <p class="text-gray-600 mb-4">Your ticket has been confirmed</p>
                        <div class="bg-primary-50 rounded-lg p-4 mb-4 inline-block shadow-sm">
                            <p class="text-primary-800 font-medium">Ticket Number: <span id="ticketNumber" class="font-bold text-primary-700"></span></p>
                        </div>
                        <button onclick="shareTicket()" class="mt-2 bg-primary-100 text-primary-700 px-6 py-3 rounded-xl hover:bg-primary-200 transition-all flex items-center justify-center mx-auto shadow-md hover:shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share Now
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonial Section -->
        <section class="py-16 px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in" style="animation-delay: 1.7s; animation-duration: 0.8s;">
            <div class="max-w-5xl mx-auto">
                <h2 class="text-3xl font-bold text-center text-primary-800 mb-12">What People Say</h2>
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-white rounded-2xl p-6 shadow-lg card-hover">
                        <p class="text-gray-600 mb-4">"Supporting this fundraiser was a great way to give back and enjoy the chance to win something exciting!"</p>
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <span class="text-primary-600 font-bold text-xl">J</span>
                            </div>
                            <div class="ml-4">
                                <p class="font-semibold text-gray-900">John K.</p>
                                <p class="text-sm text-gray-500">Student, JKUAT</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-2xl p-6 shadow-lg card-hover">
                        <p class="text-gray-600 mb-4">"The ministry’s work is inspiring, and I’m happy to contribute to better sound equipment."</p>
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <span class="text-primary-600 font-bold text-xl">M</span>
                            </div>
                            <div class="ml-4">
                                <p class="font-semibold text-gray-900">Mary W.</p>
                                <p class="text-sm text-gray-500">Community Member</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-primary-900 text-white py-10 px-4">
            <div class="max-w-5xl mx-auto text-center">
                <h2 class="text-2xl font-bold mb-4">MOUT JKUAT Ministry</h2>
                <p class="text-primary-100 mb-6">Together, we make a difference</p>
                <div class="flex justify-center space-x-6">
                    <a href="https://facebook.com/Jkuatmout" class="hover:text-primary-300 transition-all">Facebook</a>
                    <a href="https://x.com/Jkuatmout" class="hover:text-primary-300 transition-all">X.COM</a>
                    <a href="https://www.instagram.com/jkuatmout/" class="hover:text-primary-300 transition-all">Instagram</a>
                </div>
                <p class="text-sm text-primary-200 mt-6">© {{ date('Y') }} MOUT JKUAT Ministry. All rights reserved.</p>
            </div>
        </footer>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script>
        $(document).ready(function() {
            // Scroll Progress Indicator
            $(window).scroll(function() {
                const scrollTop = $(this).scrollTop();
                const docHeight = $(document).height() - $(window).height();
                const scrollPercent = (scrollTop / docHeight) * 100;
                $('.scroll-progress').css('width', scrollPercent + '%');
            });

            // Gift Box Reveal
            $('#revealGiftBtn').on('click', function() {
                $('.gift-box').addClass('open');
                $(this).remove();
            });

            // Form Submission
            $('#purchaseForm').on('submit', function(e) {
                e.preventDefault();
                const $btn = $('#submitBtn').prop('disabled', true).text('Processing...');
                $('#loading').removeClass('hidden');
                $('#purchaseForm').addClass('hidden');

                const data = {
                    phone_number: $('#phone_number').val().trim(),
                    buyer_name: $('#buyer_name').val().trim(),
                    buyer_contact: $('#buyer_contact').val().trim(),
                    amount: 50,
                    _token: $('meta[name="csrf-token"]').attr('content')
                };

                if (!/^254[0-9]{9}$/.test(data.phone_number)) return showError('Invalid M-PESA number Format Kindly Use the format 254XXXXXXXXX');
                if (data.buyer_name.length < 2) return showError('Enter your full name');
                if (!/^[0-9+]{10,13}$/.test(data.buyer_contact)) return showError('Invalid contact number');

                $.ajax({
                    url: "{{ route('tickets.process', ['mmid' => $member->MMID]) }}",
                    method: 'POST',
                    data: data,
                    success: function(response) {
                        if (response.success) checkPaymentStatus(response.ticket_number);
                        else showError(response.message || 'Payment failed');
                    },
                    error: function(xhr) {
                        showError(xhr.responseJSON?.message || 'Error occurred');
                    }
                });
            });

            function checkPaymentStatus(ticketNumber) {
                $.ajax({
                    url: "{{ route('tickets.checkPaymentStatus', ['ticketNumber' => ':ticketNumber']) }}".replace(':ticketNumber', ticketNumber),
                    method: 'GET',
                    success: function(response) {
                        if (response.success && response.payment_status === 'completed') showSuccess(ticketNumber);
                        else if (response.payment_status === 'failed') showError('Payment failed');
                        else setTimeout(() => checkPaymentStatus(ticketNumber), 5000);
                    },
                    error: function() {
                        showError('Payment verification failed');
                    }
                });
            }

            function showError(message) {
                $('#loading').addClass('hidden');
                $('#purchaseForm').removeClass('hidden');
                $('#submitBtn').prop('disabled', false).text('Purchase Now (KES 50)');
                
                const toast = $(`
                    <div class="toast error">
                        <div class="toast-icon">
                            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <span class="toast-message">${message}</span>
                    </div>
                `);
                $('#toastContainer').append(toast);
                setTimeout(() => {
                    toast.css('animation', 'slideOut 0.3s ease-in forwards');
                    setTimeout(() => toast.remove(), 300);
                }, 5000);
            }

            function showSuccess(ticketNumber) {
                $('#ticketNumber').text(ticketNumber);
                $('#loading').addClass('hidden');
                $('#ticketSuccess').removeClass('hidden');
                createConfetti();

                const toast = $(`
                    <div class="toast success">
                        <div class="toast-icon">
                            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <span class="toast-message">Payment successful! Your ticket: ${ticketNumber}</span>
                    </div>
                `);
                $('#toastContainer').append(toast);
                setTimeout(() => {
                    toast.css('animation', 'slideOut 0.3s ease-in forwards');
                    setTimeout(() => toast.remove(), 300);
                }, 5000);
            }

            function shareTicket() {
                const shareData = {
                    title: 'Support MOUT JKUAT Ministry',
                    text: 'I bought a ticket to support MOUT JKUAT Ministry and win gifts! Join me!',
                    url: window.location.href
                };
                
                if (navigator.share) {
                    navigator.share(shareData).then(() => {
                        showSuccessToast('Shared successfully!');
                    }).catch(() => {
                        fallbackShare();
                    });
                } else {
                    fallbackShare();
                }
            }

            function fallbackShare() {
                navigator.clipboard.writeText(window.location.href);
                showSuccessToast('Link copied to clipboard!');
            }

            function showSuccessToast(message) {
                const toast = $(`
                    <div class="toast success">
                        <div class="toast-icon">
                            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <span class="toast-message">${message}</span>
                    </div>
                `);
                $('#toastContainer').append(toast);
                setTimeout(() => {
                    toast.css('animation', 'slideOut 0.3s ease-in forwards');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }

            function createConfetti() {
                const colors = ['#10b981', '#34d399', '#059669'];
                for (let i = 0; i < 50; i++) {
                    const confetti = $('<div>').addClass('absolute w-2 h-2 rounded-full')
                        .css({
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            left: Math.random() * 100 + 'vw',
                            top: '-10px',
                            animation: `confetti ${Math.random() * 2 + 1}s ease-in forwards`
                        });
                    $('body').append(confetti);
                    setTimeout(() => confetti.remove(), 3000);
                }
            }
        });
    </script>
</body>
</html>