const Joi = require("joi")

module.exports.valSc = (Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    description: Joi.string().required()
}).required())

module.exports.reviewSc = Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required()
}).required()