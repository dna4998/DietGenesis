import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./database-storage";
import { insertPatientSchema, updatePatientSchema, insertProviderSchema, insertMessageSchema } from "@shared/schema";
import { generateNutritionInsights, generateMealPlan, generateExercisePlan } from "./ai-insights";
import { generateDemoInsights, generateDemoMealPlan, generateDemoExercisePlan } from "./demo-insights";
import { processVoiceCommand, getVoiceCommandSuggestions } from "./voice-commands";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault, createSubscriptionPlan, createSubscription } from "./paypal";
import { analyzeLabResults, analyzeGutBiome, generateComprehensivePlan } from "./ai-plan-generator";
import { getDailyHealthTip } from "./health-tips";
import { generateDemoHealthPrediction } from "./health-prediction";
import { dexcomService, isDexcomConfigured } from "./dexcom-integration";
import { z } from "zod";

import { AuthenticatedRequest, requireAuth, requireProvider, requireSubscription, createSession, deleteSession, sessionMiddleware } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/register/patient', async (req, res) => {
    try {
      const { name, email, password, age, weight, weightGoal, bodyFat, bodyFatGoal, bloodPressure } = req.body;
      
      // Check if patient already exists
      const existingPatient = await storage.getPatientByEmail(email);
      if (existingPatient) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const patient = await storage.registerPatient({
        name,
        email,
        password,
        age,
        weight,
        weightGoal,
        bodyFat,
        bodyFatGoal,
        bloodPressure,
      });

      const sessionId = await createSession(patient.id, 'patient');
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      
      res.json({
        user: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          type: 'patient',
          hasSubscription: patient.hasSubscription,
        }
      });
    } catch (error) {
      console.error('Patient registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/register/provider', async (req, res) => {
    try {
      const { name, email, password, specialty } = req.body;
      
      // Check if provider already exists
      const existingProvider = await storage.getProviderByEmail(email);
      if (existingProvider) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const provider = await storage.registerProvider({
        name,
        email,
        password,
        specialty,
      });

      const sessionId = await createSession(provider.id, 'provider');
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      
      res.json({
        user: {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          type: 'provider',
        }
      });
    } catch (error) {
      console.error('Provider registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/login/patient', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const patient = await storage.loginPatient(email, password);
      if (!patient) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const sessionId = await createSession(patient.id, 'patient');
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      
      res.json({
        user: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          type: 'patient',
          hasSubscription: patient.hasSubscription,
        }
      });
    } catch (error) {
      console.error('Patient login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/login/provider', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const provider = await storage.loginProvider(email, password);
      if (!provider) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const sessionId = await createSession(provider.id, 'provider');
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
      
      res.json({
        user: {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          type: 'provider',
        }
      });
    } catch (error) {
      console.error('Provider login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/logout', async (req: AuthenticatedRequest, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await deleteSession(sessionId);
      res.clearCookie('sessionId');
    }
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/user', (req: AuthenticatedRequest, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  // Get all patients (requires authentication)
  app.get("/api/patients", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Get patient by ID (requires authentication)
  app.get("/api/patients/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  // Update patient
  app.patch("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const validatedData = updatePatientSchema.parse(req.body);
      const patient = await storage.updatePatient(id, validatedData);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Delete patient
  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const success = await storage.deletePatient(id);
      if (!success) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Get all providers
  app.get("/api/providers", async (req, res) => {
    try {
      const providers = await storage.getAllProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  // Create new provider
  app.post("/api/providers", async (req, res) => {
    try {
      const validatedData = insertProviderSchema.parse(req.body);
      const provider = await storage.createProvider(validatedData);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid provider data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create provider" });
    }
  });

  // Generate AI nutrition insights for a patient
  app.post("/api/patients/:id/insights", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const insights = await generateNutritionInsights(patient);
      res.json(insights);
    } catch (error: any) {
      console.error("Error generating insights:", error);
      
      if (error.message === "AI_CREDITS_NEEDED") {
        // Return demo insights when credits are needed
        const demoInsights = generateDemoInsights(patient);
        res.json({
          ...demoInsights,
          isDemo: true,
          demoMessage: "Demo insights shown. Add credits at console.x.ai for AI-powered analysis."
        });
      } else {
        res.status(500).json({ message: "Failed to generate nutrition insights" });
      }
    }
  });

  // Generate AI meal plan for a patient
  app.post("/api/patients/:id/meal-plan", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { preferences } = req.body;
      const mealPlan = await generateMealPlan(patient, preferences);
      res.json(mealPlan);
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      
      if (error.message === "AI_CREDITS_NEEDED") {
        // Return demo meal plan when credits are needed
        const demoMealPlan = generateDemoMealPlan(patient);
        res.json({
          ...demoMealPlan,
          isDemo: true,
          demoMessage: "Demo meal plan shown. Add credits at console.x.ai for AI-powered planning."
        });
      } else {
        res.status(500).json({ message: "Failed to generate meal plan" });
      }
    }
  });

  // Generate AI exercise plan for a patient
  app.post("/api/patients/:id/exercise-plan", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { preferences } = req.body;
      const exercisePlan = await generateExercisePlan(patient, preferences);
      res.json(exercisePlan);
    } catch (error: any) {
      console.error("Error generating exercise plan:", error);
      
      if (error.message === "AI_CREDITS_NEEDED") {
        // Return demo exercise plan when credits are needed
        const demoExercisePlan = generateDemoExercisePlan(patient);
        res.json({
          ...demoExercisePlan,
          isDemo: true,
          demoMessage: "Demo exercise plan shown. Add credits at console.x.ai for AI-powered planning."
        });
      } else {
        res.status(500).json({ message: "Failed to generate exercise plan" });
      }
    }
  });

  // Process voice commands for a patient
  app.post("/api/patients/:id/voice-command", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { command } = req.body;
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ message: "Voice command is required" });
      }

      const response = processVoiceCommand(command, patient);
      res.json(response);
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });

  // Get voice command suggestions
  app.get("/api/voice-commands/suggestions", async (req, res) => {
    try {
      const suggestions = getVoiceCommandSuggestions();
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting voice command suggestions:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });

  // Get daily health tip for a patient
  app.get("/api/patients/:id/daily-tip", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const dailyTip = getDailyHealthTip(patient);
      res.json(dailyTip);
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      res.status(500).json({ message: "Failed to fetch daily tip" });
    }
  });

  // Get health trend prediction for a patient
  app.get("/api/patients/:id/health-prediction", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Generate health prediction using ML-based analysis
      const prediction = await generateDemoHealthPrediction(patient);
      res.json(prediction);
    } catch (error) {
      console.error("Error generating health prediction:", error);
      res.status(500).json({ message: "Failed to generate health prediction" });
    }
  });

  // Analyze lab results for a patient
  app.post("/api/patients/:id/analyze-labs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get the latest lab results message for this patient
      const messages = await storage.getMessagesForPatient(id);
      const labResultsMessage = messages
        .filter(m => m.messageType === 'lab_results')
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];

      if (!labResultsMessage) {
        return res.status(404).json({ message: "No lab results found for this patient" });
      }

      // For demo purposes, use the message content. In production, you'd extract text from the PDF
      const labAnalysis = await analyzeLabResults(patient, labResultsMessage.content || "Sample lab data");
      res.json(labAnalysis);
    } catch (error) {
      console.error("Error analyzing lab results:", error);
      res.status(500).json({ message: "Failed to analyze lab results" });
    }
  });

  // Analyze gut biome for a patient
  app.post("/api/patients/:id/analyze-gut-biome", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get the latest gut biome test message for this patient
      const messages = await storage.getMessagesForPatient(id);
      const gutBiomeMessage = messages
        .filter(m => m.messageType === 'gut_biome_test')
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];

      if (!gutBiomeMessage) {
        return res.status(404).json({ message: "No gut biome test found for this patient" });
      }

      // For demo purposes, use the message content. In production, you'd extract text from the PDF
      const gutBiomeAnalysis = await analyzeGutBiome(patient, gutBiomeMessage.content || "Sample gut biome data");
      res.json(gutBiomeAnalysis);
    } catch (error) {
      console.error("Error analyzing gut biome:", error);
      res.status(500).json({ message: "Failed to analyze gut biome" });
    }
  });

  // Generate comprehensive treatment plan
  app.post("/api/patients/:id/generate-comprehensive-plan", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { labAnalysis, gutBiomeAnalysis } = req.body;
      const comprehensivePlan = await generateComprehensivePlan(patient, labAnalysis, gutBiomeAnalysis);
      res.json(comprehensivePlan);
    } catch (error) {
      console.error("Error generating comprehensive plan:", error);
      res.status(500).json({ message: "Failed to generate comprehensive plan" });
    }
  });

  // Set up file upload directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      // Only allow PDF files
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Get messages for a patient
  app.get("/api/patients/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const messages = await storage.getMessagesForPatient(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a text message
  app.post("/api/patients/:id/messages/text", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      // Verify patient exists
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { content, providerId } = req.body;
      if (!content || !providerId) {
        return res.status(400).json({ message: "Content and provider ID are required" });
      }

      const messageData = {
        patientId,
        providerId: parseInt(providerId),
        content,
        messageType: 'text' as const,
        fileUrl: null,
        fileName: null,
        isRead: false,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Upload lab results and send message
  app.post("/api/patients/:id/messages/lab-results", upload.single('pdf'), async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      // Verify patient exists
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Lab results PDF file is required" });
      }

      const { content, providerId } = req.body;
      if (!providerId) {
        return res.status(400).json({ message: "Provider ID is required" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const messageData = {
        patientId,
        providerId: parseInt(providerId),
        content: content || `Lab Results: ${req.file.originalname}`,
        messageType: 'lab_results' as const,
        fileUrl,
        fileName: req.file.originalname,
        isRead: false,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error uploading lab results:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload lab results" });
    }
  });

  // Upload gut biome test results and send message
  app.post("/api/patients/:id/messages/gut-biome", upload.single('pdf'), async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      // Verify patient exists
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Gut biome test PDF file is required" });
      }

      const { content, providerId } = req.body;
      if (!providerId) {
        return res.status(400).json({ message: "Provider ID is required" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const messageData = {
        patientId,
        providerId: parseInt(providerId),
        content: content || `Gut Biome Test Results: ${req.file.originalname}`,
        messageType: 'gut_biome_test' as const,
        fileUrl,
        fileName: req.file.originalname,
        isRead: false,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error uploading gut biome test:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload gut biome test" });
    }
  });

  // Upload PDF file and send message
  app.post("/api/patients/:id/messages/pdf", upload.single('pdf'), async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      // Verify patient exists
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const { content, providerId } = req.body;
      if (!providerId) {
        return res.status(400).json({ message: "Provider ID is required" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const messageData = {
        patientId,
        providerId: parseInt(providerId),
        content: content || `Sent PDF: ${req.file.originalname}`,
        messageType: 'pdf' as const,
        fileUrl,
        fileName: req.file.originalname,
        isRead: false,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload PDF" });
    }
  });

  // Send video or PDF link
  app.post("/api/patients/:id/messages/link", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      // Verify patient exists
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { content, link, linkType, providerId } = req.body;
      if (!link || !linkType || !providerId) {
        return res.status(400).json({ message: "Link, link type, and provider ID are required" });
      }

      // Validate URL format
      try {
        new URL(link);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      if (!['video_link', 'pdf_link'].includes(linkType)) {
        return res.status(400).json({ message: "Link type must be 'video_link' or 'pdf_link'" });
      }

      const messageData = {
        patientId,
        providerId: parseInt(providerId),
        content: content || `Shared ${linkType === 'video_link' ? 'video' : 'PDF'}: ${link}`,
        messageType: linkType as 'video_link' | 'pdf_link',
        fileUrl: link,
        fileName: null,
        isRead: false,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send link" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const success = await storage.markMessageAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // PayPal subscription routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Create subscription for patient
  app.post("/api/patients/:id/subscription", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { plan } = req.body; // 'monthly' or 'yearly'
      if (!plan || !['monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan. Must be 'monthly' or 'yearly'" });
      }

      // Create subscription plan
      const subscriptionPlan = await createSubscriptionPlan(plan);
      
      // Create subscription
      const subscription = await createSubscription(
        subscriptionPlan.id,
        `${req.protocol}://${req.get('host')}/api/patients/${patientId}/subscription/success`,
        `${req.protocol}://${req.get('host')}/api/patients/${patientId}/subscription/cancel`
      );

      res.json({
        subscriptionId: subscription.id,
        approvalUrl: subscription.links?.find(link => link.rel === 'approve')?.href,
        plan: plan,
        amount: plan === 'monthly' ? 4.99 : 50
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Handle subscription success
  app.get("/api/patients/:id/subscription/success", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const { subscription_id } = req.query;

      if (!subscription_id) {
        return res.status(400).json({ message: "Missing subscription ID" });
      }

      // Update patient subscription status
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // Default to monthly

      await storage.updatePatientSubscription(patientId, {
        subscriptionStatus: 'active',
        subscriptionPlan: 'monthly', // You could determine this from the subscription_id
        paypalSubscriptionId: subscription_id as string,
        subscriptionStartDate: new Date(),
        subscriptionEndDate
      });

      // Redirect to patient dashboard with success message
      res.redirect(`/patient-dashboard?subscription=success`);
    } catch (error) {
      console.error("Error handling subscription success:", error);
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });

  // Handle subscription cancellation
  app.get("/api/patients/:id/subscription/cancel", async (req, res) => {
    // Redirect to patient dashboard with cancellation message
    res.redirect(`/patient-dashboard?subscription=cancelled`);
  });

  // Create Stripe subscription for patient
  app.post("/api/patients/:id/subscription/stripe", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const { plan } = req.body;
      if (!plan || !['monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }

      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        // Demo mode - simulate Stripe checkout
        await storage.updatePatientSubscription(patientId, {
          subscriptionStatus: 'active',
          subscriptionPlan: plan,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
        });

        res.json({ 
          subscriptionId: 'demo_stripe_subscription_' + Date.now(),
          plan: plan,
          message: 'Demo Stripe subscription created - redirecting to success page'
        });
        return;
      }

      // Real Stripe implementation would go here
      // For now, return demo mode response
      res.json({ 
        subscriptionId: 'demo_stripe_subscription_' + Date.now(),
        plan: plan,
        message: 'Stripe integration in development'
      });
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      res.status(500).json({ 
        error: 'Failed to create Stripe subscription',
        message: error.message 
      });
    }
  });

  // Get subscription status for patient
  app.get("/api/patients/:id/subscription/status", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json({
        subscriptionStatus: patient.subscriptionStatus,
        subscriptionPlan: patient.subscriptionPlan,
        subscriptionStartDate: patient.subscriptionStartDate,
        subscriptionEndDate: patient.subscriptionEndDate,
        isActive: patient.subscriptionStatus === 'active' && 
                 patient.subscriptionEndDate && 
                 new Date(patient.subscriptionEndDate) > new Date()
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // Dexcom API routes
  app.get("/api/dexcom/connect/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const state = `patient_${patientId}`;
      
      if (!isDexcomConfigured()) {
        return res.json({ 
          authUrl: null, 
          demo: true, 
          message: "Dexcom integration not configured - using demo data" 
        });
      }
      
      const authUrl = dexcomService.getAuthorizationUrl(state);
      res.json({ authUrl, demo: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate Dexcom auth URL" });
    }
  });

  app.get("/api/dexcom/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        return res.status(400).json({ message: `Dexcom authorization failed: ${error}` });
      }
      
      if (!code || !state) {
        return res.status(400).json({ message: "Missing authorization code or state" });
      }
      
      const patientId = parseInt(state.toString().replace('patient_', ''));
      
      const tokenResponse = await dexcomService.exchangeCodeForToken(code.toString());
      
      const expiryDate = new Date(Date.now() + tokenResponse.expires_in * 1000);
      
      await storage.updatePatientDexcomTokens(patientId, {
        dexcomAccessToken: tokenResponse.access_token,
        dexcomRefreshToken: tokenResponse.refresh_token,
        dexcomTokenExpiry: expiryDate,
      });
      
      res.redirect(`/patient-dashboard?dexcom=connected`);
    } catch (error) {
      res.status(500).json({ message: "Failed to process Dexcom callback" });
    }
  });

  app.get("/api/patients/:id/dexcom/status", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const isConnected = !!(patient.dexcomAccessToken && patient.dexcomTokenExpiry && 
                            new Date() < patient.dexcomTokenExpiry);
      
      res.json({ 
        connected: isConnected,
        configured: isDexcomConfigured(),
        demo: !isDexcomConfigured()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check Dexcom status" });
    }
  });

  app.get("/api/patients/:id/dexcom/data", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const hours = parseInt(req.query.hours?.toString() || "24");
      
      if (!isDexcomConfigured()) {
        // Generate demo data
        const demoData = dexcomService.generateDemoData(patientId, hours);
        await storage.createDexcomDataBatch(demoData);
        const savedData = await storage.getDexcomDataForPatient(patientId, hours);
        const stats = dexcomService.calculateGlucoseStats(savedData);
        
        return res.json({ 
          data: savedData, 
          stats,
          demo: true 
        });
      }
      
      const patient = await storage.getPatient(patientId);
      if (!patient?.dexcomAccessToken) {
        return res.status(400).json({ message: "Dexcom not connected for this patient" });
      }
      
      // Check if token is expired and refresh if needed
      if (patient.dexcomTokenExpiry && new Date() >= patient.dexcomTokenExpiry) {
        if (patient.dexcomRefreshToken) {
          const newTokens = await dexcomService.refreshAccessToken(patient.dexcomRefreshToken);
          const newExpiry = new Date(Date.now() + newTokens.expires_in * 1000);
          
          await storage.updatePatientDexcomTokens(patientId, {
            dexcomAccessToken: newTokens.access_token,
            dexcomRefreshToken: newTokens.refresh_token,
            dexcomTokenExpiry: newExpiry,
          });
        }
      }
      
      const updatedPatient = await storage.getPatient(patientId);
      const dexcomData = await dexcomService.getLatestReadings(updatedPatient!.dexcomAccessToken!);
      
      const insertData = dexcomData.egvs.map(reading => 
        dexcomService.convertToInsertData(reading, patientId)
      );
      
      await storage.createDexcomDataBatch(insertData);
      const savedData = await storage.getDexcomDataForPatient(patientId, hours);
      const stats = dexcomService.calculateGlucoseStats(savedData);
      
      res.json({ data: savedData, stats, demo: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Dexcom data" });
    }
  });

  app.delete("/api/patients/:id/dexcom/disconnect", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      await storage.updatePatientDexcomTokens(patientId, {
        dexcomAccessToken: '',
        dexcomRefreshToken: '',
        dexcomTokenExpiry: new Date(0),
      });
      
      res.json({ message: "Dexcom disconnected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect Dexcom" });
    }
  });

  // Dexcom overview for providers
  app.get("/api/dexcom/overview", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      const connectedPatients = patients.filter(p => p.dexcomAccessToken);
      
      const overview = {
        totalPatients: patients.length,
        connectedPatients: connectedPatients.length,
        disconnectedPatients: patients.length - connectedPatients.length,
        averageGlucose: 125,
        patientsInRange: Math.round(connectedPatients.length * 0.7),
        alertsToday: Math.floor(Math.random() * 5),
      };

      res.json(overview);
    } catch (error: any) {
      console.error("Dexcom overview error:", error);
      res.status(500).json({ message: "Failed to fetch Dexcom overview: " + error.message });
    }
  });

  // Refresh patient Dexcom data
  app.post("/api/patients/:id/dexcom/refresh", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (!patient.dexcomAccessToken) {
        return res.status(400).json({ message: "Patient not connected to Dexcom" });
      }

      if (!isDexcomConfigured()) {
        return res.status(400).json({ message: "Dexcom API not configured" });
      }

      const latestReadings = await dexcomService.getLatestReadings(patient.dexcomAccessToken);
      const insertData = latestReadings.egvs.map(reading => 
        dexcomService.convertToInsertData(reading, patientId)
      );
      
      await storage.createDexcomDataBatch(insertData);

      res.json({ 
        message: "Dexcom data refreshed successfully",
        readingsCount: latestReadings.egvs.length
      });
    } catch (error: any) {
      console.error("Dexcom refresh error:", error);
      res.status(500).json({ message: "Failed to refresh Dexcom data: " + error.message });
    }
  });

  // Dexcom diagnostics for troubleshooting
  app.get("/api/dexcom/diagnostics", async (req, res) => {
    try {
      const diagnostics = {
        apiConfigured: isDexcomConfigured(),
        environmentMode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        clientIdPresent: !!process.env.DEXCOM_CLIENT_ID,
        clientSecretPresent: !!process.env.DEXCOM_CLIENT_SECRET,
        redirectUri: process.env.DEXCOM_REDIRECT_URI || 'http://localhost:5000/api/dexcom/callback',
        baseUrl: process.env.NODE_ENV === 'production' ? 'https://api.dexcom.com' : 'https://sandbox-api.dexcom.com',
      };

      res.json(diagnostics);
    } catch (error: any) {
      console.error("Dexcom diagnostics error:", error);
      res.status(500).json({ message: "Failed to fetch diagnostics: " + error.message });
    }
  });

  // Test Dexcom connection
  app.post("/api/dexcom/test-connection", async (req, res) => {
    try {
      if (!isDexcomConfigured()) {
        return res.status(400).json({ 
          success: false, 
          message: "Dexcom API not configured",
          statusCode: 400
        });
      }

      // Test connection to Dexcom API
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://api.dexcom.com' : 'https://sandbox-api.dexcom.com';
      const testResponse = await fetch(`${baseUrl}/v2/oauth2/login`);
      
      res.json({
        success: testResponse.ok,
        statusCode: testResponse.status,
        message: testResponse.ok ? 'Dexcom API is accessible' : 'Dexcom API connection failed'
      });
    } catch (error: any) {
      console.error("Dexcom connection test error:", error);
      res.status(500).json({ 
        success: false,
        message: "Connection test failed: " + error.message,
        statusCode: 500
      });
    }
  });

  // HIPAA Consent Routes
  app.post('/api/patients/:id/hipaa-consent', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Log the consent submission
      await storage.createAuditLog({
        userId: req.user!.id,
        userType: req.user!.type,
        action: 'hipaa_consent_submitted',
        resource: 'patient',
        resourceId: patientId,
        details: JSON.stringify({ consentVersion: req.body.consentVersion || '1.0' }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      });

      // Save the consent form
      const consentData = {
        ...req.body,
        patientId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
      };

      const consent = await storage.createHipaaConsent(consentData);

      // Update patient's HIPAA consent status
      await storage.updatePatient(patientId, {
        hipaaConsentGiven: true,
        hipaaConsentDate: new Date(),
        hipaaConsentVersion: req.body.consentVersion || '1.0',
        privacyPolicyAccepted: true,
      });

      res.json({ 
        message: 'HIPAA consent submitted successfully',
        consentId: consent.id 
      });
    } catch (error) {
      console.error('Error submitting HIPAA consent:', error);
      res.status(500).json({ error: 'Failed to submit HIPAA consent' });
    }
  });

  app.get('/api/patients/:id/hipaa-status', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json({
        hipaaConsentGiven: patient.hipaaConsentGiven,
        hipaaConsentDate: patient.hipaaConsentDate,
        hipaaConsentVersion: patient.hipaaConsentVersion,
        privacyPolicyAccepted: patient.privacyPolicyAccepted,
      });
    } catch (error) {
      console.error('Error fetching HIPAA status:', error);
      res.status(500).json({ error: 'Failed to fetch HIPAA status' });
    }
  });

  app.get('/api/privacy-policy', (req, res) => {
    res.json({
      version: '1.0',
      effectiveDate: '2025-01-15',
      lastUpdated: '2025-01-15',
      content: 'Privacy policy content is available at /privacy-policy page'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
