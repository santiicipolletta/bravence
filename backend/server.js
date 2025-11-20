const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
// app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bravence', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Lead Schema
const leadSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    empresa: { type: String, required: true },
    email: { type: String, required: true },
    telefono: String,
    desafio: { type: String, required: true },
    facturacion: String,
    mensaje: String,
    ip: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'nuevo', enum: ['nuevo', 'contactado', 'calificado', 'cliente'] }
});

const Lead = mongoose.model('Lead', leadSchema);

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation Rules
const contactValidation = [
    body('nombre').trim().isLength({ min: 2, max: 100 }).escape(),
    body('empresa').trim().isLength({ min: 2, max: 100 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').optional().trim(),
    body('desafio').isIn(['rentabilidad', 'ventas', 'administrativo', 'rrhh']),
    body('facturacion').optional().isIn(['menos-5k', '5k-20k', '20k-50k', 'mas-50k']),
    body('mensaje').optional().trim().isLength({ max: 1000 }).escape()
];

// API Routes
app.post('/api/contact', contactValidation, async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Datos de formulario inválidos',
            errors: errors.array() 
        });
    }

    try {
        const { nombre, empresa, email, telefono, desafio, facturacion, mensaje } = req.body;

        // Save to database
        const newLead = new Lead({
            nombre,
            empresa,
            email,
            telefono,
            desafio,
            facturacion,
            mensaje,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        await newLead.save();

        // Send email notification to admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'contacto@bravence.com',
            subject: `🚀 Nuevo Lead: ${empresa}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0a594f;">Nuevo Contacto desde Bravence.com</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Nombre:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${nombre}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Empresa:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${empresa}</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Teléfono:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${telefono || 'N/A'}</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Desafío:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${desafio}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Facturación:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${facturacion || 'N/A'}</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Mensaje:</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${mensaje || 'N/A'}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px; color: #666;">
                        Lead ID: ${newLead._id}<br>
                        Fecha: ${new Date().toLocaleString('es-AR')}
                    </p>
                </div>
            `
        };

        // Send confirmation email to client
        const clientMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '✅ Recibimos tu solicitud - Bravence',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #0a594f; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">bravence</h1>
                        <p style="margin: 5px 0; font-size: 14px;">Consultoría de Negocios & Performance</p>
                    </div>
                    <div style="padding: 30px 20px; background: #f9f9f9;">
                        <h2 style="color: #0a594f;">Hola ${nombre},</h2>
                        <p>Gracias por contactarte con Bravence. Hemos recibido tu solicitud de diagnóstico para <strong>${empresa}</strong>.</p>
                        <p>Nuestro equipo revisará tu información y te contactará dentro de las próximas 24 horas para coordinar una auditoría de viabilidad.</p>
                        <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #c6fff7;">
                            <p style="margin: 0;"><strong>Próximos pasos:</strong></p>
                            <ol style="margin: 10px 0;">
                                <li>Análisis preliminar de tu caso</li>
                                <li>Llamada de diagnóstico inicial</li>
                                <li>Propuesta personalizada</li>
                            </ol>
                        </div>
                        <p>Mientras tanto, si tienes alguna pregunta urgente, no dudes en contactarnos:</p>
                        <p>
                            📞 WhatsApp: +54 9 11 1234-5678<br>
                            📧 Email: contacto@bravence.com
                        </p>
                    </div>
                    <div style="background: #0a594f; color: white; padding: 15px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">&copy; 2025 Bravence. Todos los derechos reservados.</p>
                    </div>
                </div>
            `
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);

        res.status(200).json({ 
            success: true, 
            message: 'Solicitud enviada exitosamente' 
        });

    } catch (error) {
        console.error('Error procesando contacto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar la solicitud. Por favor intenta nuevamente.' 
        });
    }
});

// Admin Dashboard - Get all leads
app.get('/api/admin/leads', async (req, res) => {
    try {
        // Simple auth - en producción usar JWT o similar
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json({ success: true, leads });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener leads' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Catch all route - serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   🚀 Bravence Server Running          ║
    ║   📍 Port: ${PORT}                      ║
    ║   🌐 http://localhost:${PORT}          ║
    ╚═══════════════════════════════════════╝
    `);
});

module.exports = app;