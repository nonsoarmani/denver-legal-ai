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
        // Formulate path url strategy: dist/personal-injury/denver/index.html
        const pageDir = path.join(distDir, niche.slug, location.slug);
        fs.mkdirSync(pageDir, { recursive: true });
        
        const htmlContent = renderPage(niche, location);
        fs.writeFileSync(path.join(pageDir, 'index.html'), htmlContent);
        console.log(`Generated: /${niche.slug}/${location.slug}/`);
    });
});

// 2. Generate a baseline fallback home index page
const homeHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"><title>Denver Legal AI - Specialized Regional Intake Directory</title>
    <script src="https://tailwindcss.com"></script>
</head>
<body class="bg-slate-50 p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-black mb-4">Denver Legal AI Directory Map</h1>
    <div class="grid grid-cols-2 gap-4">
    ${data.niches.map(n => `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-bold text-blue-600 text-lg mb-2">${n.name} Hubs</h3>
            <ul class="space-y-1 text-sm text-slate-600">
                ${data.locations.map(l => `<li><a class="hover:underline" href="/${n.slug}/${l.slug}/">${n.name} - ${l.name}</a></li>`).join('')}
            </ul>
        </div>
    `).join('')}
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), homeHTML);
console.log("Compilation complete: Master static structure exported to /dist/");
