// server.js - Proxy ultra-simple pour Claude API
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['https://claude.ai', 'http://localhost:3000', 'https://bloomtech-crisis-new.vercel.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Headers CORS supplémentaires
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Route pour servir les fichiers statiques (ton escape game)
app.use(express.static('public'));

// Route proxy pour Claude API
app.post('/api/claude-chat', async (req, res) => {
    try {
        const { message, influencer = 'sarah' } = req.body;
        
        // Utiliser la variable d'environnement pour la clé API
        const apiKey = process.env.CLAUDE_API_KEY;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API key manquante - vérifiez les variables d\'environnement' });
        }

        // Profils d'influenceurs
        const influencerProfiles = {
            sarah: {
                name: "@SarahGlowUp",
                followers: "2.3M",
                personality: "Directe et business-minded, sceptique des excuses corporates, demande des compensations concrètes"
            },
            mike: {
                name: "@BeautyGuruMike", 
                followers: "850K",
                personality: "Plus diplomatique mais ferme, négocie âprement mais reste constructif"
            },
            queen: {
                name: "@InfluencerQueen",
                followers: "1.8M", 
                personality: "Stratégique, connait sa valeur, menace de campagne négative si pas satisfaite"
            }
        };

        const profile = influencerProfiles[influencer] || influencerProfiles.sarah;

        const prompt = `Tu es ${profile.name}, une influenceuse beauté avec ${profile.followers} followers.

CONTEXTE: BloomTech a eu un bug qui a affiché des slogans concurrents dans ta campagne sponsorisée. Tu es énervée et tu menaces de poster publiquement à midi si pas de solution satisfaisante.

PERSONNALITÉ: ${profile.personality}
- Style DM Instagram authentique
- Connait ta valeur et n'accepte pas n'importe quoi

L'équipe BloomTech te dit: "${message}"

Réponds comme ${profile.name} (en anglais, style DM Instagram, max 2-3 phrases, difficile à convaincre):`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 150,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Claude API Error:', response.status, errorData);
            return res.status(response.status).json({ 
                error: `Claude API Error: ${response.status}`,
                details: errorData
            });
        }

        const data = await response.json();
        res.json({ 
            response: data.content[0].text,
            influencer: profile.name,
            cost: 0.003 // Estimation du coût
        });

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ 
            error: 'Erreur serveur proxy',
            details: error.message 
        });
    }
});

// Route de test avec vérification clé API
app.get('/api/test', (req, res) => {
    const hasApiKey = !!process.env.CLAUDE_API_KEY;
    res.json({ 
        message: 'Proxy Claude API opérationnel !', 
        timestamp: new Date(),
        apiKeyConfigured: hasApiKey,
        apiKeyPreview: hasApiKey ? `${process.env.CLAUDE_API_KEY.substring(0, 12)}...` : 'NON CONFIGURÉE'
    });
});

// Route santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Claude Proxy', port: PORT });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur proxy Claude démarré sur le port ${PORT}`);
    console.log(`📡 Endpoint API: http://localhost:${PORT}/api/claude-chat`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
});

module.exports = app;
