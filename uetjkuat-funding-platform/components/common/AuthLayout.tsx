
import React from 'react';

interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>
            
            <div className="relative sm:mx-auto w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-primary">U</span>
                    </div>
                </div>
                
                <h2 className="text-center text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {title}
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    UET JKUAT Community Platform
                </p>
            </div>

            <div className="relative mt-6 sm:mt-8 sm:mx-auto w-full sm:max-w-md">
                <div className="bg-card/80 backdrop-blur-sm py-8 px-6 sm:px-10 shadow-xl sm:rounded-2xl border border-border/50">
                    {children}
                </div>
            </div>
            
            {/* Footer */}
            <div className="relative mt-8 text-center">
                <p className="text-xs text-muted-foreground">
                    © 2024 UET JKUAT. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;