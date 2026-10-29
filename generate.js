const fs = require('fs');
const path = require('path');
const data = require('./data');
const renderPage = require('./template');

const distDir = path.join(__dirname, 'dist');

// Clear and create distribution output directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 1. Generate programmatic SEO dynamic route pages
data.locations.forEach(location => {
    data.niches.forEach(niche => {
        const pageDir = path.join(distDir, niche.slug, location.slug);
        fs.mkdirSync(pageDir, { recursive: true });
        
        const htmlContent = renderPage(niche, location);
        fs.writeFileSync(path.join(pageDir, 'index.html'), htmlContent);
        console.log(`Generated Inner Page: /${niche.slug}/${location.slug}/`);
    });
});

// 2. Generate a PREMIUM, High-Converting Homepage
const homeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Denver Legal AI | Premium AI-Powered Legal Case Matching</title>
    <meta name="description" content="The premier legal matching network for Denver, Colorado. Instantly evaluate case details with AI to match with the region's elite attorneys.">
    <script src="https://tailwindcss.com"></script>
</head>
<body class="bg-[#fafafa] text-slate-900 font-sans antialiased">

    <!-- Premium Navigation Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" class="text-2xl font-black text-blue-600 tracking-tight">DenverLegal<span class="text-slate-800">AI</span></a>
            <div class="flex items-center gap-4">
                <span class="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">System Live</span>
            </div>
        </div>
    </header>

    <!-- Premium Hero Section -->
    <section class="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div class="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-6">
            ✨ Next-Gen Legal Triage Protocol
        </div>
        <h1 class="text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] mb-6">
            Match Your Legal Case with Denver's <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Top-Tier Attorney Networks</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Skip the endless calling. Our precision workflow analyzes your scenario against localized firm metrics to route you to optimized counsel in 15 minutes.
        </p>

        <!-- Dynamic Quick-Launch Directory Matrix -->
        <div class="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-left">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Select Your Region & Legal Requirement Below:
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${data.niches.map(n => `
                <div class="bg-slate-50 border border-slate-200/60 p-5 rounded-xl hover:border-blue-400 hover:bg-white transition-all duration-200 shadow-sm group">
                    <h3 class="font-extrabold text-slate-800 text-lg mb-2 flex justify-between items-center group-hover:text-blue-600">
                        ${n.name}
                        <span class="text-xs font-normal text-slate-400 px-2 py-0.5 bg-white border border-slate-200 rounded">Active Area</span>
                    </h3>
                    <div class="flex flex-wrap gap-1.5 mt-3">
                        ${data.locations.map(l => `
                            <a class="text-xs bg-white text-slate-600 hover:text-white hover:bg-blue-600 border border-slate-200 px-2.5 py-1 rounded-md transition font-medium" href="/${n.slug}/${l.slug}/">
                                ${l.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            </div>
        </div>
    </section>

    <!-- Trust Parameters Block -->
    <section class="border-t border-b border-slate-200 bg-white py-12">
        <div class="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
                <div class="text-3xl font-black text-slate-900 mb-1">15 Mins</div>
                <div class="text-xs uppercase tracking-wider font-bold text-slate-400">Average Response Windows</div>
            </div>
            <div class="border-y sm:border-y-0 sm:border-x border-slate-100 py-4 sm:py-0">
                <div class="text-3xl font-black text-blue-600 mb-1">100% Free</div>
                <div class="text-xs uppercase tracking-wider font-bold text-slate-400">Case Evaluation Routing</div>
            </div>
            <div>
                <div class="text-3xl font-black text-slate-900 mb-1">Colorado Specific</div>
                <div class="text-xs uppercase tracking-wider font-bold text-slate-400">Statute-Compliant Routing</div>
            </div>
        </div>
    </section>

    <!-- Professional Footer -->
    <footer class="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>&copy; 2026 DenverLegalAI.com. Elite Legal-Tech Brokerage Solutions. All rights reserved.</p>
        <p class="text-center md:text-right max-w-md">Disclaimer: DenverLegalAI is an automated digital matching platform and routing engine. We do not provide direct legal advice or operate as a practicing law firm.</p>
    </footer>

</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), homeHTML);
console.log("Premium compilation complete: Upgraded modern structure exported to /dist/");
