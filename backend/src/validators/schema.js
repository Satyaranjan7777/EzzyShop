/**
 * Strict Schema Validation Engine
 * Enforces strict type, length, format, and structure checking.
 * Rejects any non-conforming input and disallowed extra properties.
 */

// Common Regex Patterns
export const REGEX_PATTERNS = {
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
  PHONE_INDIAN: /^(?:(?:\+|0{0,2})91[\s\-]?)?(?:0[\s\-]?)?[6-9](?:[\s\-]?\d){9}$/,
  PINCODE_INDIAN: /^[1-9][0-9]{5}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HTTP_URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
};

/**
 * Base Schema class
 */
class BaseSchema {
  constructor() {
    this._isOptional = false;
    this._isNullable = false;
    this._customValidators = [];
  }

  optional() {
    this._isOptional = true;
    return this;
  }

  nullable() {
    this._isNullable = true;
    return this;
  }

  refine(fn, message) {
    this._customValidators.push({ fn, message });
    return this;
  }

  _checkNullOrUndefined(value, path, errors) {
    if (value === undefined) {
      if (!this._isOptional) {
        errors.push(`Field '${path}' is required`);
        return { shouldStop: true };
      }
      return { shouldStop: true };
    }
    if (value === null) {
      if (!this._isNullable) {
        errors.push(`Field '${path}' cannot be null`);
        return { shouldStop: true };
      }
      return { shouldStop: true };
    }
    return { shouldStop: false };
  }

  _runCustomValidators(value, path, errors) {
    for (const { fn, message } of this._customValidators) {
      try {
        const isValid = fn(value);
        if (!isValid) {
          errors.push(typeof message === "function" ? message(value, path) : (message || `Field '${path}' failed validation`));
        }
      } catch (err) {
        errors.push(err.message || `Field '${path}' failed custom validation`);
      }
    }
  }
}

/**
 * String Schema with strict type, length, and format rules
 */
class StringSchema extends BaseSchema {
  constructor() {
    super();
    this._min = undefined;
    this._max = undefined;
    this._regex = undefined;
    this._regexMessage = undefined;
    this._allowEmpty = false;
  }

  min(length, message) {
    this._min = length;
    this._minMsg = message;
    return this;
  }

  max(length, message) {
    this._max = length;
    this._maxMsg = message;
    return this;
  }

  regex(pattern, message) {
    this._regex = pattern;
    this._regexMessage = message;
    return this;
  }

  allowEmpty(allowed = true) {
    this._allowEmpty = allowed;
    return this;
  }

  validate(value, path, errors) {
    const { shouldStop } = this._checkNullOrUndefined(value, path, errors);
    if (shouldStop) return;

    if (typeof value !== "string") {
      errors.push(`Field '${path}' must be a string, received ${typeof value}`);
      return;
    }

    const trimmed = value.trim();

    if (!this._allowEmpty && trimmed.length === 0) {
      errors.push(`Field '${path}' cannot be empty or whitespace only`);
      return;
    }

    if (this._min !== undefined && trimmed.length < this._min) {
      errors.push(
        this._minMsg ||
          `Field '${path}' must be at least ${this._min} character${this._min > 1 ? "s" : ""} long`
      );
    }

    if (this._max !== undefined && trimmed.length > this._max) {
      errors.push(
        this._maxMsg ||
          `Field '${path}' cannot exceed ${this._max} characters`
      );
    }

    if (this._regex && !this._regex.test(trimmed)) {
      errors.push(this._regexMessage || `Field '${path}' has an invalid format`);
    }

    this._runCustomValidators(trimmed, path, errors);
  }
}

/**
 * Number Schema with strict type, finite, integer, and range rules
 */
class NumberSchema extends BaseSchema {
  constructor() {
    super();
    this._min = undefined;
    this._max = undefined;
    this._isInt = false;
    this._allowStringCoercion = false;
  }

  int(message) {
    this._isInt = true;
    this._intMsg = message;
    return this;
  }

  min(minVal, message) {
    this._min = minVal;
    this._minMsg = message;
    return this;
  }

  max(maxVal, message) {
    this._max = maxVal;
    this._maxMsg = message;
    return this;
  }

  allowNumericString() {
    this._allowStringCoercion = true;
    return this;
  }

  validate(value, path, errors) {
    const { shouldStop } = this._checkNullOrUndefined(value, path, errors);
    if (shouldStop) return;

    let num = value;
    if (this._allowStringCoercion && typeof value === "string" && value.trim() !== "") {
      num = Number(value);
    }

    if (typeof num !== "number" || Number.isNaN(num) || !Number.isFinite(num)) {
      errors.push(`Field '${path}' must be a valid finite number, received ${typeof value}`);
      return;
    }

    if (this._isInt && !Number.isInteger(num)) {
      errors.push(this._intMsg || `Field '${path}' must be an integer`);
      return;
    }

    if (this._min !== undefined && num < this._min) {
      errors.push(this._minMsg || `Field '${path}' must be at least ${this._min}`);
    }

    if (this._max !== undefined && num > this._max) {
      errors.push(this._maxMsg || `Field '${path}' cannot exceed ${this._max}`);
    }

    this._runCustomValidators(num, path, errors);
  }
}

/**
 * Boolean Schema
 */
class BooleanSchema extends BaseSchema {
  constructor() {
    super();
    this._allowStringCoercion = false;
  }

  allowBooleanString() {
    this._allowStringCoercion = true;
    return this;
  }

  validate(value, path, errors) {
    const { shouldStop } = this._checkNullOrUndefined(value, path, errors);
    if (shouldStop) return;

    let bool = value;
    if (this._allowStringCoercion && typeof value === "string") {
      if (value === "true") bool = true;
      else if (value === "false") bool = false;
    }

    if (typeof bool !== "boolean") {
      errors.push(`Field '${path}' must be a boolean (true or false), received ${typeof value}`);
      return;
    }

    this._runCustomValidators(bool, path, errors);
  }
}

/**
 * Enum Schema
 */
class EnumSchema extends BaseSchema {
  constructor(allowedValues, message) {
    super();
    if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
      throw new Error("EnumSchema requires a non-empty array of allowed values");
    }
    this._allowed = allowedValues;
    this._message = message;
  }

  validate(value, path, errors) {
    const { shouldStop } = this._checkNullOrUndefined(value, path, errors);
    if (shouldStop) return;

    if (!this._allowed.includes(value)) {
      errors.push(
        this._message ||
          `Field '${path}' must be one of: [${this._allowed.map((v) => `'${v}'`).join(", ")}], received '${value}'`
      );
      return;
    }

    this._runCustomValidators(value, path, errors);
  }
}

/**
 * Array Schema with strict item checking and length bounds
 */
class ArraySchema extends BaseSchema {
  constructor(itemSchema) {
    super();
    this._itemSchema = itemSchema;
    this._min = undefined;
    this._max = undefined;
  }

  min(len, message) {
    this._min = len;
    this._minMsg = message;
    return this;
  }

  max(len, message) {
    this._max = len;
    this._maxMsg = message;
    return this;
  }

  validate(value, path, errors) {
    const { shouldStop } = this._checkNullOrUndefined(value, path, errors);
    if (shouldStop) return;

    if (!Array.isArray(value)) {
      errors.push(`Field '${path}' must be an array, received ${typeof value}`);
      return;
    }

    if (this._min !== undefined && value.length < this._min) {
      errors.push(
        this._minMsg || `Array '${path}' must contain at least ${this._min} item(s)`
      );
    }

    if (this._max !== undefined && value.length > this._max) {
      errors.push(
        this._maxMsg || `Array '${path}' cannot contain more than ${this._max} item(s)`
      );
    }

    if (this._itemSchema) {
      value.forEach((item, index) => {
        this._itemSchema.validate(item, `${path}[${index}]`, errors);
      });
    }

    this._runCustomValidators(value, path, errors);
  }
}

/**
 * Object Schema with strict property checking (disallows unexpected extra fields)
 */
class ObjectSchema extends BaseSchema {
  constructor(shape = {}) {
    super();
    this._shape = shape;
    this._strict = true;
    this._minKeys = undefined;
  }

  passthrough() {
    this._strict = false;
    return this;
  }

  strict(isStrict = true) {
    this._strict = isStrict;
    return this;
  }

  minKeys(count, message) {
    this._minKeys = count;
    this._minKeysMsg = message;
    return this;
  }

  validate(value, path, errors) {
    const { shouldStop } = this._checkNullOrUndefined(value, path, errors);
    if (shouldStop) return;

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`Field '${path || "root"}' must be a plain object, received ${Array.isArray(value) ? "array" : typeof value}`);
      return;
    }

    const valueKeys = Object.keys(value);

    // Enforce minimum number of keys (useful for PATCH update schemas)
    if (this._minKeys !== undefined && valueKeys.length < this._minKeys) {
      errors.push(
        this._minKeysMsg ||
          `At least ${this._minKeys} field${this._minKeys > 1 ? "s" : ""} must be provided for update`
      );
    }

    // Strict mode: Reject unknown / unexpected fields
    if (this._strict) {
      const allowedKeys = new Set(Object.keys(this._shape));
      for (const key of valueKeys) {
        if (!allowedKeys.has(key)) {
          const fieldPath = path ? `${path}.${key}` : key;
          errors.push(`Unexpected field '${fieldPath}' is not allowed`);
        }
      }
    }

    // Validate defined shape
    for (const [key, fieldSchema] of Object.entries(this._shape)) {
      const fieldPath = path ? `${path}.${key}` : key;
      fieldSchema.validate(value[key], fieldPath, errors);
    }

    this._runCustomValidators(value, path, errors);
  }
}

/**
 * Request Schema wrapping body, params, and query validation
 */
class RequestSchema {
  constructor({ body, params, query } = {}) {
    this._bodySchema = body;
    this._paramsSchema = params;
    this._querySchema = query;
  }

  validate(req) {
    const errors = [];

    if (this._paramsSchema) {
      this._paramsSchema.validate(req.params || {}, "params", errors);
    }

    if (this._querySchema) {
      this._querySchema.validate(req.query || {}, "query", errors);
    }

    if (this._bodySchema) {
      this._bodySchema.validate(req.body || {}, "body", errors);
    }

    if (errors.length > 0) {
      return {
        error: errors[0],
        errors,
      };
    }

    return { error: null };
  }
}

/**
 * Public Schema Builder API
 */
export const schema = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: (itemSchema) => new ArraySchema(itemSchema),
  enum: (allowed, msg) => new EnumSchema(allowed, msg),
  object: (shape) => new ObjectSchema(shape),
  request: (options) => new RequestSchema(options),

  // Semantic Shortcuts
  objectId: (message) =>
    new StringSchema()
      .regex(REGEX_PATTERNS.OBJECT_ID, message || "Invalid ID format: must be a 24-character hexadecimal ObjectId")
      .min(24)
      .max(24),

  email: (message) =>
    new StringSchema()
      .min(5)
      .max(254, "Email address cannot exceed 254 characters")
      .regex(REGEX_PATTERNS.EMAIL, message || "Invalid email address format"),

  phone: (message) =>
    new StringSchema()
      .min(10)
      .max(15)
      .regex(
        REGEX_PATTERNS.PHONE_INDIAN,
        message || "Invalid phone number: must be a valid 10-digit Indian phone number"
      ),

  pincode: (message) =>
    new StringSchema()
      .min(6)
      .max(6)
      .regex(REGEX_PATTERNS.PINCODE_INDIAN, message || "Invalid pincode: must be a 6-digit Indian PIN code"),

  url: (message) =>
    new StringSchema()
      .min(10)
      .max(1000, "URL cannot exceed 1000 characters")
      .regex(REGEX_PATTERNS.HTTP_URL, message || "Invalid URL: must be a valid http or https URL"),

  slug: (message) =>
    new StringSchema()
      .min(2)
      .max(80)
      .regex(REGEX_PATTERNS.SLUG, message || "Invalid slug: only lowercase alphanumeric characters and hyphens are allowed"),
};

export default schema;
