import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'
import { takeCoverage } from 'v8'

const prisma = new PrismaClient()

// A `main` function so that we can use async/await
async function main() {
    await prisma.post.deleteMany({})
    await prisma.country.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.tag.deleteMany({})

    const grace = await prisma.user.create({
        data: {
          email: 'grace1@hey.com',
          firstName: 'Grace',
          lastName: 'Bell',
          social: {
            facebook: 'gracebell',
            twitter: 'therealgracebell',
          }, 
          bio: "hello world"
        },
       
    })

    const country = await prisma.country.create({
        data: {
            name: "Japan",
            countryDetail: "dkbiafliuglba;no;anoba",
            members: {
                create: {
                    role: "ADMIN",
                    user: {
                        connect: {
                            email: grace.email
                        }
                    }
                }
            }
        },
    })

    const shakuntala = await prisma.user.create({
        data: {
          email: 'devi@prisma.io',
          firstName: 'Shakuntala',
          lastName: 'Devi',
          bio: "shankshvbnsobgoboinviosb",
          countries: {
            create: {
              role: 'USER',
              country: {
                connect: { id: country.id },
              },
            },
          },
        },
      })
      
      const david = await prisma.user.create({
        data: {
          email: 'david@prisma.io',
          firstName: 'David',
          lastName: 'Deutsch',
          bio: "dlsnoisngosng",
          countries: {
            create: {
              role: 'USER',
              country: {
                connect: { id: country.id },
              },
            },
          },
        },
      })

    const tag = await prisma.tag.create({
        data: {
            name: "tag1"
        }
    })

    await prisma.post.create({
        data: {
           title: "Japan",
           text: "Kyoto",
           image_urls: "dflabgjoabgoena",
           user: {
               connect: {
                   email: david.email
               }
           },
           tag: {
               connect: {
                   id: tag.id
               }
           }
        }
    })
}

main()
  .catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect()
  })