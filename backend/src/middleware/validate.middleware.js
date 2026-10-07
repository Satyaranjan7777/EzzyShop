import ApiError from "../utils/ApiError.js";

/**
 * Middleware factory for request validation using schemas (e.g. Zod or custom validator functions)
 * @param {Object} schema - Validation schema or function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema) {
        return next();
      }

      // If schema has a safeParse method (Zod schema)
      if (typeof schema.safeParse === "function") {
        const result = schema.safeParse({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        if (!result.success) {
          const errors = result.error.errors.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );
          return next(new ApiError(400, errors[0] || "Validation failed", errors));
        }

        // Assign sanitized / validated values if present
        if (result.data) {
          if (result.data.body) req.body = result.data.body;
          if (result.data.query) req.query = result.data.query;
          if (result.data.params) req.params = result.data.params;
        }

        return next();
      }

      // If schema has a validate method (our strict Schema / RequestSchema instance)
      if (schema && typeof schema.validate === "function") {
        const result = schema.validate(req);
        if (result && result.error) {
          return next(
            new ApiError(400, result.error, result.errors || [result.error])
          );
        }
        return next();
      }

      // If schema is a direct validation function
      if (typeof schema === "function") {
        const validationResult = schema(req);
        if (validationResult && validationResult.error) {
          return next(
            new ApiError(
              400,
              validationResult.error,
              validationResult.errors || [validationResult.error]
            )
          );
        }
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
