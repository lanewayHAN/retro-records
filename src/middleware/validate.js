export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = new Error(
        result.error.issues[0].message
      );

      error.name = "ValidationError";
      error.status = 400;

      return next(error);
    }

    req.body = result.data;
    next();
  };
}