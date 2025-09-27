// Main JavaScript for MMO Strategic Survival Sandbox Website

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeNoiseSimulator();
    initializeParticles();
    initializeScrollAnimations();
});

// Hero section animations
function initializeAnimations() {
    // Animate hero elements on load
    anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
    })
    .add({
        targets: '.hero-title',
        opacity: [0, 1],
        translateY: [50, 0],
        delay: 500
    })
    .add({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: 200
    }, '-=800')
    .add({
        targets: '.hero-description',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 100
    }, '-=600')
    .add({
        targets: '.cta-buttons',
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.9, 1],
        delay: 0
    }, '-=400');

    // Animate feature cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Stagger animation for feature cards
                if (entry.target.classList.contains('feature-card')) {
                    const cards = document.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        if (card === entry.target) {
                            anime({
                                targets: card,
                                opacity: [0, 1],
                                translateY: [30, 0],
                                duration: 600,
                                delay: index * 100,
                                easing: 'easeOutQuad'
                            });
                        }
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Noise simulator functionality
function initializeNoiseSimulator() {
    const weaponSlider = document.getElementById('weaponNoise');
    const activitySlider = document.getElementById('playerActivity');
    const bufferSlider = document.getElementById('bufferZone');
    
    const weaponValue = document.getElementById('weaponValue');
    const activityValue = document.getElementById('activityValue');
    const bufferValue = document.getElementById('bufferValue');
    
    const threatMeter = document.getElementById('threatMeter');
    const threatValue = document.getElementById('threatValue');
    const threatDescription = document.getElementById('threatDescription');
    
    let threatChart;
    let chartData = [];
    
    // Initialize chart
    function initChart() {
        const chartDom = document.getElementById('threatChart');
        threatChart = echarts.init(chartDom);
        
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '10%',
                right: '10%',
                top: '10%',
                bottom: '20%'
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999', fontSize: 10 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999', fontSize: 10 },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: [],
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#ff4444',
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(255, 68, 68, 0.3)' },
                            { offset: 1, color: 'rgba(255, 68, 68, 0.05)' }
                        ]
                    }
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: '#ff4444' }
            }]
        };
        
        threatChart.setOption(option);
    }
    
    // Calculate threat level
    function calculateThreat() {
        const weapon = parseInt(weaponSlider.value);
        const activity = parseInt(activitySlider.value);
        const buffer = parseInt(bufferSlider.value);
        
        // Threat calculation formula
        const baseThreat = (weapon * 0.4 + activity * 0.6);
        const bufferReduction = buffer * 0.3;
        const threat = Math.max(0, Math.min(100, baseThreat - bufferReduction));
        
        return Math.round(threat);
    }
    
    // Update threat display
    function updateThreat() {
        const threat = calculateThreat();
        
        // Update value display
        threatValue.textContent = threat + '%';
        
        // Update meter appearance
        threatMeter.className = 'threat-meter';
        if (threat < 30) {
            threatMeter.classList.add('threat-level-low');
            threatDescription.textContent = 'Низкая угроза - одиночные зомби';
        } else if (threat < 60) {
            threatMeter.classList.add('threat-level-medium');
            threatDescription.textContent = 'Средняя угроза - группы зомби';
        } else {
            threatMeter.classList.add('threat-level-high');
            threatDescription.textContent = 'Высокая угроза - орды зомби';
        }
        
        // Update chart
        const now = new Date();
        const timeStr = now.getSeconds().toString().padStart(2, '0');
        
        chartData.push({ time: timeStr, threat: threat });
        if (chartData.length > 10) {
            chartData.shift();
        }
        
        if (threatChart) {
            threatChart.setOption({
                xAxis: {
                    data: chartData.map(d => d.time)
                },
                series: [{
                    data: chartData.map(d => d.threat)
                }]
            });
        }
    }
    
    // Event listeners
    weaponSlider.addEventListener('input', function() {
        weaponValue.textContent = this.value + '%';
        updateThreat();
    });
    
    activitySlider.addEventListener('input', function() {
        activityValue.textContent = this.value + '%';
        updateThreat();
    });
    
    bufferSlider.addEventListener('input', function() {
        bufferValue.textContent = this.value + '%';
        updateThreat();
    });
    
    // Initialize
    initChart();
    updateThreat();
    
    // Auto-update chart every 2 seconds for demo
    setInterval(updateThreat, 2000);
}

// Particle system for hero section
function initializeParticles() {
    const particlesContainer = document.getElementById('heroParticles');
    if (!particlesContainer) return;
    
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    particlesContainer.appendChild(canvas);
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = particlesContainer.offsetWidth;
        canvas.height = particlesContainer.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle system
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? '#ff4444' : '#ffaa00';
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            this.opacity += (Math.random() - 0.5) * 0.02;
            this.opacity = Math.max(0.1, Math.min(0.7, this.opacity));
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    animate();
}

// Scroll animations
function initializeScrollAnimations() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Navigation background opacity on scroll
    const navigation = document.querySelector('.navigation');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const opacity = Math.min(scrolled / 100, 1);
        if (navigation) {
            navigation.style.backgroundColor = `rgba(10, 10, 10, ${0.9 + opacity * 0.1})`;
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Reinitialize components that need resize
    const threatChart = echarts.getInstanceByDom(document.getElementById('threatChart'));
    if (threatChart) {
        threatChart.resize();
    }
}, 250));

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Console easter egg
console.log(`
███████╗██╗   ██╗██████╗ ███████╗██████╗ ██╗   ██╗███╗   ███╗
██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗██║   ██║████╗ ████║
███████╗██║   ██║██████╔╝█████╗  ██████╔╝██║   ██║██╔████╔██║
╚════██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║╚██╔╝██║
███████║╚██████╔╝██████╔╝███████╗██████╔╝╚██████╔╝██║ ╚═╝ ██║
╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝

MMO Strategic Survival Sandbox
Добро пожаловать в мир выживания!
`);