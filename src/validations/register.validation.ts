import joi from 'joi';

export const registerValidation=(user:object)=>{
    const createUserScehma=joi.object({
        name:joi.string().required(),
        password:joi.string().required(),
        email:joi.string().email().required(),
        mobile:joi.string().required()

    })
    .options({abortEarly:true});
    return createUserScehma.validate(user);
}