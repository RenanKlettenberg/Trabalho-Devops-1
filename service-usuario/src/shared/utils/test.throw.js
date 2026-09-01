import AppError from "../../infrastructure/errors/app.error.js";

async function captureAppError(callback) {
    try {
        return await callback()
    } catch (error) {
        if (error instanceof AppError) {
            return { status: error.status, code: error.code, message: error.message }
        } 
        if (error.name == "ZodError") {
            return JSON.parse(error.message);
        } 
        throw error;
    }
}

export default captureAppError;