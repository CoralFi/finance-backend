import supabase from "../../supabase.js";

/**
 * Transform draft data from database format to API response format
 */
function transformDraftData(draft) {
    return {
        id: draft.kyb_draft_id,
        userId: draft.user_id,
        currentStep: draft.current_step,
        businessDetails: draft.business_details,
        completionPercentage: draft.completion_percentage,
        updatedAt: draft.updated_at,
        createdAt: draft.created_at
    };
}

/**
 * Calculate completion percentage based on current step
 * KYB has 8 steps total with the first step beginning at 0 so there are 9 steps in total
 */
function calculateCompletionPercentage(currentStep, businessDetails) {
    const totalSteps = 9;
    const basePercentage = (currentStep / totalSteps) * 100;
    
    // Round to nearest integer
    return Math.round(basePercentage);
}

/**
 * Validate draft data
 */
function validateDraftData(data) {
    if (!data.current_step || typeof data.current_step !== 'number') {
        return { isValid: false, message: 'current_step es requerido y debe ser un número' };
    }
    
    if (data.current_step < 0 || data.current_step > 9) {
        return { isValid: false, message: 'current_step debe estar entre 0 y 9' };
    }
    
    if (!data.business_details || typeof data.business_details !== 'object') {
        return { isValid: false, message: 'business_details es requerido y debe ser un objeto' };
    }
    
    return { isValid: true };
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { userId } = req.query;
    
    // Validate customerId
    if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
            success: false,
            message: 'ID de cliente inválido',
            data: null
        });
        return;
    }


    try {
        // GET - Retrieve draft
        if (req.method === 'GET') {
            console.log(`GET KYB draft for customer ${userId}`);
            
            const { data: draft, error } = await supabase
                .from('kyb_drafts')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                // If no draft found, return null data (not an error)
                if (error.code === 'PGRST116') {
                    console.log(`ℹNo draft found for customer ${userId}`);
                    res.status(200).json({
                        success: true,
                        message: 'No hay borrador guardado',
                        data: null
                    });
                    return;
                }
                
                console.error(' Error fetching draft:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el borrador',
                    data: null
                });
                return;
            }

            console.log(`Draft found for customer ${userId}`);
            res.status(200).json({
                success: true,
                message: 'Borrador obtenido exitosamente',
                data: transformDraftData(draft)
            });
            return;
        }

        // POST - Save/Update draft
        if (req.method === 'POST') {
            console.log(`POST KYB draft for customer ${userId}`);
            
            const { current_step, business_details, completion_percentage } = req.body;

            // Validate input
            const validation = validateDraftData({ current_step, business_details });
            if (!validation.isValid) {
                console.log(`Validation failed: ${validation.message}`);
                res.status(400).json({
                    success: false,
                    message: validation.message,
                    data: null
                });
                return;
            }

            // Calculate completion percentage if not provided
            const calculatedPercentage = completion_percentage ?? 
                calculateCompletionPercentage(current_step, business_details);

            // Check if draft already exists
            const { data: existingDraft } = await supabase
                .from('kyb_drafts')
                .select('kyb_draft_id')
                .eq('user_id', userId)
                .single();

            let result;
            
            if (existingDraft) {
                // Update existing draft
                console.log(`Updating existing draft for customer ${userId}`);
                const { data: updatedDraft, error } = await supabase
                    .from('kyb_drafts')
                    .update({
                        current_step,
                        business_details,
                        completion_percentage: calculatedPercentage,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating draft:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Error al actualizar el borrador',
                        data: null
                    });
                    return;
                }

                result = updatedDraft;
            } else {
                // Create new draft
                console.log(`Creating new draft for customer ${userId}`);
                const { data: newDraft, error } = await supabase
                    .from('kyb_drafts')
                    .insert({
                        user_id: userId,
                        current_step,
                        business_details,
                        completion_percentage: calculatedPercentage
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error creating draft:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Error al crear el borrador',
                        data: null
                    });
                    return;
                }

                result = newDraft;
            }

            console.log(`Draft saved successfully for customer ${userId} (Step ${current_step}, ${calculatedPercentage}% complete)`);
            res.status(200).json({
                success: true,
                message: 'Borrador guardado exitosamente',
                data: transformDraftData(result)
            });
            return;
        }

        // DELETE - Clear draft
        if (req.method === 'DELETE') {
            console.log(`DELETE KYB draft for customer ${userId}`);
            
            const { error } = await supabase
                .from('kyb_drafts')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting draft:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el borrador',
                    data: null
                });
                return;
            }

            console.log(`Draft deleted successfully for customer ${userId}`);
            res.status(200).json({
                success: true,
                message: 'Borrador eliminado exitosamente',
                data: null
            });
            return;
        }

        // Method not allowed
        res.status(405).json({
            success: false,
            message: 'Método no permitido',
            data: null
        });

    } catch (error) {
        console.error('❌ Unexpected error in draft API:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            data: null
        });
    }
}
