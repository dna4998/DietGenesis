import { storage } from "./database-storage";
import { insertMessageSchema } from "@shared/schema";

export interface MessageData {
  patientId: number;
  providerId: number;
  content: string;
  messageType: 'text' | 'pdf' | 'video_link' | 'pdf_link' | 'lab_results' | 'gut_biome_test';
  direction: 'provider_to_patient' | 'patient_to_provider';
  fileUrl?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  fileSize?: number | null;
}

export class MessagingService {
  /**
   * Validates that patient and provider exist in the database
   */
  async validateParticipants(patientId: number, providerId: number): Promise<{ patient: any; provider: any }> {
    const patient = await storage.getPatient(patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const provider = await storage.getProvider(providerId);
    if (!provider) {
      // Auto-assign to default provider (Ashok Mehta - ID 7) if provider not found
      const defaultProvider = await storage.getProvider(7);
      if (!defaultProvider) {
        throw new Error("No valid providers available");
      }
      return { patient, provider: defaultProvider };
    }

    return { patient, provider };
  }

  /**
   * Sends a message between patient and provider with proper validation
   */
  async sendMessage(messageData: MessageData): Promise<any> {
    try {
      // Validate participants exist
      const { patient, provider } = await this.validateParticipants(
        messageData.patientId, 
        messageData.providerId
      );

      // Use the actual provider ID (might be different if auto-assigned)
      const finalMessageData = {
        ...messageData,
        providerId: provider.id,
        isRead: false,
      };

      console.log("MessagingService: Sending message", {
        from: messageData.direction === 'patient_to_provider' ? patient.name : provider.name,
        to: messageData.direction === 'patient_to_provider' ? provider.name : patient.name,
        type: messageData.messageType,
        patientId: patient.id,
        providerId: provider.id
      });

      // Validate data with schema
      const validatedData = insertMessageSchema.parse(finalMessageData);
      
      // Create message in database
      const message = await storage.createMessage(validatedData);
      
      console.log("MessagingService: Message created successfully", message.id);
      return message;

    } catch (error) {
      console.error("MessagingService: Error sending message", error);
      throw error;
    }
  }

  /**
   * Gets all messages for a specific patient
   */
  async getPatientMessages(patientId: number): Promise<any[]> {
    try {
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        throw new Error("Patient not found");
      }

      const messages = await storage.getPatientMessages(patientId);
      return messages;
    } catch (error) {
      console.error("MessagingService: Error getting patient messages", error);
      throw error;
    }
  }

  /**
   * Gets all messages for a specific provider
   */
  async getProviderMessages(providerId: number): Promise<any[]> {
    try {
      const provider = await storage.getProvider(providerId);
      if (!provider) {
        throw new Error("Provider not found");
      }

      const messages = await storage.getProviderMessages(providerId);
      return messages;
    } catch (error) {
      console.error("MessagingService: Error getting provider messages", error);
      throw error;
    }
  }

  /**
   * Marks a message as read
   */
  async markMessageAsRead(messageId: number, userId: number, userType: 'patient' | 'provider'): Promise<boolean> {
    try {
      console.log("MessagingService: Marking message as read", { messageId, userId, userType });
      const success = await storage.markMessageAsRead(messageId);
      return success;
    } catch (error) {
      console.error("MessagingService: Error marking message as read", error);
      return false;
    }
  }
}

export const messagingService = new MessagingService();