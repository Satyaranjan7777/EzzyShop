import schema from "./schema.js";

/**
 * Validate that a route parameter (e.g. req.params.id) is a strict 24-character hexadecimal ObjectId
 */
export const validateParamId = (paramName = "id") => {
  const paramSchema = schema.object({
    [paramName]: schema.objectId(`Invalid ${paramName} parameter: must be a 24-character hexadecimal ObjectId`),
  }).passthrough(); // allows other route params if present

  return (req) => {
    const errors = [];
    paramSchema.validate(req.params || {}, "params", errors);
    if (errors.length > 0) {
      return { error: errors[0], errors };
    }
    return { error: null };
  };
};

export const idParamValidator = validateParamId("id");
export const productIdParamValidator = validateParamId("productId");

export default {
  validateParamId,
  idParamValidator,
  productIdParamValidator,
};
