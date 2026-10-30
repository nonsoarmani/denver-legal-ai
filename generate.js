const fs = require('fs');
const path = require('path');
const data = require('./data');
const renderPage = require('./template');

const distDir = path.join(__dirname, 'dist');

if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 1. Generate child pSEO pages
data.locations.forEach(location => {
    data.niches.forEach(niche => {
        const pageDir = path.join(distDir, niche.slug, location.slug);
        fs.mkdirSync(pageDir, { recursive: true });
        
        const htmlContent = renderPage(niche, location);
        fs.writeFileSync(path.join(pageDir, 'index.html'), htmlContent);
        console.log(`Generated: /${niche.slug}/${location.slug}/`);
    });
});

// 2. Safely map niche categories into clean static strings
const nicheGridHTML = data.niches.map(n => {
    const internalLinks = data.locations.map(l => {
        return `<a class="text-xs bg-slate-950/60 hover:bg-blue-600 hover:text-white border border-slate-800 hover:border-blue-500 text-slate-300 px-3 py-1.5 rounded-lg transition duration-150 font-medium" href="/${n.slug}/${l.slug}/">${l.name}</a>`;
    }).join('\n');

    return `
    <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-60"></div>
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-extrabold text-white text-lg tracking-tight">${n.name}</h3>
            <span class="text-[10px] uppercase font-mono tracking-widest bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded">Active Node</span>
        </div>
        <p class="text-xs text-slate-500 mb-4">Select a region to initiate automated client intake routing:</p>
        <div class="flex flex-wrap gap-2">
            ${internalLinks}
        </div>
    </div>`;
}).join('\n');

// 3. Output beautiful homepage shell
const homeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Denver Legal AI | Premium AI-Powered Regional Client Triage</title>
    <script src="https://tailwindcss.com"></script>
</head>
<body class="bg-[#070a12] text-slate-100 font-sans antialiased min-h-screen flex flex-col selection:bg-blue-500/30 selection:text-blue-200">

    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none"></div>

    <header class="border-b border-slate-900 bg-[#070a12]/80 backdrop-blur-xl sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
                    <span class="text-base font-black text-white">Δ</span>
                </div>
                <span>DenverLegal<span class="text-blue-500">AI</span></span>
            </a>
            <div class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-xs font-mono uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">Core Router Online</span>
            </div>
        </div>
    </header>

    <section class="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center relative z-10 flex-grow w-full">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
            ✨ Colorado Legal Intake Virtual Engine
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Connecting High-Value Cases with Denver’s <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Elite Law Firms</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed">
            Bypass outdated directories. Our triage framework matches case details with verified legal networks across Colorado instantly.
        </p>

        <div class="max-w-4xl mx-auto text-left">
            <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Available Regional Routing Nodes By Specialization
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${nicheGridHTML}
            </div>
        </div>
    </section>

    <footer class="border-t border-slate-950 bg-slate-950/90 py-10 text-xs text-slate-500 relative z-10 mt-auto">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; 2026 DenverLegalAI.com. All rights reserved.</p>
            <p class="text-center md:text-right max-w-md leading-relaxed text-slate-600">Disclaimer: DenverLegalAI is an automated client triage system mapping cases to licensed Colorado bar members.</p>
        </div>
    </footer>

</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), homeHTML);
console.log("Enterprise compilation completed successfully!");
