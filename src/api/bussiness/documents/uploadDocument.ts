import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import supabase from '@/db/supabase';

const isDevelopment = process.env.NODE_ENV === 'development';

// Extend Express Request to include file from multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  stream: any;
  destination: string;
  filename: string;
  path: string;
}

interface MulterRequest extends Request {
  file?: MulterFile;
}

/**
 * Upload a document to Conduit Financial
 * 
 * Required fields:
 * - file: The file to upload (multipart/form-data)
 * - conduit_id: ID of the user uploading the document
 * - scope: 'transaction', 'counterparty', or 'customer'
 * - type: 'invoice' or 'contract'
 * 
 * Optional fields:
 * - purpose: 'transaction_justification' (required if scope is 'transaction')
 * 
 * Example request using curl:
 * curl -X POST http://localhost:3000/api/bussiness/documents/upload \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -F "file=@/path/to/invoice.pdf" \
 *   -F "conduit_id=user_123" \
 *   -F "scope=transaction" \
 *   -F "type=invoice" \
 *   -F "purpose=transaction_justification"
 */
export const uploadDocumentController = async (req: MulterRequest, res: Response): Promise<Response> => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide a file in the request.'
      });
    }

    // Extract fields from request body
    const { conduit_id, scope, type, purpose } = req.body;

    // Validate required fields
    if (!conduit_id) {
      return res.status(400).json({
        success: false,
        message: "Field 'conduit_id' is required"
      });
    }

    if (!scope) {
      return res.status(400).json({
        success: false,
        message: "Field 'scope' is required (transaction, counterparty, customer)"
      });
    }

    if (!['transaction', 'counterparty', 'customer'].includes(scope)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scope. Must be one of: transaction, counterparty, customer"
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Field 'type' is required (invoice, contract)"
      });
    }

    if (!['invoice', 'contract'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be one of: invoice, contract"
      });
    }

    // Validate purpose for transaction scope
    if (scope === 'transaction' && !purpose) {
      return res.status(400).json({
        success: false,
        message: "Field 'purpose' is required when scope is 'transaction'"
      });
    }

    if (purpose && purpose !== 'transaction_justification') {
      return res.status(400).json({
        success: false,
        message: "Invalid purpose. Must be: transaction_justification"
      });
    }

    // Get file information
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    if (isDevelopment) {
      console.log('Uploading document to Conduit:', {
        fileName,
        fileSize,
        mimeType,
        scope,
        type,
        purpose,
        conduit_id
      });
    }

    // Upload document to Conduit
    const conduitResponse = await conduitFinancial.uploadDocument(
      fileBuffer,
      fileName,
      scope,
      type,
      purpose
    );

    if (isDevelopment) {
      console.log('Document uploaded to Conduit:', conduitResponse);
    }

    // Save document record in database
    const { data: savedDocument, error: saveError } = await supabase
      .from('conduit_documents')
      .insert({
        document_id: conduitResponse.id,
        conduit_id: conduit_id,
        scope: scope,
        type: type,
        purpose: purpose || null,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
      })
      .select('id, document_id, conduit_id, uploaded_at')
      .single();

    if (isDevelopment) {
      console.log('Document record saved in DB:', savedDocument);
    }

    if (saveError) {
      console.error('Error saving document record:', saveError);
      // Don't throw - we still want to return the document ID even if DB save fails
      return res.status(201).json({
        success: true,
        message: 'Document uploaded to Conduit but failed to save record in database',
        data: {
          document_id: conduitResponse.id,
          conduit_id: conduit_id,
        },
        warning: 'Database save failed',
        error: saveError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document_id: conduitResponse.id,
        conduit_id: conduit_id,
        file_name: fileName,
        file_size: fileSize,
        scope: scope,
        type: type,
        uploaded_at: savedDocument?.uploaded_at,
      }
    });

  } catch (error: any) {
    console.error('Error uploading document:', error);
    
    // Handle Conduit API errors
    if (error.response) {
      console.error('Conduit API error:', error.response.data);
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Failed to upload document to Conduit',
        error: error.response.data || error.message
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message || error
    });
  }
};
