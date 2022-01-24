import { PrismaClient, TokenType } from "@prisma/client";
import { add } from "date-fns";
import express, { Request, Response } from "express"
import { debugSendEmailToken, sendEmailToken } from "../utils/email";
import { body, validationResult } from 'express-validator';
import jwt from'jsonwebtoken'

const router = express.Router();

const prisma = new PrismaClient()

router.post('/login',body('email').isEmail(), async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const emailToken = generateEmailToken()
    const tokenExpiration = add(new Date(), {
        minutes: 10,
    })

    try {
        await prisma.token.create({
          data: {
            emailToken,
            type: TokenType.EMAIL,
            expiration: tokenExpiration,
            user: {
              connectOrCreate: {
                create: {
                  email,
                },
                where: {
                  email,
                },
              },
            },
          },
        })
    
        // 👇 send the email token
        //sendEmailToken(email, emailToken)
        debugSendEmailToken(email, emailToken)
        return res.json({
            msg: "login successed"
        })
      } catch (error) {
        return res.json({
            msg: "Failed"
        }) 
      }
})

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SECRET'

const JWT_ALGORITHM = 'HS256'

const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 12

router.post('/authenticate', body('email').isEmail(), body('emailToken').isString(), async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, emailToken } = req.body;
    
    try {
        // Get short lived email token
        const fetchedEmailToken = await prisma.token.findUnique({
          where: {
            emailToken: emailToken,
          },
          include: {
            user: true,
          },
        })
    
        if (!fetchedEmailToken?.valid) {
          // If the token doesn't exist or is not valid, return 401 unauthorized
          return res.json({
            msg: "Error1"
        })
        }
    
        if (fetchedEmailToken.expiration < new Date()) {
          // If the token has expired, return 401 unauthorized
          return res.json({
            msg: "Error2"
        })
        }
    
        // If token matches the user email passed in the payload, generate long lived API token
        if (fetchedEmailToken?.user?.email === email) {
          const tokenExpiration = add(new Date(), {
            hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS,
          })
          // Persist token in DB so it's stateful
          const createdToken = await prisma.token.create({
            data: {
              type: TokenType.API,
              expiration: tokenExpiration,
              user: {
                connect: {
                  email,
                },
              },
            },
          })
    
          // Invalidate the email token after it's been used
          await prisma.token.update({
            where: {
              id: fetchedEmailToken.id,
            },
            data: {
              valid: false,
            },
          })
    
          const authToken = generateAuthToken(createdToken.id)
          return res.status(200).header('Authorization', authToken).json({
              msg: "Success"
          })
        } else {
          return res.json({
              msg: "Error3"
          })
        }
      } catch (error) {
        return res.json({
            msg: "Error4"
        })
      }
    
})

function generateEmailToken(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString()
}

function generateAuthToken(tokenId: number): string {
    const jwtPayload = { tokenId }
  
    return jwt.sign(jwtPayload, JWT_SECRET, {
      algorithm: JWT_ALGORITHM,
      noTimestamp: true,
    })
}

export { router as userRouter }