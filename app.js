// ========================================
// Graph Network Visualization - Complete Graph
// ========================================

class Node {
    constructor(id, name, color, x, y, data = {}) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.targetColor = color; // For color transitions
        this.data = data; // Generic data holder
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 40;
        this.isHovered = false;
        this.isDragging = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw(ctx, time) {
        // Smooth color transition
        // Smooth color transition
        if (this.color !== this.targetColor) {
            this.color = this.lerpColor(this.color, this.targetColor, 0.05);
        }

        // Smooth radius transition
        const targetRadius = 40; // Default target radius
        if (Math.abs(this.radius - targetRadius) > 0.5) {
            this.radius += (targetRadius - this.radius) * 0.05;
        } else {
            this.radius = targetRadius;
        }

        const pulse = Math.sin(time * 0.002 + this.pulsePhase) * 0.1 + 0.9;
        const currentRadius = this.radius * (this.isHovered ? 1.2 : 1) * pulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius * 2);
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(0.5, this.color + '20');
        gradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main circle
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.isHovered ? 30 : 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const innerGradient = ctx.createRadialGradient(
            this.x - currentRadius * 0.3,
            this.y - currentRadius * 0.3,
            0,
            this.x,
            this.y,
            currentRadius
        );
        innerGradient.addColorStop(0, '#ffffff80');
        innerGradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Text
        ctx.fillStyle = '#ffffff';
        const fontSize = this.isHovered ? 16 : 14;
        ctx.font = `600 ${fontSize}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Split text into lines
        const words = this.name.split(' ');
        if (words.length > 1) {
            ctx.fillText(words[0], this.x, this.y - 6);
            ctx.fillText(words[1], this.x, this.y + 8);
        } else {
            ctx.fillText(this.name, this.x, this.y);
        }
    }

    update(nodes, width, height, damping = 0.95) {
        if (this.isDragging) return;

        // Apply forces from other nodes (repulsion)
        nodes.forEach(other => {
            if (other === this) return;

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
                const force = (200 - distance) * 0.005;
                this.vx += (dx / distance) * force;
                this.vy += (dy / distance) * force;
            }
        });

        // Attraction to center
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = centerX - this.x;
        const dy = centerY - this.y;

        this.vx += dx * 0.0005;
        this.vy += dy * 0.0005;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= damping;
        this.vy *= damping;

        // Boundary constraints
        const margin = this.radius * 2;
        if (this.x < margin) {
            this.x = margin;
            this.vx *= -0.5;
        }
        if (this.x > width - margin) {
            this.x = width - margin;
            this.vx *= -0.5;
        }
        if (this.y < margin) {
            this.y = margin;
            this.vy *= -0.5;
        }
        if (this.y > height - margin) {
            this.y = height - margin;
            this.vy *= -0.5;
        }
    }

    // Helper for color interpolation
    lerpColor(a, b, amount) {
        const ah = parseInt(a.replace(/#/g, ''), 16),
            ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
            bh = parseInt(b.replace(/#/g, ''), 16),
            br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);

        return '#' + ((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + (Math.round(rb) | 0)).toString(16).slice(1);
    }

    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}

class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.flowOffset = Math.random() * 100;
    }

    draw(ctx, time) {
        const isHighlighted = this.node1.isHovered || this.node2.isHovered;

        // Create gradient
        const gradient = ctx.createLinearGradient(
            this.node1.x, this.node1.y,
            this.node2.x, this.node2.y
        );

        if (isHighlighted) {
            gradient.addColorStop(0, this.node1.color + 'cc');
            gradient.addColorStop(0.5, '#ffffff80');
            gradient.addColorStop(1, this.node2.color + 'cc');
        } else {
            gradient.addColorStop(0, this.node1.color + '40');
            gradient.addColorStop(0.5, '#ffffff20');
            gradient.addColorStop(1, this.node2.color + '40');
        }

        // Draw main line
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isHighlighted ? 3 : 1.5;
        ctx.shadowColor = isHighlighted ? '#ffffff' : 'transparent';
        ctx.shadowBlur = isHighlighted ? 10 : 0;

        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Animated flow particles
        if (isHighlighted) {
            const flowProgress = ((time * 0.001 + this.flowOffset) % 100) / 100;
            const particleX = this.node1.x + (this.node2.x - this.node1.x) * flowProgress;
            const particleY = this.node1.y + (this.node2.y - this.node1.y) * flowProgress;

            const particleGradient = ctx.createRadialGradient(
                particleX, particleY, 0,
                particleX, particleY, 8
            );
            particleGradient.addColorStop(0, '#ffffff');
            particleGradient.addColorStop(1, '#ffffff00');

            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}


class DetailsPanel {
    constructor() {
        this.element = document.getElementById('details-panel');
        this.title = document.getElementById('panel-title');
        this.desc = document.getElementById('panel-desc'); // Currently placeholder text, will be replaced or hidden
        this.content = document.getElementById('panel-dynamic-content');
        this.link = document.getElementById('panel-link');
        this.closeBtn = document.getElementById('panel-close');

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
    }

    show(node, mode = 'studios') {
        this.title.textContent = node.name;

        // Hide placeholder desc, we will use dynamic content area
        this.desc.style.display = 'none';
        this.content.innerHTML = '';

        // Reset link
        this.link.classList.add('hidden');
        this.link.href = '#';

        if (mode === 'studios' || mode === 'brands') {
            const products = node.data.products || [];

            let html = '<div class="studio-details">';

            // Description
            html += `<p class="studio-description">${node.data.description}</p>`;

            // Products
            if (products.length > 0) {
                html += '<div class="detail-section"><h4>Products</h4><ul>';
                products.forEach(prod => {
                    const prodColor = (typeof prod === 'object' && prod.color) ? ` style="color:${prod.color}"` : '';
                    if (typeof prod === 'object' && prod.link) {
                        html += `<li${prodColor}><a href="${prod.link}" target="_blank" style="color:inherit;">${prod.name}</a></li>`;
                    } else {
                        html += `<li${prodColor}>${typeof prod === 'object' ? prod.name : prod}</li>`;
                    }
                });
                html += '</ul></div>';
            }

            html += '</div>';

            this.content.innerHTML = html;

            // Website logic
            const websiteUrl = node.data.website;
            if (websiteUrl) {
                // Determine button text
                if (websiteUrl.includes('simonallmer.com')) {
                    this.link.textContent = 'Access';
                } else {
                    const displayUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    this.link.textContent = displayUrl;
                }

                this.link.href = websiteUrl;
                this.link.classList.remove('hidden');
            }
            this.content.innerHTML = html;
        }

        // Color accent
        this.element.style.borderColor = node.color;
        this.element.classList.add('active');
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('active');
            // Reset to placeholder state
            this.desc.style.display = 'block';
            this.content.innerHTML = '';
            this.link.classList.add('hidden');
            this.title.textContent = 'Select a Node';
        }
    }
}

class GraphVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.nodes = [];
        this.edges = [];
        this.popup = new DetailsPanel();
        this.selectedNode = null;
        this.selectedNode = null;
        this.hoveredNode = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        this.animationProgress = 0; // 0 to 1, for initial formation animation
        this.isAnimating = true;

        this.isAnimating = true;
        this.mode = 'studios'; // 'studios' or 'brands'

        // Data Definitions
        this.studiosData = [
            {
                id: 'comics',
                name: 'Allmer Comics',
                color: '#ef4444',
                description: 'Description coming soon',
                website: 'https://allmercomics.com',
                products: ['Comic Books', 'Digital Comics']
            },
            {
                id: 'films',
                name: 'Allmer Films',
                color: '#3b82f6',
                description: 'Description coming soon',
                website: 'https://allmerfilms.com',
                products: ['Feature Films', 'Limited Series']
            },
            {
                id: 'music',
                name: 'Allmer Music',
                color: '#fbbf24',
                description: 'Description coming soon',
                website: 'https://allmermusic.com',
                products: ['Studio Albums', 'Score Albums', 'Musical Instruments']
            },
            {
                id: 'games',
                name: 'Allmer Games',
                color: '#10b981',
                description: 'Description coming soon',
                website: 'https://allmergames.com',
                products: ['Tabletop Games', 'Video Games', 'Toys']
            },
            {
                id: 'journals',
                name: 'Allmer Journals',
                color: '#8b4513',
                description: 'Description coming soon',
                website: 'https://allmerjournals.com',
                products: ['Magazines', 'Books']
            }
        ];

        this.citiesData = []; // Removed



        this.brandsData = [
            {
                id: 'american-portrait',
                name: 'American Portrait',
                color: '#b0b0b0',
                description: "Painting man's eternal struggle for freedom",
                products: ['Coming soon'],
                website: 'https://aportrait.org'
            },
            {
                id: 'beat-race',
                name: 'Beat Race',
                color: '#b0b0b0',
                description: 'Coming soon',
                products: ['Coming soon'],
                website: 'https://simonallmer.com/beatrace'
            },
            {
                id: 'believe',
                name: 'Believe',
                color: '#b0b0b0',
                description: 'Never lie. Unless you can pull it off',
                products: [
                    { name: 'Believe', link: 'https://simonallmer.com/believe', color: '#10b981' }
                ],
                website: 'https://believegame.com'
            },
            {
                id: 'casino-camino',
                name: 'Casino Camino',
                color: '#b0b0b0',
                description: 'Follow your vices',
                products: [
                    { name: 'American Playing Cards', link: 'https://simonallmer.com/americanplayingcards', color: '#10b981' }
                ],
                website: 'https://casinocamino.com'
            },
            {
                id: 'chronicle',
                name: 'Chronicle',
                color: '#b0b0b0',
                description: 'The definitive record of human history',
                products: [
                    { name: 'Chronicle: Years of Change', link: 'https://simonallmer.com/chronicle', color: '#d2a679' },
                    { name: 'American Chronicle', link: 'https://simonallmer.com/americanchronicle', color: '#d2a679' }
                ],
                website: 'https://simonallmer.com/chronicle'
            },
            {
                id: 'colbu',
                name: 'Colbu',
                color: '#b0b0b0',
                description: 'Coming soon',
                products: ['Coming soon'],
                website: 'https://colbu.com'
            },
            {
                id: 'cosmographia',
                name: 'Cosmographia',
                color: '#b0b0b0',
                description: 'The universal lexicon',
                products: ['Coming soon'],
                website: 'https://simonallmer.com/cosmographia'
            },
            {
                id: 'crosslink',
                name: 'Crosslink',
                color: '#b0b0b0',
                description: 'Coming soon',
                products: ['Coming soon'],
                website: 'https://simonallmer.com/crosslink'
            },
            {
                id: 'detective-noname',
                name: 'Detective Noname',
                color: '#b0b0b0',
                description: 'There is a key to every secret',
                products: [
                    { name: 'Detective Noname and the Silent Circle', link: 'https://simonallmer.com/noname', color: '#10b981' }
                ],
                website: 'https://simonallmer.com/detectivenoname'
            },
            {
                id: 'elements',
                name: 'Elements',
                color: '#b0b0b0',
                description: 'The samurai card game',
                products: [
                    { name: 'Elements', link: 'https://simonallmer.com/elements', color: '#10b981' }
                ],
                website: 'https://simonallmer.com/elements'
            },
            {
                id: 'futory',
                name: 'Futory',
                color: '#b0b0b0',
                description: 'A universe beyond imagination',
                products: [
                    { name: 'Futory: Dragon Kingdom', color: '#f87171' },
                    { name: 'Futory: Dragon Kingdom', color: '#3b82f6' },
                    { name: 'Futory Cards Unity', link: 'https://simonallmer.com/futory', color: '#10b981' },
                    { name: 'Futory Cards Duality', link: 'https://simonallmer.com/futory', color: '#10b981' },
                    { name: 'Futory Cards Trinity', color: '#10b981' }
                ],
                website: 'https://futory.com'
            },
            {
                id: 'lunyra',
                name: 'Lunyra',
                color: '#b0b0b0',
                description: 'The Silver City will open its gates soon',
                products: ['Coming soon'],
                website: 'https://lunyra.com'
            },
            {
                id: 'scaretales',
                name: 'Scaretales',
                color: '#b0b0b0',
                description: 'Some fates are worse than death',
                products: ['Coming soon'],
                website: 'https://scaretales.com'
            },
            {
                id: 'seven-wonders',
                name: 'Seven Wonders',
                color: '#b0b0b0',
                description: 'Wonder through the ages',
                products: [
                    { name: 'Pyramid', link: 'https://simonallmer.com/pyramid', color: '#10b981' },
                    { name: 'Gardens', link: 'https://simonallmer.com/gardens', color: '#10b981' },
                    { name: 'Temple', link: 'https://simonallmer.com/temple', color: '#10b981' },
                    { name: 'Statue', link: 'https://simonallmer.com/statue', color: '#10b981' },
                    { name: 'Mausoleum', link: 'https://simonallmer.com/mausoleum', color: '#10b981' },
                    { name: 'Colossus', link: 'https://simonallmer.com/colossus', color: '#10b981' },
                    { name: 'Pharos', link: 'https://simonallmer.com/pharos', color: '#10b981' },
                    { name: 'Colosseum', link: 'https://simonallmer.com/colosseum', color: '#10b981' },
                    { name: 'Great Wall', link: 'https://simonallmer.com/greatwall', color: '#10b981' },
                    { name: 'Library', link: 'https://simonallmer.com/library', color: '#10b981' },
                    { name: 'Tower', link: 'https://simonallmer.com/tower', color: '#10b981' },
                    { name: 'Cathedral', link: 'https://simonallmer.com/cathedral', color: '#10b981' },
                    { name: 'Palace', link: 'https://simonallmer.com/palace', color: '#10b981' },
                    { name: 'Skyscraper', link: 'https://simonallmer.com/skyscraper', color: '#10b981' }
                ],
                website: 'https://sevenwondersgames.com'
            },
            {
                id: 'society-review',
                name: 'Society Review',
                color: '#b0b0b0',
                description: 'Read the world today',
                products: ['Coming soon'],
                website: 'https://societyreview.org'
            }
        ];

        this.catalogueData = {
            'Allmer Comics': {
                color: '#ef4444',
                items: [
                    { name: 'C001 The Quiet Signal [TBA]' },
                    { name: 'C002 Carter: The Blood Beneath the Soil [TBA]' },
                    { name: 'C003 Futory: Dragon Kingdom [TBA]' }
                ]
            },
            'Allmer Films': {
                color: '#3b82f6',
                items: [
                    { name: 'F001 Kissinger [TBA]' },
                    { name: 'F002 Carter [TBA]' },
                    { name: 'F003 Futory: Dragon Kingdom [TBA]' }
                ]
            },
            'Allmer Music': {
                color: '#fbbf24',
                items: [
                    { name: 'M001 American Portrait Score', link: 'https://simonallmer.com/americanportrait' },
                    { name: 'M002 Soul Town [TBA]' },
                    { name: 'M003 Sin [TBA]' },
                    { name: 'M004 Futory Score [TBA]' }
                ]
            },
            'Allmer Games': {
                color: '#10b981',
                items: [
                    { name: 'G001 Pyramid', link: 'https://simonallmer.com/pyramid' },
                    { name: 'G002 Nectar', link: 'https://simonallmer.com/nectar' },
                    { name: 'G003 Futory Cards Unity', link: 'https://simonallmer.com/futory' },
                    { name: 'G004 Elements', link: 'https://simonallmer.com/elements' },
                    { name: 'G005 Gardens', link: 'https://simonallmer.com/gardens' },
                    { name: 'G006 Temple', link: 'https://simonallmer.com/temple' },
                    { name: 'G007 Believe', link: 'https://simonallmer.com/believe' },
                    { name: 'G008 Detective Noname and the Silent Circle', link: 'https://simonallmer.com/noname' },
                    { name: 'G009 Statue', link: 'https://simonallmer.com/statue' },
                    { name: 'G010 Mausoleum', link: 'https://simonallmer.com/mausoleum' },
                    { name: 'G011 Colossus', link: 'https://simonallmer.com/colossus' },
                    { name: 'G012 Pharos', link: 'https://simonallmer.com/pharos' },
                    { name: 'G013 American Playing Cards', link: 'https://simonallmer.com/americanplayingcards' },
                    { name: 'G014 Fortuna', link: 'https://simonallmer.com/camino' },
                    { name: 'G015 Ricochet', link: 'https://simonallmer.com/camino' },
                    { name: 'G016 Believe Objects', link: 'https://simonallmer.com/believe' },
                    { name: 'G017 Colosseum', link: 'https://simonallmer.com/colosseum' },
                    { name: 'G018 Great Wall', link: 'https://simonallmer.com/greatwall' },
                    { name: 'G019 Tower', link: 'https://simonallmer.com/tower' },
                    { name: 'G020 Library', link: 'https://simonallmer.com/library' },
                    { name: 'G021 Cathedral', link: 'https://simonallmer.com/cathedral' },
                    { name: 'G022 Palace', link: 'https://simonallmer.com/palace' },
                    { name: 'G023 Skyscraper', link: 'https://simonallmer.com/skyscraper' },
                    { name: 'G024 Futory Cards Duality', link: 'https://simonallmer.com/futory' },
                    { name: 'G025 Beat Race', link: 'https://simonallmer.com/beatrace' },
                    { name: 'G026 Crosslink', link: 'https://simonallmer.com/crosslink' },
                    { name: 'G027 Capital [TBA]' },
                    { name: 'G028 Equilibrium [TBA]' },
                    { name: 'G029 Silk Road [TBA]' },
                    { name: 'G030 Futory Cards Trinity [TBA]' },
                    { name: 'G031 Viral [TBA]' }
                ]
            },
            'Allmer Journals': {
                color: '#8b4513',
                items: [
                    { name: 'J001 Simon Allmer World', link: 'https://simonallmer.com/world' },
                    { name: 'J002 Society Review', link: 'https://simonallmer.com/societyreview' },
                    { name: 'J003 Chronicle: Years of Change', link: 'https://simonallmer.com/chronicle' },
                    { name: 'J004 ACRONYM', link: 'https://simonallmer.com/acronym' },
                    { name: 'J005 Cosmographia', link: 'https://simonallmer.com/cosmographia' },
                    { name: 'J006 American Chronicle', link: 'https://simonallmer.com/americanchronicle' }
                ]
            }
        };

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Set canvas size
        this.resize();

        // Define the studios


        // Calculate positions
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.4; // Reduced from 0.5 for breathing space

        // Create nodes with initial triforce positions
        // Use studiosData as initial data
        this.studiosData.forEach((studio, index) => {
            // Calculate initial triforce positions (triangular formation)
            let initialX, initialY;
            const triforceRadius = radius * 0.3;

            if (index < 3) {
                // Top triangle (3 nodes)
                const triAngle = (index / 3) * Math.PI * 2 - Math.PI / 2;
                initialX = centerX + Math.cos(triAngle) * triforceRadius;
                initialY = centerY + Math.sin(triAngle) * triforceRadius - radius * 0.3;
            } else {
                // Bottom triangle (3 nodes)
                const triAngle = ((index - 3) / 3) * Math.PI * 2 + Math.PI / 6;
                initialX = centerX + Math.cos(triAngle) * triforceRadius;
                initialY = centerY + Math.sin(triAngle) * triforceRadius + radius * 0.3;
            }

            // Calculate final positions for the current studio count
            const finalAngle = (index / this.studiosData.length) * Math.PI * 2 - Math.PI / 2;
            const finalX = centerX + Math.cos(finalAngle) * radius;
            const finalY = centerY + Math.sin(finalAngle) * radius;


            // Store full data object
            const node = new Node(studio.id, studio.name, studio.color, initialX, initialY, studio);
            node.targetX = finalX;
            node.targetY = finalY;
            node.initialX = initialX;
            node.initialY = initialY;
            this.nodes.push(node);
        });

        // Create edges - every node connected to every other node
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                this.edges.push(new Edge(this.nodes[i], this.nodes[j]));
            }
        }

        // Update info panel

    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Window keyboard events
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scroll
                const newMode = this.mode === 'studios' ? 'brands' : 'studios';
                this.switchMode(newMode);
                
                // Update UI buttons
                const modeBtns = document.querySelectorAll('.switch-btn');
                modeBtns.forEach(btn => {
                    if (btn.dataset.mode === newMode) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.resize());

        // Header branding toggle on mobile
        const branding = document.querySelector('.header-branding');
        if (branding) {
            branding.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    const header = document.querySelector('.header');
                    const switcher = document.querySelector('.view-switch');
                    
                    if (header) header.classList.toggle('hidden-mobile');
                    if (switcher) switcher.classList.toggle('hidden-mobile');
                }
            });
        }

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetLayout());

        // Mode switch
        const modeBtns = document.querySelectorAll('.switch-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newMode = btn.dataset.mode;
                if (newMode !== this.mode) {
                    this.switchMode(newMode);
                    // Update UI
                    modeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }

    switchMode(newMode) {
        this.mode = newMode;
        this.popup.hide();

        const targetData = newMode === 'studios' ? this.studiosData : this.brandsData;

        // Use transition graph for all changes to ensure smooth morphing
        this.transitionGraph(targetData);

        // Update UI panels
        this.updateCatalogue(newMode);
    }

    transitionGraph(targetData) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.4; // Reduced from 0.5

        // Current nodes map (reuse by index)
        const currentNodes = this.nodes;
        const newNodes = [];

        // Distribute target positions in circle
        targetData.forEach((data, index) => {
            const angle = (index / targetData.length) * Math.PI * 2 - Math.PI / 2;
            const targetX = centerX + Math.cos(angle) * radius;
            const targetY = centerY + Math.sin(angle) * radius;

            let node;
            if (index < currentNodes.length) {
                // Reuse existing node
                node = currentNodes[index];
                node.id = data.id;
                node.name = data.name;
                node.data = data;
                node.targetColor = data.color;

                // For animation
                node.initialX = node.x;
                node.initialY = node.y;
                node.targetX = targetX;
                node.targetY = targetY;
            } else {
                // Create new node "splitting" from a previous one
                const parentIndex = index % currentNodes.length;
                const parent = currentNodes[parentIndex] || currentNodes[0];

                // Random tiny offset to prevent stacking logic errors
                const startX = parent.x + (Math.random() - 0.5) * 5;
                const startY = parent.y + (Math.random() - 0.5) * 5;

                node = new Node(data.id, data.name, data.color, startX, startY, data);
                node.color = parent.color; // Start with parent color
                node.targetColor = data.color;
                node.radius = 0; // Start small to grow

                // For animation
                node.initialX = startX;
                node.initialY = startY;
                node.targetX = targetX;
                node.targetY = targetY;
            }
            newNodes.push(node);
        });

        this.nodes = newNodes;

        // Update edges - re-link all
        this.edges = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                this.edges.push(new Edge(this.nodes[i], this.nodes[j]));
            }
        }

        // Trigger animation
        this.animationProgress = 0;
        this.isAnimating = true;
    }



    updateCatalogue(mode, filterStudio = null) {
        const cataloguePanel = document.getElementById('catalogue');
        const catalogueContent = document.getElementById('catalogue-content');

        // Only show catalogue for studios, user said to remove it for brands
        if (mode === 'studios') {
            cataloguePanel.classList.add('active');
            catalogueContent.innerHTML = '';

            // Filter studios if a specific one is selected
            const studiesToShow = filterStudio
                ? { [filterStudio]: this.catalogueData[filterStudio] }
                : this.catalogueData;

            // Display studio catalogues
            Object.keys(studiesToShow).forEach(studioName => {
                const studio = studiesToShow[studioName];
                if (!studio) return;

                // Find website for this studio
                const studioInfo = this.studiosData.find(s => s.name === studioName);
                const studioUrl = studioInfo ? studioInfo.website : '#';

                // Generate items HTML
                const itemsHtml = studio.items.map(item => {
                    // Handle both string and object formats
                    const itemData = typeof item === 'string' ? { name: item } : item;
                    const isTBA = itemData.name.includes('[TBA]');
                    const hasLink = itemData.link && !isTBA;

                    if (hasLink) {
                        return `<a href="${itemData.link}" target="_blank" class="catalogue-item catalogue-link ${isTBA ? 'tba' : ''}">${itemData.name}</a>`;
                    } else {
                        return `<div class="catalogue-item ${isTBA ? 'tba' : ''}">${itemData.name}</div>`;
                    }
                }).join('');

                const sectionHtml = `
                    <div class="catalogue-section" style="background: ${studio.color}20; border-left: 3px solid ${studio.color};">
                        <div class="catalogue-section-title">
                            <a href="${studioUrl}" target="_blank" style="color: inherit; text-decoration: none;">${studioName}</a>
                        </div>
                        <div class="catalogue-items">
                            ${itemsHtml}
                        </div>
                    </div>
                `;
                catalogueContent.insertAdjacentHTML('beforeend', sectionHtml);
            });
        } else {
            cataloguePanel.classList.remove('active');
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // Update hover states
        let foundHover = false;
        this.nodes.forEach(node => {
            if (!node.isDragging) {
                const isHovered = node.contains(this.mouseX, this.mouseY);
                node.isHovered = isHovered;
                if (isHovered) {
                    foundHover = true;
                    this.hoveredNode = node;
                }
            }
        });

        if (!foundHover) {
            this.hoveredNode = null;
        }

        // Dragging
        if (this.selectedNode) {
            this.selectedNode.x = this.mouseX;
            this.selectedNode.y = this.mouseY;
            this.selectedNode.vx = 0;
            this.selectedNode.vy = 0;
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a node
        for (const node of this.nodes) {
            if (node.contains(x, y)) {
                this.selectedNode = node;
                node.isDragging = true;
                break;
            }
        }
    }

    handleMouseUp() {
        if (this.selectedNode) {
            this.selectedNode.isDragging = false;
            this.selectedNode = null;
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a node
        let clickedNode = null;
        for (const node of this.nodes) {
            if (node.contains(x, y)) {
                clickedNode = node;
                break;
            }
        }

        if (clickedNode) {
            this.popup.show(clickedNode, this.mode);

            // Filter catalogue if in studios mode
            if (this.mode === 'studios') {
                this.updateCatalogue(this.mode, clickedNode.name);
            }
        } else {
            this.popup.hide();
            // Hide catalogue when clicking empty space to ensure clean view
            const cataloguePanel = document.getElementById('catalogue');
            if (cataloguePanel) {
                cataloguePanel.classList.remove('active');
            }

            // Toggle Zen mode on mobile (hide/show header and switcher)
            if (window.innerWidth <= 768) {
                const header = document.querySelector('.header');
                const switcher = document.querySelector('.view-switch');
                
                if (header) header.classList.toggle('hidden-mobile');
                if (switcher) switcher.classList.toggle('hidden-mobile');
            }
        }
    }

    handleMouseLeave() {
        this.nodes.forEach(node => {
            if (!node.isDragging) {
                node.isHovered = false;
            }
        });
        this.hoveredNode = null;
        this.handleMouseUp();
    }

    resetLayout() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.4; // Reduced from 0.5

        // Reset to triforce formation and restart animation
        this.animationProgress = 0;
        this.isAnimating = true;

        this.nodes.forEach((node, index) => {
            // Reset to triforce positions
            const triforceRadius = radius * 0.3;
            let initialX, initialY;

            if (index < 3) {
                const triAngle = (index / 3) * Math.PI * 2 - Math.PI / 2;
                initialX = centerX + Math.cos(triAngle) * triforceRadius;
                initialY = centerY + Math.sin(triAngle) * triforceRadius - radius * 0.3;
            } else {
                const triAngle = ((index - 3) / 3) * Math.PI * 2 + Math.PI / 6;
                initialX = centerX + Math.cos(triAngle) * triforceRadius;
                initialY = centerY + Math.sin(triAngle) * triforceRadius + radius * 0.3;
            }

            // Set final positions for the current node count
            const finalAngle = (index / this.nodes.length) * Math.PI * 2 - Math.PI / 2;
            const finalX = centerX + Math.cos(finalAngle) * radius;
            const finalY = centerY + Math.sin(finalAngle) * radius;

            node.x = initialX;
            node.y = initialY;
            node.initialX = initialX;
            node.initialY = initialY;
            node.targetX = finalX;
            node.targetY = finalY;
            node.vx = 0;
            node.vy = 0;
        });

        this.popup.hide();
    }

    update() {
        // Update initial formation animation
        if (this.isAnimating) {
            this.animationProgress += 0.008; // Adjust speed here

            if (this.animationProgress >= 1) {
                this.animationProgress = 1;
                this.isAnimating = false;
            }

            // Easing function (easeOutCubic for smooth deceleration)
            const easeProgress = 1 - Math.pow(1 - this.animationProgress, 3);

            // Interpolate node positions
            this.nodes.forEach(node => {
                node.x = node.initialX + (node.targetX - node.initialX) * easeProgress;
                node.y = node.initialY + (node.targetY - node.initialY) * easeProgress;
                node.vx = 0;
                node.vy = 0;
            });
        } else {
            // Update node physics only after animation completes
            this.nodes.forEach(node => {
                node.update(this.nodes, this.canvas.width, this.canvas.height, 0.92);
            });
        }
    }

    draw() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw edges
        this.edges.forEach(edge => edge.draw(this.ctx, this.time));

        // Draw nodes
        this.nodes.forEach(node => node.draw(this.ctx, this.time));
    }

    animate() {
        this.time++;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const graph = new GraphVisualization('networkCanvas');
});
