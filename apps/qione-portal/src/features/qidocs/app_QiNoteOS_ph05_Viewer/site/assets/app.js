document.addEventListener('DOMContentLoaded', () => {
    const navTree = document.getElementById('nav-tree');
    const contentViewer = document.getElementById('content-viewer');
    const breadcrumbs = document.getElementById('breadcrumbs');
    const searchBox = document.getElementById('search-box');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('content-overlay');

    let catalog = [];

    // Initialize
    fetchCatalog();

    // Event Listeners
    window.addEventListener('hashchange', handleRoute);
    searchBox.addEventListener('input', (e) => filterNav(e.target.value));
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    async function fetchCatalog() {
        // Primary method: Check injected window.QINOTE_CATALOG (file:// support)
        if (window.QINOTE_CATALOG) {
            catalog = window.QINOTE_CATALOG.modules;
            renderNav(catalog);
            handleRoute();
            return;
        }

        try {
            const response = await fetch('_catalog.json');
            // Fallback for different serving setups, trying relative to index.html
            // If built properly, dist/_catalog.json is what we want. 
            // BUT, if site/index.html is the entry, and _catalog.json is in ./dist adjacent...
            // Let's assume standard deployment: root/site/index.html and root/dist/
            // Actually, usually dist/ contains the site. 
            // PROMPT SAID: "Generate dist artifacts" -> /dist/_catalog.json
            // If we run the site from /site/index.html, we need to access ../dist/_catalog.json
            if (!response.ok) throw new Error('Failed to load catalog');
            const data = await response.json();
            catalog = data.modules;
            renderNav(catalog);
            handleRoute(); // Load initial route
        } catch (error) {
            console.error(error);
            // Try fetching from ./_catalog.json in case index.html was moved to dist
            try {
                const resp2 = await fetch('_catalog.json');
                if (resp2.ok) {
                    const data2 = await resp2.json();
                    catalog = data2.modules;
                    renderNav(catalog);
                    handleRoute();
                    return;
                }
            } catch (e) {}
            navTree.innerHTML = '<div style="padding:1rem; color:red">Error loading catalog. Make sure dist/_catalog.json exists.</div>';
        }
    }

    function renderNav(modules) {
        navTree.innerHTML = '';
        
        // Group by type
        const groups = {};
        modules.forEach(mod => {
            const type = (mod.type || 'other').toUpperCase();
            if (!groups[type]) groups[type] = [];
            groups[type].push(mod);
        });

        // Sort groups alphabetical
        const sortedGroups = Object.keys(groups).sort();

        sortedGroups.forEach(type => {
            const groupMods = groups[type];

            // Deterministic sort within group
            groupMods.sort((a, b) => {
                // 1. Sort override
                if (a.sort && b.sort) return a.sort - b.sort;
                // 2. QID numeric (approximate)
                const qidA = parseInt((a.qid || '').replace(/\D/g, '')) || 0;
                const qidB = parseInt((b.qid || '').replace(/\D/g, '')) || 0;
                if (qidA !== qidB) return qidA - qidB;
                // 3. Title
                return (a.title || a.slug).localeCompare(b.title || b.slug);
            });

            const groupDiv = document.createElement('div');
            groupDiv.className = 'nav-group';
            
            const title = document.createElement('div');
            title.className = 'nav-group-title';
            title.textContent = type;
            groupDiv.appendChild(title);

            groupMods.forEach(mod => {
                const link = document.createElement('a');
                link.className = 'nav-item';
                link.href = `#/${mod.qid}_${mod.slug}`; // Deep link
                link.dataset.keywords = `${mod.title} ${mod.slug} ${mod.qid}`.toLowerCase();
                
                const meta = document.createElement('span');
                meta.className = 'meta-id';
                meta.textContent = mod.qid;
                
                const label = document.createTextNode(mod.title || mod.slug);
                
                link.appendChild(meta);
                link.appendChild(label);
                
                // On click, close sidebar on mobile
                link.addEventListener('click', () => {
                   if (window.innerWidth <= 768) closeSidebar(); 
                });

                groupDiv.appendChild(link);
            });

            navTree.appendChild(groupDiv);
        });
    }

    async function handleRoute() {
        const hash = window.location.hash.slice(2); // Remove #/
        if (!hash) return;

        // Find module
        const module = catalog.find(m => `${m.qid}_${m.slug}` === hash || m.id === hash);
        
        if (module) {
            loadModule(module);
            updateActiveNav(hash);
        } else {
            contentViewer.innerHTML = `<h1>404 Not Found</h1><p>Module <code>${hash}</code> not found in catalog.</p>`;
        }
    }

    async function loadModule(module) {
        breadcrumbs.textContent = `${module.qid} > ${module.title}`;
        contentViewer.innerHTML = '<div class="loading">Loading...</div>';

        // Try to fetch rendered HTML from dist
        // Path logic: if current is site/index.html, dist is ../dist/
        // module.rendered_url is relative to dist root likely e.g. "modules/qid.../index.html"
        // So we need: ../dist/ + module.rendered_url
        
        // We will try a few path strategies to be robust
        let possiblePaths = [
            `../dist/${module.rendered_url}`, // Dev structure
            `${module.rendered_url}`          // Production (if everything is in one root)
        ];

        let content = null;
        
        // Strategy 0: Check global content bundle (Offline file://)
        if (window.QINOTE_CONTENT) {
             // We need to match the key logic in build_site.py: "modules/{id}/{path}"
             // module.rendered_url usually is "modules/{id}/index.html"
             const keys = [
                 module.rendered_url,
                 `modules/${module.id}/index.html`
             ];
             for (const k of keys) {
                 if (window.QINOTE_CONTENT[k]) {
                     content = window.QINOTE_CONTENT[k];
                     break;
                 }
             }
        }

        if (!content) {
            let possiblePaths = [
                `../dist/${module.rendered_url}`, // Dev structure
                `${module.rendered_url}`          // Production (if everything is in one root)
            ];

            for (const path of possiblePaths) {
                try {
                    const resp = await fetch(path);
                    if (resp.ok) {
                        content = await resp.text();
                        break;
                    }
                } catch (e) {}
            }
        }

        if (content) {
            // Extract body content if it's a full html file, or just use it if it's a fragment
            // Simple check: does it have <body>?
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            // If we fetched a full page, grab .article-body or body
            const article = tempDiv.querySelector('.article-body') || tempDiv.querySelector('body') || tempDiv;
            contentViewer.innerHTML = article.innerHTML;
            
            // Fix relative image links?
            // If the HTML links to "assets/img.png", and we are at site/index.html ...
            // The browser will resolve site/assets/img.png -- WRONG.
            // It needs to be ../dist/modules/folder/assets/img.png
            // This is the tricky part of SPA + Static Files without base tag.
            // WE MUST REWRITE SRC ATTRIBUTES
            
            const moduleBase = `../dist/modules/${module.id}/`; // Approximation
            
            contentViewer.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('/')) {
                     // It is relative. Prepend base.
                     img.src = moduleBase + src;
                }
            });

             contentViewer.querySelectorAll('a').forEach(a => {
                const href = a.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                     // It is likely a relative link to another md file or asset
                     // For MVP, we might leave it or try to smart-route it.
                     // Making it open in new tab is safest for now for files
                     a.target = "_blank";
                }
            });

        } else {
            contentViewer.innerHTML = `<h1>Error</h1><p>Could not load content for ${module.title}</p>`;
        }
    }

    function updateActiveNav(hash) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#/${hash}`) {
                item.classList.add('active');
                // Scroll into view
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function filterNav(query) {
        const q = query.toLowerCase();
        document.querySelectorAll('.nav-item').forEach(item => {
            const keys = item.dataset.keywords;
            if (keys.includes(q)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide empty groups?
        document.querySelectorAll('.nav-group').forEach(group => {
            const invisibleItems = group.querySelectorAll('.nav-item[style="display: none;"]');
            const totalItems = group.querySelectorAll('.nav-item');
            if (invisibleItems.length === totalItems.length) {
                group.style.display = 'none';
            } else {
                group.style.display = 'block';
            }
        });
    }

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
});
