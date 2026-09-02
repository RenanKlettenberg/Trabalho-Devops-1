class AppError extends Error {
    constructor(response) {
        super(response.message)
        this.code = response.code;
        this.status = response.status || "200";
        this.payload = response.payload ?? "";
    }
}

export default AppError;