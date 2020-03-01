class ClientError {
    constructor(code, description, internalError) {
        this.code = code;
        this.description = description;
        this.internalError = internalError;
    }

    toString() {
        return `ClientError[${this.code}] ${this.description} ${this.internalError && this.internalError.toString()}`
    }
}

exports.ClientError = ClientError;
