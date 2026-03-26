export class ErrorCode extends Error {
   status: number;

   constructor(message: string, status: number/*, code?: AuthErrorCode*/) {
      super(message);
      this.name = "ErrorCode";
      this.status = status;
   }
}
